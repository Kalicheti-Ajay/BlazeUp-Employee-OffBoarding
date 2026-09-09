import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    Building2,
    BriefcaseBusiness,
    Mail,
    UserRound,
    RefreshCw,
    FileText
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
    getOffboarding
} from "../services/offboardingService";
import { sendReminder } from "../services/offboardingService";

import {
    getWorkflowDetails
} from "../services/workflowService";

import StatusBadge from "../components/StatusBadge";
import WorkflowTimeline from "../components/WorkflowTimeline";
import TaskCard from "../components/TaskCard";
import { isPendingTaskForUser } from "../utils/taskOwnership";


function OffboardingDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const { user } = useAuth();

    const [offboarding, setOffboarding] =
        useState(null);

    const [workflow, setWorkflow] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
     * Load offboarding + workflow details
     */
    const loadDetails = async () => {

        try {

            setLoading(true);
            setError("");

            /*
             * ------------------------------------------------
             * 1. Get offboarding record
             * ------------------------------------------------
             */

            const response =
                await getOffboarding(id);

            /*
             * IMPORTANT:
             *
             * offboardingService already returns
             * response.data.
             *
             * Therefore we use:
             *
             * response.offboarding
             *
             * NOT:
             *
             * response.data.offboarding
             */

            const record =
                response.offboarding;


            if (!record) {

                throw new Error(
                    "Offboarding record not found."
                );

            }


            setOffboarding(record);


            /*
             * ------------------------------------------------
             * 2. Get workflow instance ID
             * ------------------------------------------------
             *
             * Depending on MongoDB response,
             * workflowInstance can be:
             *
             * {
             *     id: "..."
             * }
             *
             * or
             *
             * {
             *     _id: "..."
             * }
             *
             * or directly:
             *
             * "..."
             *
             */

            const workflowId =
                record.workflowInstance?.id ||
                record.workflowInstance?._id ||
                record.workflowInstance;


            /*
             * ------------------------------------------------
             * 3. Load workflow details
             * ------------------------------------------------
             */

            if (workflowId) {

                const workflowResponse =
                    await getWorkflowDetails(
                        workflowId
                    );


                /*
                 * IMPORTANT:
                 *
                 * workflowService already returns
                 * response.data.
                 *
                 * Therefore:
                 *
                 * workflowResponse.workflow
                 *
                 * NOT:
                 *
                 * workflowResponse.data.workflow
                 */

                setWorkflow({
                    ...workflowResponse.workflow,
                    tasks: workflowResponse.tasks,
                    auditLogs: workflowResponse.auditLogs
                });

            } else {

                setWorkflow(null);

            }

        } catch (err) {

            console.error(
                "Unable to load offboarding details:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load offboarding details."
            );

        } finally {

            setLoading(false);

        }

    };


    /*
     * Load when page opens
     */
    useEffect(() => {

        if (id) {

            loadDetails();

        }

    }, [id]);


    /*
     * Refresh after task approval/rejection
     */
    const handleTaskComplete = () => {

        loadDetails();

    };


    /*
     * Loading state
     */
    if (loading) {

        return (

            <div className="page-loading">

                <span className="spinner" />

                <p>
                    Loading offboarding details...
                </p>

            </div>

        );

    }


    /*
     * Error state
     */
    if (error || !offboarding) {

        return (

            <div className="page-container">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/offboardings")
                    }
                >

                    <ArrowLeft size={17} />

                    Back to Offboarding

                </button>


                <div className="alert alert-error">

                    {error ||
                        "Offboarding record not found."}

                </div>

            </div>

        );

    }


    /*
     * Find tasks assigned to current user
     */
    const myTasks = workflow?.tasks?.filter((task) =>
        isPendingTaskForUser(task, user)
    ) || [];


    return (

        <div className="page-container">


            {/* ============================================
                TOP BAR
            ============================================ */}

            <div className="detail-topbar">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/offboardings")
                    }
                >

                    <ArrowLeft size={17} />

                    Back

                </button>


                <button
                    className="btn btn-secondary"
                    onClick={loadDetails}
                >

                    <RefreshCw size={16} />

                    Refresh

                </button>

                {user?.role === "HR_ADMIN" && offboarding.status === "IN_PROGRESS" && <button className="btn btn-secondary" onClick={async () => { try { const result = await sendReminder(id); alert(result.message); } catch (err) { alert(err.response?.data?.message || "Unable to send reminder"); } }}>Send Reminder</button>}

            </div>



            {/* ============================================
                PAGE HEADER
            ============================================ */}

            <div className="page-header">

                <div>

                    <div className="title-with-status">


                        <div className="large-avatar">

                            {
                                offboarding.employee
                                    ?.name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                            }

                        </div>


                        <div>

                            <p className="eyebrow">
                                OFFBOARDING CASE
                            </p>


                            <h1>

                                {
                                    offboarding.employee
                                        ?.name
                                }

                            </h1>


                            <p className="page-description">

                                {
                                    offboarding.employee
                                        ?.employeeId
                                }

                                {" "}

                                •{" "}

                                {
                                    offboarding.employee
                                        ?.designation
                                }

                            </p>

                        </div>


                    </div>

                </div>


                <StatusBadge
                    status={
                        offboarding.status
                    }
                />

            </div>



            {/* ============================================
                EMPLOYEE + EXIT DETAILS
            ============================================ */}

            <div className="detail-grid">


                {/* ----------------------------------------
                    EMPLOYEE INFORMATION
                ----------------------------------------- */}

                <section className="card">

                    <div className="card-header">

                        <div>

                            <h2>
                                Employee Information
                            </h2>

                            <p>
                                Employee details from HROS.
                            </p>

                        </div>


                        <UserRound size={20} />

                    </div>


                    <div className="detail-info-grid">


                        <InfoItem
                            icon={
                                <UserRound size={17} />
                            }
                            label="Employee"
                            value={
                                offboarding.employee
                                    ?.name
                            }
                        />


                        <InfoItem
                            icon={
                                <Mail size={17} />
                            }
                            label="Email"
                            value={
                                offboarding.employee
                                    ?.email
                            }
                        />


                        <InfoItem
                            icon={
                                <Building2 size={17} />
                            }
                            label="Department"
                            value={
                                offboarding.employee
                                    ?.department
                            }
                        />


                        <InfoItem
                            icon={
                                <BriefcaseBusiness
                                    size={17}
                                />
                            }
                            label="Designation"
                            value={
                                offboarding.employee
                                    ?.designation
                            }
                        />

                    </div>

                </section>



                {/* ----------------------------------------
                    EXIT DETAILS
                ----------------------------------------- */}

                <section className="card">

                    <div className="card-header">

                        <div>

                            <h2>
                                Exit Details
                            </h2>

                            <p>
                                Resignation and final
                                working information.
                            </p>

                        </div>


                        <CalendarDays size={20} />

                    </div>


                    <div className="detail-info-grid">


                        <InfoItem
                            icon={
                                <CalendarDays
                                    size={17}
                                />
                            }
                            label="Resignation Date"
                            value={
                                formatDate(
                                    offboarding.resignationDate
                                )
                            }
                        />


                        <InfoItem
                            icon={
                                <CalendarDays
                                    size={17}
                                />
                            }
                            label="Last Working Day"
                            value={
                                formatDate(
                                    offboarding.lastWorkingDay
                                )
                            }
                        />


                        <InfoItem
                            icon={
                                <FileText size={17} />
                            }
                            label="Reason"
                            value={
                                offboarding.reason ||
                                "Not provided"
                            }
                        />

                    </div>

                </section>

            </div>



            {/* ============================================
                WORKFLOW
            ============================================ */}

            {workflow ? (

                <>


                    {/* ------------------------------------
                        WORKFLOW TIMELINE
                    ------------------------------------- */}

                    <section className="card workflow-card">

                        <div className="card-header">

                            <div>

                                <h2>
                                    Approval Workflow
                                </h2>

                                <p>
                                    Track every stage,
                                    approval and decision.
                                </p>

                            </div>


                            <div className="workflow-progress">

                                <span>

                                    Stage{" "}

                                    {
                                        workflow.currentStage
                                    }

                                </span>

                            </div>

                        </div>


                        <WorkflowTimeline
                            workflow={workflow}
                            tasks={
                                workflow.tasks || []
                            }
                            auditLogs={
                                workflow.auditLogs || []
                            }
                        />

                    </section>



                    {/* ------------------------------------
                        CURRENT USER TASKS
                    ------------------------------------- */}

                    {myTasks.length > 0 && (

                        <section className="card">

                            <div className="card-header">

                                <div>

                                    <h2>
                                        Action Required
                                    </h2>

                                    <p>
                                        This case requires
                                        your approval.
                                    </p>

                                </div>

                            </div>


                            <div className="task-stack">

                                {myTasks.map(
                                    (task) => (

                                        <TaskCard
                                            key={
                                                task._id
                                            }
                                            task={task}
                                            onComplete={
                                                handleTaskComplete
                                            }
                                        />

                                    )
                                )}

                            </div>

                        </section>

                    )}

                    {offboarding.status === "COMPLETED" && user?.role === "HR_ADMIN" && (
                        <section className="card">
                            <div className="card-header"><div><h2>Employee Documents</h2><p>Final clearance documents are ready to download.</p></div></div>
                            <div className="header-actions">
                                {[["resignation", "Resignation Acceptance Letter"], ["noc", "NOC / Clearance Certificate"], ["relieving", "Experience / Relieving Letter"]].map(([kind, label]) => <button className="btn btn-primary" key={kind} onClick={() => downloadDocument(kind)}>{label}</button>)}
                            </div>
                        </section>
                    )}

                    <section className="card">
                        <div className="card-header"><div><h2>Audit Timeline</h2><p>Every workflow action is recorded.</p></div></div>
                        <div className="case-list">{workflow.auditLogs?.length ? workflow.auditLogs.map(log => <div className="case-row" key={log._id}><div className="case-info"><strong>{log.action.replaceAll("_", " ")}</strong><span>{log.description} · {formatDate(log.createdAt)}</span></div><span>{log.performedBy?.name || log.role}</span></div>) : <p className="muted">No audit activity yet.</p>}</div>
                    </section>

                </>

            ) : (


                /* ----------------------------------------
                    NO WORKFLOW
                ----------------------------------------- */

                <div className="card">

                    <div className="empty-state">

                        <FileText size={35} />

                        <h3>
                            Workflow not started
                        </h3>

                        <p>
                            This offboarding record does
                            not have an active workflow
                            instance.
                        </p>

                    </div>

                </div>

            )}

        </div>

    );

}

async function downloadDocument(kind) {
    const token = localStorage.getItem("token");
    const id = window.location.pathname.split("/").pop();
    const response = await fetch(`http://localhost:5000/api/offboarding/${id}/documents/${kind}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) { const data = await response.json(); alert(data.message || "Unable to download document"); return; }
    const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = `${kind}.pdf`; link.click(); URL.revokeObjectURL(url);
}



/* ========================================================
   INFO ITEM
======================================================== */

function InfoItem({
    icon,
    label,
    value
}) {

    return (

        <div className="detail-info-item">


            <div className="detail-info-icon">

                {icon}

            </div>


            <div>

                <span>
                    {label}
                </span>


                <strong>
                    {value || "—"}
                </strong>

            </div>


        </div>

    );

}



/* ========================================================
   DATE FORMATTER
======================================================== */

function formatDate(value) {

    if (!value) {

        return "—";

    }


    return new Date(value).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


export default OffboardingDetails;
