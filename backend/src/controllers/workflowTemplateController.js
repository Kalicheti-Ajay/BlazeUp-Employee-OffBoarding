const WorkflowTemplate =
    require("../models/WorkflowTemplate");


const createWorkflowTemplate =
    async (req, res) => {

        try {

            const template =
                await WorkflowTemplate.create(
                    req.body
                );


            res.status(201).json({
                success: true,
                message:
                    "Workflow template created",
                template
            });


        } catch (error) {

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };


const getWorkflowTemplates =
    async (req, res) => {

        try {

            const templates =
                await WorkflowTemplate.find()
                    .sort({
                        createdAt: -1
                    });


            res.json({
                success: true,
                templates
            });


        } catch (error) {

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

const updateWorkflowTemplate = async (req, res) => {
    try {
        const template = await WorkflowTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!template) return res.status(404).json({ success: false, message: "Workflow template not found" });
        res.json({ success: true, template, message: "Workflow template updated" });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};


module.exports = {
    createWorkflowTemplate,
    getWorkflowTemplates,
    updateWorkflowTemplate
};
