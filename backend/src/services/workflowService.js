const WorkflowTemplate =
    require("../models/WorkflowTemplate");

const WorkflowInstance =
    require("../models/WorkflowInstance");

const Offboarding =
    require("../models/Offboarding");

const Employee =
    require("../models/Employee");

const ClearanceTask =
    require("../models/ClearanceTask");

const AuditLog =
    require("../models/AuditLog");

const Notification =
    require("../models/Notification");

const User =
    require("../models/User");


// =====================================================
// FIND APPROVER
// =====================================================

const findApprover = async (role, employee) => {

    // Reporting Manager is taken from employee record
    if (role === "REPORTING_MANAGER") {

        if (!employee.reportingManager) {
            throw new Error(
                "Reporting manager is not assigned to this employee"
            );
        }

        const manager =
            await User.findOne({
                _id: employee.reportingManager,
                role: "REPORTING_MANAGER",
                isActive: true
            });

        if (!manager) {
            throw new Error(
                "Active reporting manager not found"
            );
        }

        return manager;
    }


    // Other roles use the provisioned default approver.  Falling back keeps
    // existing installations working until an approver is explicitly marked.
    const approver =
        await User.findOne({
            role,
            isActive: true,
            isWorkflowApprover: true
        }) || await User.findOne({
            role,
            isActive: true
        }).sort({ updatedAt: -1 });

    if (!approver) {
        throw new Error(
            `No active user found for role: ${role}`
        );
    }

    return approver;
};


// =====================================================
// CREATE AUDIT LOG
// =====================================================

const createAuditLog = async ({
    process,
    referenceId,
    action,
    description,
    performedBy,
    role
}) => {

    await AuditLog.create({
        process,
        referenceId,
        action,
        description,
        performedBy,
        role
    });
};


// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async ({
    recipient,
    title,
    message,
    type,
    referenceId
}) => {

    await Notification.create({
        recipient,
        title,
        message,
        type,
        referenceId
    });
};


// =====================================================
// ACTIVATE STAGE
// =====================================================

const activateStage = async (
    workflowInstance,
    employee,
    order
) => {

    const stages =
        workflowInstance.template.stages
            .filter(stage => stage.order === order);


    if (stages.length === 0) {
        return;
    }


    for (const stage of stages) {

        // Find the person responsible for this stage
        const approver =
            await findApprover(
                stage.role,
                employee
            );


        // Create checklist while preserving
        // required / optional information
        const checklist =
            stage.checklist.map(item => ({
                label: item.label,
                required: item.required !== false,
                completed: false
            }));


        // Create clearance task
        const task =
            await ClearanceTask.create({
                workflowInstance:
                    workflowInstance._id,

                stageName:
                    stage.name,

                role:
                    stage.role,

                assignedTo:
                    approver._id,

                status:
                    "PENDING",

                checklist
            });


        // Notify approver
        await createNotification({
            recipient:
                approver._id,

            title:
                "New Clearance Task",

            message:
                `You have a new clearance task: ${stage.name}`,

            type:
                "WORKFLOW",

            referenceId:
                workflowInstance.referenceId
        });


        // Audit
        await createAuditLog({
            process:
                workflowInstance.process,

            referenceId:
                workflowInstance.referenceId,

            action:
                "STAGE_ACTIVATED",

            description:
                `${stage.name} assigned to ${approver.name}`,

            performedBy:
                workflowInstance.initiatedBy,

            role:
                approver.role
        });
    }


    workflowInstance.currentStage =
        order;

    workflowInstance.status =
        "IN_PROGRESS";

    await workflowInstance.save();
};


// =====================================================
// START WORKFLOW
// =====================================================

