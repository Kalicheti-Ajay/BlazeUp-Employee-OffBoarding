const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: [
                "HR_ADMIN",
                "REPORTING_MANAGER",
                "ADMIN",
                "ACCOUNTS",
                "PERSONNEL"
            ],
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        // A role can have more than one user.  This identifies the user who
        // should receive role-based workflow tasks when no employee-specific
        // assignee (such as a reporting manager) exists.
        isWorkflowApprover: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
