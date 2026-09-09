
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

import employeeService
    from "../services/employeeService";

import StatusBadge
    from "../components/StatusBadge";

import Loading
    from "../components/Loading";


function Dashboard() {

    const {
        user
    } = useAuth();


    const [
        employees,
        setEmployees
    ] = useState([]);


    const [
        offboardings,
        setOffboardings
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    useEffect(() => {

        const loadDashboard =
            async () => {

                try {

                    const [
                        employeeData,
                        offboardingData
                    ] = await Promise.all([
                        employeeService
                            .getEmployees(),

                        offboardingService
                            .getOffboardings()
                    ]);


                    setEmployees(
                        employeeData.employees
                        || []
                    );

                    setOffboardings(
                        offboardingData.offboardings
                        || []
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                } finally {

                    setLoading(false);

                }
            };


        loadDashboard();

    }, []);


    if (loading) {
        return <Loading />;
    }


    const active =
        offboardings.filter(
            item =>
                [
                    "INITIATED",
                    "IN_PROGRESS"
                ].includes(item.status)
        ).length;


    const completed =
        offboardings.filter(
            item =>
                item.status === "COMPLETED"
        ).length;


    const rejected =
        offboardings.filter(
            item =>
                item.status === "REJECTED"
        ).length;


    const recent =
        offboardings.slice(0, 5);


    return (
        <div className="dashboard-page">

            <div className="welcome-section">

                <div>

                    <span className="eyebrow">
                        EMPLOYEE OPERATIONS
                    </span>

                    <h1>
                        Good to see you,{" "}
                        {user?.name?.split(" ")[0]}.
                    </h1>

                    <p>
                        Here's what's happening
                        across your offboarding
                        workflows.
                    </p>

                </div>


                <Link
                    to="/offboarding"
                    className="primary-button"
                >
                    + Start Offboarding
                </Link>

            </div>


            <div className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon blue">
                        ♙
                    </div>

                    <div>
                        <span>
                            Total Employees
                        </span>

                        <strong>
                            {employees.length}
                        </strong>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon orange">
                        ↗
                    </div>

                    <div>
                        <span>
                            Active Offboarding
                        </span>

                        <strong>
                            {active}
                        </strong>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon green">
                        ✓
                    </div>

                    <div>
                        <span>
                            Completed
                        </span>

                        <strong>
                            {completed}
                        </strong>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon red">
                        !
                    </div>

                    <div>
                        <span>
                            Rejected
                        </span>

                        <strong>
                            {rejected}
                        </strong>
                    </div>

                </div>

            </div>


            <div className="dashboard-grid">

                <section className="panel">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Recent Offboarding
                            </h2>

                            <p>
                                Latest employee
                                transition cases
                            </p>
                        </div>

                        <Link
                            to="/offboarding"
                            className="text-link"
                        >
                            View all →
                        </Link>

                    </div>


                    {recent.length === 0 ? (

                        <div className="empty-state">
                            <div className="empty-icon">
                                ○
                            </div>

                            <strong>
                                No offboarding cases
                            </strong>

                            <span>
                                Start your first
                                employee transition.
                            </span>
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>
                                        <th>
                                            Employee
                                        </th>

                                        <th>
                                            Last Working Day
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {recent.map(
                                        (item) => (

                                            <tr
                                                key={item._id}
                                            >

                                                <td>
                                                    <div className="employee-cell">

                                                        <div className="avatar">
                                                            {item.employee?.name
                                                                ?.charAt(0)}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {item.employee?.name}
                                                            </strong>

                                                            <span>
                                                                {item.employee?.employeeId}
                                                            </span>
                                                        </div>

                                                    </div>
                                                </td>


                                                <td>
                                                    {new Date(
                                                        item.lastWorkingDay
                                                    ).toLocaleDateString()}
                                                </td>


                                                <td>
                                                    <StatusBadge
                                                        status={item.status}
                                                    />
                                                </td>


                                                <td>
                                                    <Link
                                                        className="table-action"
                                                        to={`/offboarding/${item._id}`}
                                                    >
                                                        View
                                                    </Link>
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                <section className="panel quick-panel">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Common operations
                            </p>
                        </div>

                    </div>


                    <Link
                        to="/offboarding"
                        className="quick-action"
                    >
                        <span className="quick-action-icon">
                            +
                        </span>

                        <div>
                            <strong>
                                Start Offboarding
                            </strong>

                            <span>
                                Create a new employee
                                transition case
                            </span>
                        </div>

                        <span>→</span>
                    </Link>


                    <Link
                        to="/tasks"
                        className="quick-action"
                    >
                        <span className="quick-action-icon">
                            ✓
                        </span>

                        <div>
                            <strong>
                                My Clearance Tasks
                            </strong>

                            <span>
                                Review pending
                                department approvals
                            </span>
                        </div>

                        <span>→</span>
                    </Link>


                    <Link
                        to="/employees"
                        className="quick-action"
                    >
                        <span className="quick-action-icon">
                            ♙
                        </span>

                        <div>
                            <strong>
                                Employee Directory
                            </strong>

                            <span>
                                View employee
                                information
                            </span>
                        </div>

                        <span>→</span>
                    </Link>

                </section>

            </div>

        </div>
    );
}

export default Dashboard;