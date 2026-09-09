import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Users,
    ClipboardList,
    CheckCircle2,
    Clock3,
    ArrowRight,
    Plus,
    RefreshCw
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

import {
    getEmployees
} from "../services/employeeService";

import {
    getOffboardings
} from "../services/offboardingService";

import {
    getWorkflowDetails
} from "../services/workflowService";

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [employees, setEmployees] = useState([]);
    const [offboardings, setOffboardings] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = async (isRefresh = false) => {
        try {
            setError("");

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [
                employeeResponse,
                offboardingResponse
            ] = await Promise.all([
                getEmployees(),
                getOffboardings()
            ]);

            const employeeData =
                employeeResponse.employees || [];

            const offboardingData =
                offboardingResponse.offboardings || [];

            setEmployees(employeeData);
            setOffboardings(offboardingData);

            const activeCases =
                offboardingData.filter(
                    (item) =>
                        item.status === "INITIATED" ||
                        item.status === "IN_PROGRESS"
                );

            const workflowResults =
                await Promise.all(
                    activeCases.map(async (item) => {
                        try {
                            const workflowId =
                                item.workflowInstance?._id ||
                                item.workflowInstance;

                            if (!workflowId) {
                                return null;
                            }

                            const response =
                                await getWorkflowDetails(
                                    workflowId
                                );

                            return { ...response.workflow, tasks: response.tasks || [] };
                        } catch {
                            return null;
                        }
                    })
                );

            const tasks = [];

            workflowResults
                .filter(Boolean)
                .forEach((workflow) => {
                    (workflow.tasks || [])
                        .filter(
                            (task) =>
                                task.status === "PENDING" &&
                                String(
                                    task.assignedTo?._id ||
                                    task.assignedTo
                                ) === String(user?.id)
                        )
                        .forEach((task) => {
                            tasks.push({
                                ...task,
                                workflowId: workflow._id,
                                referenceId:
                                    workflow.referenceId
                            });
                        });
                });

            setPendingTasks(tasks);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const activeCases =
        offboardings.filter(
            (item) =>
                item.status === "INITIATED" ||
                item.status === "IN_PROGRESS"
        ).length;

    const completedCases =
        offboardings.filter(
            (item) =>
                item.status === "COMPLETED"
        ).length;

    const recentCases =
        offboardings.slice(0, 5);

    if (loading) {
        return (
            <div className="page-loading">
                <span className="spinner" />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <p className="eyebrow">
                        OVERVIEW
                    </p>

                    <h1>Dashboard</h1>

                    <p className="page-description">
                        Track employee offboarding activity,
                        approvals and workflow progress.
                    </p>
                </div>

                <div className="header-actions">

                    <button
                        className="btn btn-secondary"
                        onClick={() => loadDashboard(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    {user?.role === "HR_ADMIN" && (
                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                navigate(
                                    "/offboardings/new"
                                )
                            }
                        >
                            <Plus size={18} />
                            New Offboarding
                        </button>
                    )}

                </div>

            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="stats-grid">

                <StatCard
                    title="Total Employees"
                    value={employees.length}
                    icon={<Users size={21} />}
                    description="Employees in the system"
                />

                <StatCard
                    title="Active Offboarding"
                    value={activeCases}
                    icon={<ClipboardList size={21} />}
                    description="Cases currently in progress"
                />

                <StatCard
                    title="My Pending Tasks"
                    value={pendingTasks.length}
                    icon={<Clock3 size={21} />}
                    description="Approvals waiting for you"
                />

                <StatCard
                    title="Completed"
                    value={completedCases}
                    icon={<CheckCircle2 size={21} />}
                    description="Successfully completed cases"
                />

            </div>

            <div className="dashboard-grid">

                <section className="card">

                    <div className="card-header">

                        <div>
                            <h2>Recent Offboarding</h2>
                            <p>
                                Latest employee offboarding cases
                            </p>
                        </div>

                        <button
                            className="text-button"
                            onClick={() =>
                                navigate("/offboardings")
                            }
                        >
                            View all
                            <ArrowRight size={15} />
                        </button>

                    </div>

                    {recentCases.length === 0 ? (
                        <div className="empty-state">
                            <ClipboardList size={32} />
                            <h3>No offboarding cases</h3>
                            <p>
                                New cases will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="case-list">

                            {recentCases.map((item) => (

                                <button
                                    key={item._id}
                                    className="case-row"
                                    onClick={() =>
                                        navigate(
                                            `/offboardings/${item._id}`
                                        )
                                    }
                                >

                                    <div className="case-avatar">
                                        {item.employee?.name
                                            ?.charAt(0)
                                            ?.toUpperCase()}
                                    </div>

                                    <div className="case-info">

                                        <strong>
                                            {item.employee?.name}
                                        </strong>

                                        <span>
                                            {
                                                item.employee
                                                    ?.employeeId
                                            }{" "}
                                            •{" "}
                                            {
                                                item.employee
                                                    ?.department
                                            }
                                        </span>

                                    </div>

                                    <StatusBadge
                                        status={item.status}
                                    />

                                    <ArrowRight
                                        size={17}
                                        className="case-arrow"
                                    />

                                </button>

                            ))}

                        </div>
                    )}

                </section>

                <section className="card">

                    <div className="card-header">

                        <div>
                            <h2>My Tasks</h2>
                            <p>
                                Approvals requiring your action
                            </p>
                        </div>

                        <button
                            className="text-button"
                            onClick={() =>
                                navigate("/tasks")
                            }
                        >
                            Open tasks
                            <ArrowRight size={15} />
                        </button>

                    </div>

                    {pendingTasks.length === 0 ? (
                        <div className="empty-state compact">
                            <CheckCircle2 size={30} />
                            <h3>You're all caught up</h3>
                            <p>
                                No approvals are waiting for you.
                            </p>
                        </div>
                    ) : (
                        <div className="task-summary-list">

                            {pendingTasks
                                .slice(0, 4)
                                .map((task) => (

                                    <div
                                        className="task-summary"
                                        key={task._id}
                                    >

                                        <div className="task-icon">
                                            <Clock3 size={17} />
                                        </div>

                                        <div>
                                            <strong>
                                                {task.stageName}
                                            </strong>

                                            <span>
                                                Approval required
                                            </span>
                                        </div>

                                    </div>

                                ))}

                        </div>
                    )}

                </section>

            </div>

        </div>
    );
}

export default Dashboard;