const startWorkflow = async ({
    templateId,
    offboardingId,
    initiatedBy
}) => {

    // Find workflow template
    const template =
        await WorkflowTemplate.findOne({
            _id: templateId,
            isActive: true
        });

    if (!template) {
        throw new Error(
            "Active workflow template not found"
        );
    }


    // Find offboarding
    const offboarding =
        await Offboarding.findById(
            offboardingId
        );

    if (!offboarding) {
        throw new Error(
            "Offboarding record not found"
        );
    }


    // Find employee
    const employee =
        await Employee.findById(
            offboarding.employee
        );

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }


    // Prevent duplicate active workflow
    const existingWorkflow =
        await WorkflowInstance.findOne({
            referenceId: offboardingId,
            status: {
                $in: [
                    "NOT_STARTED",
                    "IN_PROGRESS"
                ]
            }
        });

    if (existingWorkflow) {
        throw new Error(
            "Active workflow already exists for this offboarding"
        );
    }


    // Create workflow instance
    const workflowInstance =
        await WorkflowInstance.create({
            template:
                template._id,

            process:
                template.process,

            referenceId:
                offboardingId,

            status:
                "NOT_STARTED",

            currentStage:
                1,

            initiatedBy
        });


    // We need the template stages in memory
    workflowInstance.template =
        template;


    // Activate first stage
    const firstOrder = Math.min(...template.stages.map(stage => stage.order));
    await activateStage(workflowInstance, employee, firstOrder);


    // Link workflow to offboarding
    offboarding.workflowInstance =
        workflowInstance._id;

    offboarding.status =
        "IN_PROGRESS";

    await offboarding.save();


    // Audit workflow start
    await createAuditLog({
        process:
            workflowInstance.process,

        referenceId:
            offboardingId,

        action:
            "WORKFLOW_STARTED",

        description:
            "Employee offboarding workflow started",

        performedBy:
            initiatedBy,

        role:
            "HR_ADMIN"
    });


    return workflowInstance;
};


// =====================================================
// APPROVE TASK
// =====================================================

const approveTask = async ({
    taskId,
    userId,
    remarks,
    checklist
}) => {

    // Find task
    const task =
        await ClearanceTask.findById(
            taskId
        );

    if (!task) {
        throw new Error(
            "Clearance task not found"
        );
    }


    // Task must be pending
    if (task.status !== "PENDING") {
        throw new Error(
            "This task is no longer pending"
        );
    }


    // Only assigned user can approve
    if (
        task.assignedTo.toString()
        !== userId.toString()
    ) {
        throw new Error(
            "You are not assigned to this task"
        );
    }


    // Update checklist if supplied
    if (checklist) {
        task.checklist = task.checklist.map((item, index) => ({
            label: item.label,
            required: item.required,
            completed: checklist[index]?.completed === true
        }));
    }


    // Only REQUIRED checklist items
    // should block approval
    const incompleteRequiredItems =
        task.checklist.filter(item =>
            item.required === true &&
            item.completed !== true
        );


    if (
        incompleteRequiredItems.length > 0
    ) {

        throw new Error(
            "All required checklist items must be completed"
        );
    }


    // Approve task
    task.status =
        "APPROVED";

    task.remarks =
        remarks || "";

    task.actionAt =
        new Date();

    await task.save();


    // Get workflow
    const workflow =
        await WorkflowInstance.findById(
            task.workflowInstance
        ).populate("template");


    if (!workflow) {
        throw new Error(
            "Workflow instance not found"
        );
    }


    // Get offboarding
    const offboarding =
        await Offboarding.findById(
            workflow.referenceId
        );


    // Audit approval
    await createAuditLog({
        process:
            workflow.process,

        referenceId:
            workflow.referenceId,

        action:
            "CLEARANCE_APPROVED",

        description:
            `${task.stageName} approved`,

        performedBy:
            userId,

        role:
            task.role
    });


    // Find all tasks for current stage
    const currentStageTasks =
        await ClearanceTask.find({
            workflowInstance:
                workflow._id
        });


    const currentStage =
        workflow.currentStage;


    const tasksInCurrentStage =
        currentStageTasks.filter(
            item => {

                // Find corresponding stage
                const stage =
                    workflow.template.stages
                        .find(stage =>
                            stage.name === item.stageName
                        );

                return (
                    stage &&
                    stage.order === currentStage
                );
            }
        );


    // Check whether all tasks
    // in current stage are approved
    const allApproved =
        tasksInCurrentStage.every(
            item =>
                item.status === "APPROVED"
        );


    if (!allApproved) {

        return workflow;
    }


    // Find next workflow order
    const nextOrders =
        workflow.template.stages
            .map(stage => stage.order)
            .filter(order =>
                order > currentStage
            );


    const uniqueOrders =
        [...new Set(nextOrders)]
            .sort((a, b) => a - b);


    // No more stages
    if (uniqueOrders.length === 0) {

        workflow.status =
            "COMPLETED";

        await workflow.save();


        if (offboarding) {

            offboarding.status =
                "COMPLETED";

            offboarding.completedAt =
                new Date();

            await offboarding.save();
            await Employee.findByIdAndUpdate(offboarding.employee, { status: "OFFBOARDED" });
        }


        await createAuditLog({
            process:
                workflow.process,

            referenceId:
                workflow.referenceId,

            action:
                "WORKFLOW_COMPLETED",

            description:
                "Employee offboarding workflow completed",

            performedBy:
                userId,

            role:
                task.role
        });


        return workflow;
    }


    // Activate next stage
    const nextOrder =
        uniqueOrders[0];


    // Employee needed for approver lookup
    const employee =
        await Employee.findById(
            offboarding.employee
        );


    workflow.template =
        workflow.template;


    await activateStage(
        workflow,
        employee,
        nextOrder
    );


    return workflow;
};


