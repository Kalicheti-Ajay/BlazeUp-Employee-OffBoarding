const mongoose = require("mongoose");

const workflowInstanceSchema = new mongoose.Schema(
    {
        template: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkflowTemplate",
            required: true
        },

        process: {
            type: String,
            required: true
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Offboarding",
            required: true
        },

        status: {
            type: String,
            enum: [
                "NOT_STARTED",
                "IN_PROGRESS",
                "COMPLETED",
                "REJECTED"
            ],
            default: "NOT_STARTED"
        },

        currentStage: {
            type: Number,
            default: 1
        },

        initiatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "WorkflowInstance",
        workflowInstanceSchema
    );