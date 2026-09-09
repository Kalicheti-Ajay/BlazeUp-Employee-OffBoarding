const Offboarding = require("../models/Offboarding");
const Employee = require("../models/Employee");
const WorkflowTemplate = require("../models/WorkflowTemplate");
const { startWorkflow, createAuditLog } = require("../services/workflowService");
const ClearanceTask = require("../models/ClearanceTask");
const Notification = require("../models/Notification");


const createOffboarding = async (req, res) => {

    try {

        const {
            employeeId,
            resignationDate,
            lastWorkingDay,
            reason
        } = req.body;


        if (
            !employeeId ||
            !resignationDate ||
            !lastWorkingDay
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "employeeId, resignationDate and lastWorkingDay are required"
            });
        }


        const employee =
            await Employee.findById(employeeId);


        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }


        if (employee.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message:
                    "Employee has already been offboarded"
            });
        }

        const resignation = new Date(resignationDate);
        const lwd = new Date(lastWorkingDay);
        if (Number.isNaN(resignation.valueOf()) || Number.isNaN(lwd.valueOf()) || lwd < resignation) {
            return res.status(400).json({ success: false, message: "Last working day must be on or after a valid resignation date" });
        }


        const existingOffboarding =
            await Offboarding.findOne({
                employee: employeeId,
                status: {
                    $in: [
                        "INITIATED",
                        "IN_PROGRESS"
                    ]
                }
            });


        if (existingOffboarding) {
            return res.status(400).json({
                success: false,
                message:
                    "Active offboarding already exists for this employee"
            });
        }


        const offboarding =
            await Offboarding.create({

                employee: employeeId,

                resignationDate,

                lastWorkingDay,

                reason: reason || "",

                status: "INITIATED",

                initiatedBy: req.user.id

            });

        const template = await WorkflowTemplate.findOne({ process: "OFFBOARDING", isActive: true });
        if (!template) {
            await Offboarding.findByIdAndDelete(offboarding._id);
            return res.status(400).json({ success: false, message: "No active OFFBOARDING workflow template is configured" });
        }

        const workflow = await startWorkflow({ templateId: template._id, offboardingId: offboarding._id, initiatedBy: req.user.id });


        res.status(201).json({

            success: true,

            message:
                "Offboarding created successfully",

            offboarding: await Offboarding.findById(offboarding._id), workflow

        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }
};


const getOffboardings = async (req, res) => {

    try {

        const offboardings =
            await Offboarding.find()
                .populate(
                    "employee",
                    "employeeId name email department designation joiningDate reportingManager status"
                )
                .populate(
                    "initiatedBy",
                    "name email role"
                )
                .sort({
                    createdAt: -1
                });


        res.json({

            success: true,

            offboardings

        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }
};


const getOffboarding = async (req, res) => {

    try {

        const offboarding =
            await Offboarding.findById(
                req.params.id
            )
                .populate(
                    "employee",
                    "employeeId name email department designation joiningDate reportingManager status"
                )
                .populate(
                    "initiatedBy",
                    "name email role"
                )
                .populate(
                    "workflowInstance"
                );


        if (!offboarding) {

            return res.status(404).json({

                success: false,

                message: "Offboarding record not found"

            });

        }


        res.json({

            success: true,

            offboarding

        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }
};


const sendReminder = async (req, res) => {
    try {
        const offboarding = await Offboarding.findById(req.params.id);
        if (!offboarding?.workflowInstance) return res.status(400).json({ success: false, message: "No active workflow exists for this case" });
        const tasks = await ClearanceTask.find({ workflowInstance: offboarding.workflowInstance, status: "PENDING" });
        if (!tasks.length) return res.status(400).json({ success: false, message: "There are no pending tasks to remind" });
        await Promise.all(tasks.map(task => Notification.create({ recipient: task.assignedTo, title: "Offboarding reminder", message: "A clearance task is awaiting your action.", type: "REMINDER", referenceId: offboarding._id })));
        await createAuditLog({ process: "OFFBOARDING", referenceId: offboarding._id, action: "REMINDER_SENT", description: `Reminder sent for ${tasks.length} pending task(s)`, performedBy: req.user.id, role: req.user.role });
        res.json({ success: true, message: "Reminder sent" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
    createOffboarding,
    getOffboardings,
    getOffboarding,
    sendReminder
};
