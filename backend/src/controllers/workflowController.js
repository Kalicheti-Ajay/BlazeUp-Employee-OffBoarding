const {
    startWorkflow,
    approveTask,
    rejectTask,
    revokeAccess,
    getWorkflowDetails
} = require("../services/workflowService");


/*
    Start workflow
*/
const startWorkflowController = async (req, res) => {

    try {

        const {
            templateId,
            offboardingId
        } = req.body;


        if (!templateId || !offboardingId) {

            return res.status(400).json({
                success: false,
                message:
                    "templateId and offboardingId are required"
            });
        }


        const workflow =
            await startWorkflow({
                templateId,
                offboardingId,
                initiatedBy: req.user.id
            });


        res.status(201).json({
            success: true,
            message:
                "Workflow started successfully",
            workflow
        });


    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


/*
    Approve task
*/
const approveTaskController = async (req, res) => {

    try {

        const {
            remarks,
            checklist
        } = req.body;


        const result =
            await approveTask({

                taskId: req.params.taskId,

                userId: req.user.id,

                remarks,

                checklist
            });


        res.json({
            success: true,
            ...result
        });


    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


/*
    Reject task
*/
const rejectTaskController = async (req, res) => {

    try {

        const {
            remarks
        } = req.body;


        const result =
            await rejectTask({

                taskId: req.params.taskId,

                userId: req.user.id,

                remarks
            });


        res.json({
            success: true,
            ...result
        });


    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


/*
    Get workflow details
*/
const getWorkflowDetailsController =
    async (req, res) => {

        try {

            const result =
                await getWorkflowDetails(
                    req.params.id
                );


            // Stable workflow-details contract consumed by every task UI.
            // `tasks` are actual ClearanceTask instances, not template stages.
            res.json({
                success: true,
                workflow: result.workflow,
                tasks: result.tasks,
                auditLogs: result.auditLogs
            });


        } catch (error) {

            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    };

const revokeAccessController = async (req, res) => {
    try {
        const task = await revokeAccess({ taskId: req.params.taskId, userId: req.user.id, accessType: req.body.accessType });
        res.json({ success: true, task, message: "Access revocation recorded" });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


module.exports = {
    startWorkflowController,
    approveTaskController,
    rejectTaskController,
    revokeAccessController,
    getWorkflowDetailsController
};
