const mongoose = require("mongoose");

const workflowStageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        role: {
            type: String,
            required: true
        },

        executionType: {
            type: String,
            enum: ["SEQUENTIAL", "PARALLEL"],
            default: "SEQUENTIAL"
        },

        groupId: {
            type: String
        },

        order: {
            type: Number,
            required: true
        },

        checklist: [
            {
                label: String,
                required: Boolean
            }
        ]
    }
);

const workflowTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        process: {
            type: String,
            required: true,
            unique: true
        },

        stages: [workflowStageSchema],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "WorkflowTemplate",
    workflowTemplateSchema
);