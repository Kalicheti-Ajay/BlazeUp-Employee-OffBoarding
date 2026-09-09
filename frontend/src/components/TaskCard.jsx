import React, { useState } from "react";
import {
    CheckCircle2,
    XCircle,
    ClipboardCheck
} from "lucide-react";

import { approveTask, rejectTask, revokeAccess } from "../services/workflowService";
import { useAuth } from "../context/AuthContext";
import { isPendingTaskForUser } from "../utils/taskOwnership";

function TaskCard({
    task,
    onComplete
}) {
    const { user } = useAuth();
    const canAct = isPendingTaskForUser(task, user);
    const [checklist, setChecklist] = useState(
        task.checklist || []
    );

    const [remarks, setRemarks] = useState(
        task.remarks || ""
    );

    const [loading, setLoading] = useState(false);

    const toggleChecklist = (index) => {
        setChecklist((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          completed:
                              !item.completed
                      }
                    : item
            )
        );
    };

    const handleApprove = async () => {
        try {
            setLoading(true);

            await approveTask(task._id, { remarks, checklist });

            onComplete?.();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Unable to approve task"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            if (!remarks.trim()) {
                alert(
                    "Please enter remarks before rejecting."
                );
                return;
            }

            setLoading(true);

            await rejectTask(task._id, { remarks });

            onComplete?.();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Unable to reject task"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="task-card">
            <div className="task-card-header">
                <div>
                    <div className="task-card-title">
                        <ClipboardCheck size={20} />

                        <h3>
                            {task.stageName}
                        </h3>
                    </div>

                    <p className="task-card-role">
                        {task.role}
                    </p>

                    <p className="muted">
                        Assigned to: {task.assignedTo?.name || task.role}
                        {" · "}{task.status}
                    </p>
                </div>
            </div>

            <div className="task-checklist">
                <h4>Clearance Checklist</h4>

                {checklist.length === 0 ? (
                    <p className="muted">
                        No checklist items.
                    </p>
                ) : (
                    checklist.map(
                        (item, index) => (
                            <label
                                className="checklist-item"
                                key={index}
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        item.completed
                                    }
                                    onChange={() =>
                                        toggleChecklist(
                                            index
                                        )
                                    }
                                />

                                <span>
                                    {item.label}

                                    {item.required ? (
                                        <strong>
                                            {" "}(required)
                                        </strong>
                                    ) : (
                                        <em> (optional)</em>
                                    )}
                                </span>
                            </label>
                        )
                    )
                )}
            </div>

            <div className="task-remarks">
                <label>
                    Remarks
                </label>

                <textarea
                    value={remarks}
                    onChange={(event) =>
                        setRemarks(
                            event.target.value
                        )
                    }
                    placeholder="Add remarks..."
                    rows={4}
                />
            </div>

            {canAct && task.role === "ADMIN" && (
                <div className="task-checklist">
                    <h4>Access Revocation</h4>
                    {["Email", "System", "VPN", "Application", "Other"].map((accessType) => {
                        const revoked = task.accessRevocations?.some(item => item.accessType === accessType && item.status === "REVOKED");
                        return <button className="btn btn-secondary" style={{ marginRight: 8, marginBottom: 8 }} disabled={loading || revoked} key={accessType} onClick={async () => { try { setLoading(true); await revokeAccess(task._id, accessType); onComplete?.(); } catch (error) { alert(error.response?.data?.message || "Unable to record revocation"); } finally { setLoading(false); } }}>{revoked ? `✓ ${accessType} revoked` : `Revoke ${accessType}`}</button>;
                    })}
                </div>
            )}

            {canAct ? <div className="task-actions">
                <button
                    className="btn btn-danger"
                    onClick={handleReject}
                    disabled={loading}
                >
                    <XCircle size={18} />
                    Reject
                </button>

                <button
                    className="btn btn-primary"
                    onClick={handleApprove}
                    disabled={loading}
                >
                    <CheckCircle2 size={18} />
                    {loading
                        ? "Processing..."
                        : "Approve"}
                </button>
            </div> : <p className="muted">
                This task is not currently actionable for your account.
            </p>}
        </div>
    );
}

export default TaskCard;
