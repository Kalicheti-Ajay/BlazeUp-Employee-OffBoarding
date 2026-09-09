const mongoose = require("mongoose");

const clearanceTaskSchema = new mongoose.Schema(
    {
        workflowInstance: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkflowInstance",
            required: true
        },

        stageName: {
            type: String,
            required: true
        },

        role: {
            type: String,
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: [
                "WAITING",
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],
            default: "WAITING"
        },

        checklist: [
            {
                label: {
                    type: String,
                    required: true
                },

                required: {
                    type: Boolean,
                    default: true
                },

                completed: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        remarks: {
            type: String,
            default: ""
        },

        actionAt: {
            type: Date
        },

        accessRevocations: [{
            accessType: { type: String, required: true },
            status: { type: String, enum: ["PENDING", "REVOKED"], default: "PENDING" },
            revokedAt: Date,
            revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        }]
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "ClearanceTask",
        clearanceTaskSchema
    );
