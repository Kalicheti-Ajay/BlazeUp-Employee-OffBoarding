import React from "react";
import StatusBadge from "./StatusBadge";

function WorkflowTimeline({
    workflow,
    tasks = []
}) {
    if (!workflow) {
        return (
            <div className="empty-state">
                Workflow information is not available.
            </div>
        );
    }

    const stages = workflow.template?.stages || [];

    return (
        <div className="workflow-timeline">
            {stages.map((stage, index) => {
                const stageTasks = tasks.filter(
                    (task) =>
                        task.stageName === stage.name
                );

                const approved =
                    stageTasks.length > 0 &&
                    stageTasks.every(
                        (task) =>
                            task.status === "APPROVED"
                    );

                const rejected =
                    stageTasks.some(
                        (task) =>
                            task.status === "REJECTED"
                    );

                const active =
                    stageTasks.some(
                        (task) =>
                            task.status === "PENDING"
                    );

                let stageStatus = "WAITING";

                if (rejected) {
                    stageStatus = "REJECTED";
                } else if (approved) {
                    stageStatus = "COMPLETED";
                } else if (active) {
                    stageStatus = "PENDING";
                }

                return (
                    <div
                        className="workflow-stage"
                        key={`${stage.name}-${index}`}
                    >
                        <div className="workflow-stage-marker">
                            <div className="workflow-stage-number">
                                {index + 1}
                            </div>

                            {index <
                                stages.length - 1 && (
                                <div className="workflow-stage-line" />
                            )}
                        </div>

                        <div className="workflow-stage-content">
                            <div className="workflow-stage-header">
                                <div>
                                    <h3>
                                        {stage.name}
                                    </h3>

                                    <p>
                                        {stage.role}
                                    </p>
                                </div>

                                <StatusBadge
                                    status={stageStatus}
                                />
                            </div>

                            {stage.executionType ===
                                "PARALLEL" && (
                                <span className="parallel-label">
                                    Parallel approval
                                </span>
                            )}

                            {stageTasks.length > 0 && (
                                <div className="workflow-stage-tasks">
                                    {stageTasks.map(
                                        (task) => (
                                            <div
                                                className="workflow-task-row"
                                                key={task._id}
                                            >
                                                <span>
                                                    {task.assignedTo
                                                        ?.name ||
                                                        task.role}
                                                </span>

                                                <StatusBadge
                                                    status={
                                                        task.status
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default WorkflowTimeline;