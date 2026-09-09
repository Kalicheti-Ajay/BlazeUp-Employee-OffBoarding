const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        process: {
            type: String,
            required: true
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        action: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        role: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);