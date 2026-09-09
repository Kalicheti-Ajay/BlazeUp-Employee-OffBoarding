import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import workflowService
    from "../services/workflowService";

import StatusBadge
    from "../components/StatusBadge";

import Loading
    from "../components/Loading";

import {
    useAuth
} from "../context/AuthContext";


function Workflow() {

    const {
        id
    } = useParams();

    const {
        user
    } = useAuth();


    const [
        data,
        setData
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        actionLoading,
        setActionLoading
    ] = useState(false);


    const [
        remarks,
        setRemarks
    ] = useState("");


    const load =
        async () => {

            try {

                const result =
                    await workflowService
                        .getWorkflow(id);

                setData(result);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }
        };


    useEffect(() => {
        load();
    }, [id]);


    if (loading) {
        return <Loading />;
    }


    if (!data) {
        return (
            <div className="empty-state">
                Workflow not found.
            </div>
        );
    }


    const workflow =
        data.workflow;


    const tasks =
        data.tasks || [];


    const auditLogs =
        data.auditLogs || [];


    const myPendingTask =
        tasks.find(
            task =>
                task.status === "PENDING"
                &&
                (
                    task.assignedTo?._id
                    === user?.id
                    ||
                    task.assignedTo?._id
                    === user?._id
                )
        );


    const updateChecklist = (
        taskId,
        index,
        checked
    ) => {

        setData(
            previous => {

                const updatedTasks =
                    previous.tasks.map(
                        task => {

                            if (
                                task._id
                                !== taskId
                            ) {
                                return task;
                            }


                            return {
                                ...task,

                                checklist:
                                    task.checklist.map(
                                        (
                                            item,
                                            itemIndex
                                        ) =>
                                            itemIndex === index
                                                ? {
                                                    ...item,
                                                    completed:
                                                        checked
                                                }
                                                : item
                                    )
                            };

                        }
                    );


                return {
                    ...previous,
                    tasks: updatedTasks
                };

            }
        );
    };


    const handleApprove =
        async () => {

            if (!myPendingTask) {
                return;
            }


            setActionLoading(true);


            try {

                const incomplete =
                    myPendingTask
                        .checklist
                        .filter(
                            item =>
                                item.required
                                &&
                                !item.completed
                        );


                if (
                    incomplete.length > 0
                ) {

                    alert(
                        "Please complete all required checklist items."
                    );

                    setActionLoading(false);

                    return;
                }


                await workflowService
                    .approveTask(
                        myPendingTask._id,
                        {
                            remarks,
                            checklist:
                                myPendingTask.checklist
                        }
                    );


                await load();

                setRemarks("");


            } catch (error) {

                alert(
                    error.response
                        ?.data
                        ?.message
                    || "Unable to approve task."
                );

            } finally {

                setActionLoading(false);

            }
        };


    const handleReject =
        async () => {

            if (!myPendingTask) {
                return;
            }


            if (!remarks.trim()) {

                alert(
                    "Please enter a reason before rejecting."
                );

                return;
            }


            setActionLoading(true);


            try {

                await workflowService
                    .rejectTask(
                        myPendingTask._id,
                        remarks
                    );


                await load();

                setRemarks("");


            } catch (error) {

                alert(
                    error.response
                        ?.data
                        ?.message
                    || "Unable to reject task."
                );

            } finally {

                setActionLoading(false);

            }
        };


    return (
        <div>

            <div className="page-header">

                <div>

                    <Link
                        to="/tasks"
                        className="back-link"
                    >
                        ← Back to Tasks
                    </Link>

                    <h1>
                        Offboarding Workflow
                    </h1>

                    <p>
                        Review the approval chain
                        and clearance history.
                    </p>

                </div>


                <StatusBadge
                    status={workflow.status}
                />

            </div>


            <section className="panel workflow-progress">

                <div className="panel-header">

                    <div>
                        <h2>
                            Approval Progress
                        </h2>

                        <p>
                            Current stage:{" "}
                            <strong>
                                {workflow.currentStage}
                            </strong>
                        </p>
                    </div>

                </div>


                <div className="workflow-line">

                    {[
                        1,
                        2,
                        3,
                        4
                    ].map(
                        stageNumber => {

                            const stageTasks =
                                tasks.filter(
                                    task => {

                                        const stage =
                                            workflow
                                                .template
                                                ?.stages
                                                ?.find(
                                                    item =>
                                                        item.name
                                                        ===
                                                        task.stageName
                                                );

                                        return (
                                            stage
                                            &&
                                            stage.order
                                            ===
                                            stageNumber
                                        );

                                    }
                                );


                            const approved =
                                stageTasks.length > 0
                                &&
                                stageTasks.every(
                                    task =>
                                        task.status
                                        ===
                                        "APPROVED"
                                );


                            const active =
                                workflow.currentStage
                                ===
                                stageNumber;


                            return (
                                <div
                                    key={stageNumber}
                                    className={
                                        `workflow-step ${
                                            approved
                                                ? "completed"
                                                : active
                                                    ? "current"
                                                    : ""
                                        }`
                                    }
                                >

                                    <div className="step-number">
                                        {approved
                                            ? "✓"
                                            : stageNumber}
                                    </div>

                                    <span>
                                        {stageNumber === 1
                                            && "Manager"}

                                        {stageNumber === 2
                                            && "Admin + Accounts"}

                                        {stageNumber === 3
                                            && "Personnel"}

                                        {stageNumber === 4
                                            && "HR Final"}
                                    </span>

                                </div>
                            );

                        }
                    )}

                </div>

            </section>


            <div className="workflow-grid">

                <section className="panel">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Clearance Tasks
                            </h2>

                            <p>
                                Department-by-department
                                approval status.
                            </p>
                        </div>

                    </div>


                    <div className="workflow-tasks">

                        {tasks.map(task => {

                            const isMine =
                                task._id
                                ===
                                myPendingTask?._id;


                            return (
                                <div
                                    key={task._id}
                                    className={
                                        `workflow-task ${
                                            isMine
                                                ? "my-task"
                                                : ""
                                        }`
                                    }
                                >

                                    <div className="task-heading">

                                        <div>

                                            <span className="task-role">
                                                {task.role
                                                    ?.replaceAll(
                                                        "_",
                                                        " "
                                                    )}
                                            </span>

                                            <h3>
                                                {task.stageName}
                                            </h3>

                                            <span>
                                                Assigned to:{" "}
                                                {task.assignedTo?.name}
                                            </span>

                                        </div>


                                        <StatusBadge
                                            status={task.status}
                                        />

                                    </div>


                                    <div className="checklist">

                                        {task.checklist?.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <label
                                                    key={`${task._id}-${index}`}
                                                    className="check-item"
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            item.completed
                                                        }
                                                        disabled={
                                                            !isMine
                                                            ||
                                                            task.status
                                                            !==
                                                            "PENDING"
                                                        }
                                                        onChange={(event) =>
                                                            updateChecklist(
                                                                task._id,
                                                                index,
                                                                event.target.checked
                                                            )
                                                        }
                                                    />

                                                    <span
                                                        className={
                                                            item.completed
                                                                ? "checked"
                                                                : ""
                                                        }
                                                    >
                                                        {item.label}
                                                    </span>

                                                    {item.required && (
                                                        <em>
                                                            Required
                                                        </em>
                                                    )}

                                                </label>

                                            )
                                        )}

                                    </div>


                                    {task.remarks && (
                                        <div className="task-remarks">
                                            <strong>
                                                Remarks
                                            </strong>

                                            <span>
                                                {task.remarks}
                                            </span>
                                        </div>
                                    )}


                                    {isMine && (
                                        <div className="task-action-area">

                                            <textarea
                                                value={remarks}
                                                onChange={(event) =>
                                                    setRemarks(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Add remarks..."
                                                rows="3"
                                            />


                                            <div className="action-buttons">

                                                <button
                                                    className="secondary-button danger"
                                                    onClick={
                                                        handleReject
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >
                                                    Reject
                                                </button>


                                                <button
                                                    className="primary-button"
                                                    onClick={
                                                        handleApprove
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >
                                                    {actionLoading
                                                        ? "Processing..."
                                                        : "Approve Clearance"}
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                </div>
                            );

                        })}

                    </div>

                </section>


                <section className="panel audit-panel">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Audit Timeline
                            </h2>

                            <p>
                                Complete workflow history.
                            </p>
                        </div>

                    </div>


                    <div className="timeline">

                        {auditLogs.map(
                            log => (

                                <div
                                    className="timeline-item"
                                    key={log._id}
                                >

                                    <div className="timeline-dot" />


                                    <div>

                                        <strong>
                                            {log.action
                                                ?.replaceAll(
                                                    "_",
                                                    " "
                                                )}
                                        </strong>

                                        <p>
                                            {log.description}
                                        </p>

                                        <span>
                                            {log.performedBy?.name}
                                            {" · "}
                                            {log.role
                                                ?.replaceAll(
                                                    "_",
                                                    " "
                                                )}
                                        </span>

                                        <small>
                                            {new Date(
                                                log.createdAt
                                            ).toLocaleString()}
                                        </small>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Workflow;