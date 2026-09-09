import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ClipboardList,
    Search,
    Plus,
    ArrowRight,
    RefreshCw
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
    getOffboardings
} from "../services/offboardingService";

import StatusBadge from "../components/StatusBadge";

function Offboardings() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [offboardings, setOffboardings] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadOffboardings = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getOffboardings();

            setOffboardings(
                response.offboardings || []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load offboarding cases."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOffboardings();
    }, []);

    const filteredCases =
        offboardings.filter((item) => {

            const searchValue =
                search.toLowerCase();

            const matchesSearch =
                item.employee?.name
                    ?.toLowerCase()
                    .includes(searchValue) ||

                item.employee?.employeeId
                    ?.toLowerCase()
                    .includes(searchValue) ||

                item.employee?.department
                    ?.toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "ALL" ||
                item.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    if (loading) {
        return (
            <div className="page-loading">
                <span className="spinner" />
                <p>Loading offboarding cases...</p>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <p className="eyebrow">
                        WORKFLOW
                    </p>

                    <h1>Offboarding</h1>

                    <p className="page-description">
                        Manage and track employee offboarding
                        workflows from initiation to completion.
                    </p>
                </div>

                <div className="header-actions">

                    <button
                        className="btn btn-secondary"
                        onClick={loadOffboardings}
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

            <div className="card">

                <div className="toolbar">

                    <div className="toolbar-left">

                        <div className="search-box">
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <select
                            className="select-control"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >
                            <option value="ALL">
                                All statuses
                            </option>

                            <option value="INITIATED">
                                Initiated
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="REJECTED">
                                Rejected
                            </option>

                            <option value="CANCELLED">
                                Cancelled
                            </option>
                        </select>

                    </div>

                    <div className="toolbar-count">
                        {filteredCases.length} cases
                    </div>

                </div>

                {filteredCases.length === 0 ? (

                    <div className="empty-state">

                        <ClipboardList size={36} />

                        <h3>
                            No offboarding cases found
                        </h3>

                        <p>
                            There are no cases matching
                            your current filters.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Resignation Date</th>
                                    <th>Last Working Day</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredCases.map(
                                    (item) => (

                                        <tr
                                            key={item._id}
                                            className="clickable-row"
                                            onClick={() =>
                                                navigate(
                                                    `/offboardings/${item._id}`
                                                )
                                            }
                                        >

                                            <td>
                                                <div className="employee-cell">

                                                    <div className="avatar">
                                                        {
                                                            item.employee
                                                                ?.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()
                                                        }
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                item.employee
                                                                    ?.name
                                                        }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.employee
                                                                    ?.employeeId
                                                            }
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                {
                                                    item.employee
                                                        ?.department
                                                }
                                            </td>

                                            <td>
                                                {formatDate(
                                                    item.resignationDate
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    item.lastWorkingDay
                                                )}
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={
                                                        item.status
                                                    }
                                                />
                                            </td>

                                            <td>
                                                <button
                                                    className="icon-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        navigate(
                                                            `/offboardings/${item._id}`
                                                        );
                                                    }}
                                                >
                                                    <ArrowRight
                                                        size={17}
                                                    />
                                                </button>
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

function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

export default Offboardings;
