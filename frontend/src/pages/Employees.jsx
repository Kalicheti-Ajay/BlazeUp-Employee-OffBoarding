import { useEffect, useState } from "react";

import {
    Users,
    Search,
    Mail,
    Building2,
    BriefcaseBusiness,
    UserRound,
    RefreshCw
} from "lucide-react";

import {
    getEmployees
} from "../services/employeeService";

import StatusBadge from "../components/StatusBadge";

function Employees() {
    const [employees, setEmployees] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadEmployees = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getEmployees();

            setEmployees(
                response.employees || []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load employees."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const filteredEmployees =
        employees.filter((employee) => {

            const value =
                search.toLowerCase();

            return (
                employee.name
                    ?.toLowerCase()
                    .includes(value) ||

                employee.employeeId
                    ?.toLowerCase()
                    .includes(value) ||

                employee.email
                    ?.toLowerCase()
                    .includes(value) ||

                employee.department
                    ?.toLowerCase()
                    .includes(value)
            );
        });

    if (loading) {
        return (
            <div className="page-loading">
                <span className="spinner" />
                <p>Loading employees...</p>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <p className="eyebrow">
                        PEOPLE
                    </p>

                    <h1>Employees</h1>

                    <p className="page-description">
                        View employees available in the HROS
                        employee directory.
                    </p>
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={loadEmployees}
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

            <div className="card">

                <div className="toolbar">

                    <div className="search-box">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <div className="toolbar-count">
                        {filteredEmployees.length} employees
                    </div>

                </div>

                {filteredEmployees.length === 0 ? (
                    <div className="empty-state">
                        <Users size={35} />

                        <h3>
                            No employees found
                        </h3>

                        <p>
                            Try changing your search.
                        </p>
                    </div>
                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredEmployees.map(
                                    (employee) => (

                                        <tr
                                            key={employee._id}
                                        >

                                            <td>
                                                <div className="employee-cell">

                                                    <div className="avatar">
                                                        {
                                                            employee.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()
                                                        }
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                employee.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                employee.employeeId
                                                            }
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <div className="table-detail">
                                                    <Building2 size={15} />
                                                    {
                                                        employee.department
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                <div className="table-detail">
                                                    <BriefcaseBusiness size={15} />
                                                    {
                                                        employee.designation
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                <div className="table-detail">
                                                    <Mail size={15} />
                                                    {
                                                        employee.email
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={
                                                        employee.status
                                                    }
                                                />
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Employees;
