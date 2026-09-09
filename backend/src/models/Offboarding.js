const mongoose = require("mongoose");

const offboardingSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        resignationDate: {
            type: Date,
            required: true
        },

        lastWorkingDay: {
            type: Date,
            required: true
        },

        reason: {
            type: String
        },

        status: {
            type: String,
            enum: [
                "INITIATED",
                "IN_PROGRESS",
                "COMPLETED",
                "REJECTED",
                "CANCELLED"
            ],
            default: "INITIATED"
        },

        workflowInstance: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkflowInstance"
        },

        initiatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        completedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Offboarding", offboardingSchema);