// =====================================================
// REJECT TASK
// =====================================================

const rejectTask = async ({
    taskId,
    userId,
    remarks
}) => {

    // Find task
    const task =
        await ClearanceTask.findById(
            taskId
        );

    if (!task) {
        throw new Error(
            "Clearance task not found"
        );
    }


    // Task must be pending
    if (task.status !== "PENDING") {
        throw new Error(
            "This task is no longer pending"
        );
    }


    // Only assigned user can reject
    if (
        task.assignedTo.toString()
        !== userId.toString()
    ) {
        throw new Error(
            "You are not assigned to this task"
        );
    }


    if (!remarks || remarks.trim().length < 3) {
        throw new Error("A meaningful rejection remark is required");
    }

    // Reject task
    task.status =
        "REJECTED";

    task.remarks =
        remarks || "";

    task.actionAt =
        new Date();

    await task.save();


    // Get workflow
    const workflow =
        await WorkflowInstance.findById(
            task.workflowInstance
        );


    if (!workflow) {
        throw new Error(
            "Workflow instance not found"
        );
    }


    // Reject workflow
    workflow.status =
        "REJECTED";

    await workflow.save();


    // Get offboarding
    const offboarding =
        await Offboarding.findById(
            workflow.referenceId
        );


    if (offboarding) {

        offboarding.status =
            "REJECTED";

        await offboarding.save();
    }


    // Audit rejection
    await createAuditLog({
        process:
            workflow.process,

        referenceId:
            workflow.referenceId,

        action:
            "CLEARANCE_REJECTED",

        description:
            `${task.stageName} rejected: ${remarks || "No remarks provided"}`,

        performedBy:
            userId,

        role:
            task.role
    });


    // Notify HR
    const hrUser = await findApprover("HR_ADMIN");


    if (hrUser) {

        await createNotification({
            recipient:
                hrUser._id,

            title:
                "Offboarding Rejected",

            message:
                `${task.stageName} was rejected`,

            type:
                "WORKFLOW",

            referenceId:
                workflow.referenceId
        });
    }


    return workflow;
};


const revokeAccess = async ({ taskId, userId, accessType }) => {
    if (!accessType) throw new Error("Access type is required");
    const task = await ClearanceTask.findById(taskId);
    if (!task) throw new Error("Clearance task not found");
    if (task.role !== "ADMIN" || task.assignedTo.toString() !== userId.toString()) throw new Error("Only the assigned Admin approver can revoke access");
    if (task.status !== "PENDING") throw new Error("Access can only be recorded for a pending Admin task");
    const item = task.accessRevocations.find(entry => entry.accessType === accessType);
    if (item?.status === "REVOKED") throw new Error("This access has already been revoked");
    if (item) { item.status = "REVOKED"; item.revokedAt = new Date(); item.revokedBy = userId; }
    else task.accessRevocations.push({ accessType, status: "REVOKED", revokedAt: new Date(), revokedBy: userId });
    await task.save();
    const workflow = await WorkflowInstance.findById(task.workflowInstance);
    await createAuditLog({ process: workflow.process, referenceId: workflow.referenceId, action: "ACCESS_REVOKED", description: `${accessType} access revoked`, performedBy: userId, role: "ADMIN" });
    return task;
};

// =====================================================
// GET WORKFLOW DETAILS
// =====================================================

const getWorkflowDetails =
    async (workflowId) => {

        const workflow =
            await WorkflowInstance.findById(
                workflowId
            )
                .populate("template")
                .populate(
                    "initiatedBy",
                    "name email role"
                );


        if (!workflow) {
            throw new Error(
                "Workflow instance not found"
            );
        }


        const tasks =
            await ClearanceTask.find({
                workflowInstance:
                    workflowId
            })
                .populate(
                    "assignedTo",
                    "name email role"
                )
                .sort({
                    createdAt: 1
                });


        const auditLogs =
            await AuditLog.find({
                referenceId:
                    workflow.referenceId
            })
                .populate(
                    "performedBy",
                    "name email role"
                )
                .sort({
                    createdAt: 1
                });


        return {
            workflow,
            tasks,
            auditLogs
        };
    };


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    findApprover,
    createAuditLog,
    createNotification,
    activateStage,
    startWorkflow,
    approveTask,
    rejectTask,
    revokeAccess,
    getWorkflowDetails
};
