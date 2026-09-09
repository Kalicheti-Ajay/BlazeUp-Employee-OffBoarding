import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

import offboardingService
    from "../services/offboardingService";

import workflowService
    from "../services/workflowService";

import StatusBadge
    from "../components/StatusBadge";

import Loading
    from "../components/Loading";


function MyTasks() {

    const {
        user
    } = useAuth();


    const [
        tasks,
        setTasks
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const loadTasks =
        async () => {

            try {

                const result =
                    await offboardingService
                        .getOffboardings();


                const cases =
                    result.offboardings || [];


                const allTasks = [];


                for (
                    const item of cases
                ) {

                    if (
                        !item.workflowInstance
                    ) {
                        continue;
                    }


                    try {

                        const workflow =
                            await workflowService
                                .getWorkflow(
                                    item.workflowInstance._id
                                );


                        const myTasks =
                            (
                                workflow.tasks
                                || []
                            ).filter(
                                task =>
                                    task.assignedTo?._id
                                    === user?.id
                                    ||
                                    task.assignedTo?._id
                                    === user?._id
                            );


                        myTasks.forEach(
                            task => {

                                allTasks.push({
                                    ...task,
                                    employee:
                                        item.employee,
                                    offboardingId:
                                        item._id,
                                    workflowId:
                                        item.workflowInstance._id
                                });

                            }
                        );

                    } catch (error) {

                        console.error(error);

                    }

                }


                setTasks(allTasks);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }
        };


    useEffect(() => {
        loadTasks();
    }, []);


    if (loading) {
        return <Loading />;
    }


    const pending =
        tasks.filter(
            task =>
                task.status === "PENDING"
        );


    const completed =
        tasks.filter(
            task =>
                task.status === "APPROVED"
        );


    return (
        <div>

            <div className="page-header">

                <div>

                    <span className="eyebrow">
                        WORK QUEUE
                    </span>

                    <h1>
                        My Tasks
                    </h1>

                    <p>
                        Review and action clearance
                        tasks assigned to you.
                    </p>

                </div>

            </div>


            <div className="task-summary">

                <div>
                    <strong>
                        {pending.length}
                    </strong>

                    <span>
                        Pending
                    </span>
                </div>


                <div>
                    <strong>
                        {completed.length}
                    </strong>

                    <span>
                        Approved
                    </span>
                </div>

            </div>


            <section className="panel">

                <div className="panel-header">

                    <div>
                        <h2>
                            Assigned Clearance Tasks
                        </h2>

                        <p>
                            Your department approval
                            queue.
                        </p>
                    </div>

                </div>


                <div className="task-list">

                    {tasks.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ✓
                            </div>

                            <strong>
                                No tasks assigned
                            </strong>

                            <span>
                                You're all caught up.
                            </span>

                        </div>

                    ) : (

                        tasks.map(task => (

                            <Link
                                key={task._id}
                                to={`/workflow/${task.workflowId}`}
                                className="task-card"
                            >

                                <div className="task-icon">
                                    {task.status === "PENDING"
                                        ? "!"
                                        : "✓"}
                                </div>


                                <div className="task-content">

                                    <div className="task-top">

                                        <strong>
                                            {task.stageName}
                                        </strong>

                                        <StatusBadge
                                            status={task.status}
                                        />

                                    </div>


                                    <span>
                                        {task.employee?.name}
                                        {" · "}
                                        {task.employee?.employeeId}
                                    </span>


                                    <small>
                                        {task.checklist?.length || 0}
                                        {" checklist items"}
                                    </small>

                                </div>


                                <span className="task-arrow">
                                    →
                                </span>

                            </Link>

                        ))

                    )}

                </div>

            </section>

        </div>
    );
}

export default MyTasks;