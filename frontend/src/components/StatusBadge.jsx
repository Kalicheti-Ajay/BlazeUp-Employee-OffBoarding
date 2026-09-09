import React from "react";

function StatusBadge({ status }) {
    const normalizedStatus =
        String(status || "")
            .toUpperCase()
            .replace(/_/g, " ");

    const getClassName = () => {
        switch (status) {
            case "COMPLETED":
            case "APPROVED":
            case "ACTIVE":
                return "status-badge success";

            case "IN_PROGRESS":
            case "PENDING":
            case "INITIATED":
                return "status-badge warning";

            case "REJECTED":
            case "CANCELLED":
                return "status-badge danger";

            case "WAITING":
            case "NOT_STARTED":
                return "status-badge neutral";

            default:
                return "status-badge neutral";
        }
    };

    return (
        <span className={getClassName()}>
            <span className="status-dot"></span>
            {normalizedStatus || "UNKNOWN"}
        </span>
    );
}

export default StatusBadge;