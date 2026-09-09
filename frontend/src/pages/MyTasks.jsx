
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ListChecks,
    RefreshCw,
    CheckCircle2,
    ArrowRight
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
    getOffboardings
} from "../services/offboardingService";

import {
    getWorkflowDetails
} from "../services/workflowService";

import TaskCard from "../components/TaskCard";
import { isPendingTaskForUser } from "../utils/taskOwnership";

function MyTasks() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [tasks, setTasks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getOffboardings();

            const offboardings =
                response.offboardings || [];

            const activeCases =
                offboardings.filter(
                    (item) =>
                        item.status === "INITIATED" ||
                        item.status === "IN_PROGRESS"
                );

            const results =
                await Promise.all(
                    activeCases.map(
                        async (offboarding) => {

                            try {

                                const workflowId =
                                    offboarding
                                        .workflowInstance?._id ||
                                    offboarding
                                        .workflowInstance;

                                if (!workflowId) {
                                    return [];
                                }

                                const workflowResponse =
                                    await getWorkflowDetails(
                                        workflowId
                                    );

                                const workflow = workflowResponse.workflow;

                                return workflowResponse.tasks
                                    .filter(
                                        (task) =>
                                            isPendingTaskForUser(
                                                task,
                                                user
                                            )
                                    )
                                    .map(
                                        (task) => ({
                                            ...task,

                                            workflowId:
                                                workflow._id,

                                            offboardingId:
                                                offboarding._id,

                                            employee:
                                                offboarding.employee
                                        })
                                    );

                            } catch {
                                return [];
                            }
                        }
                    )
                );

            setTasks(
                results.flat()
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your tasks."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [user?.id]);

    const handleTaskComplete = () => {
        loadTasks();
    };

    if (loading) {
        return (
            <div className="page-loading">
                <span className="spinner" />
                <p>
                    Loading your tasks...
                </p>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <p className="eyebrow">
                        MY WORK
                    </p>

                    <h1>
                        My Tasks
                    </h1>

                    <p className="page-description">
                        Review and approve clearance tasks
                        assigned to you.
                    </p>
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={loadTasks}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>

            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="task-page-summary">

                <div className="task-count-card">

                    <div className="task-count-icon">
                        <ListChecks size={22} />
                    </div>

                    <div>
                        <strong>
                            {tasks.length}
                        </strong>

                        <span>
                            Pending approvals
                        </span>
                    </div>

                </div>

            </div>

            {tasks.length === 0 ? (

                <div className="card">

                    <div className="empty-state large">

                        <div className="success-icon">
                            <CheckCircle2 size={38} />
                        </div>

                        <h2>
                            You're all caught up
                        </h2>

                        <p>
                            There are currently no offboarding
                            approvals assigned to you.
                        </p>

                        <button
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate(
                                    "/offboardings"
                                )
                            }
                        >
                            View Offboarding Cases
                            <ArrowRight size={17} />
                        </button>

                    </div>

                </div>

            ) : (

                <div className="task-stack">

                    {tasks.map(
                        (task) => (

                            <div
                                className="task-page-item"
                                key={task._id}
                            >

                                <div className="task-context">

                                    <div>
                                        <span>
                                            Employee
                                        </span>

                                        <strong>
                                            {
                                                task.employee
                                                    ?.name
                                            }
                                        </strong>
                                    </div>

                                    <button
                                        className="text-button"
                                        onClick={() =>
                                            navigate(
                                                `/offboardings/${task.offboardingId}`
                                            )
                                        }
                                    >
                                        View case
                                        <ArrowRight
                                            size={15}
                                        />
                                    </button>

                                </div>

                                <TaskCard
                                    task={task}
                                    onComplete={handleTaskComplete}
                                />

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
}

export default MyTasks;
