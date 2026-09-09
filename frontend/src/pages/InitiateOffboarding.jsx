import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getEmployees
} from "../services/employeeService";

import { getWorkflowTemplates } from "../services/workflowService";

import {
    createOffboarding
} from "../services/offboardingService";

function InitiateOffboarding() {

    const navigate = useNavigate();

    const [employees, setEmployees] =
        useState([]);

    const [template, setTemplate] =
        useState(null);

    const [employeeId, setEmployeeId] =
        useState("");

    const [resignationDate, setResignationDate] =
        useState("");

    const [lastWorkingDay, setLastWorkingDay] =
        useState("");

    const [reason, setReason] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    employeeData,
                    templates
                ] = await Promise.all([
                    getEmployees(),
                    getWorkflowTemplates()
                ]);

                setEmployees(
                    employeeData.employees || []
                );

                const activeTemplate =
                    templates.find(
                        item =>
                            item.process ===
                                "OFFBOARDING" &&
                            item.isActive !== false
                    );

                if (!activeTemplate) {

                    throw new Error(
                        "No active OFFBOARDING workflow template is configured. Please configure a workflow template before starting a case."
                    );
                }

                setTemplate(activeTemplate);

            } catch (err) {

                console.error(
                    "Unable to load initiation data:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load initiation data."
                );

            } finally {

                setLoading(false);
            }
        };

        loadData();

    }, []);

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSubmitting(true);
            setError("");

            if (!employeeId) {
                throw new Error(
                    "Please select an employee."
                );
            }

            if (!resignationDate) {
                throw new Error(
                    "Please select the resignation date."
                );
            }

            if (!lastWorkingDay) {
                throw new Error(
                    "Please select the last working day."
                );
            }

            if (!template) {
                throw new Error(
                    "No active workflow template available."
                );
            }

            // Create offboarding case
            const offboardingResponse =
                await createOffboarding({
                    employeeId,
                    resignationDate,
                    lastWorkingDay,
                    reason
                });

            const offboarding =
                offboardingResponse.offboarding;

            // Open details page
            navigate(
                `/offboardings/${offboarding._id}`
            );

        } catch (err) {

            console.error(
                "Unable to start offboarding:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to start offboarding."
            );

        } finally {

            setSubmitting(false);
        }
    };

    if (loading) {

        return (
            <div className="page">

                <div className="page-header">

                    <span className="eyebrow">
                        HR ADMIN
                    </span>

                    <h1>
                        Initiate Offboarding
                    </h1>

                    <p>
                        Loading employee and workflow information...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="page">

            <div className="page-header">

                <button
                    type="button"
                    onClick={() =>
                        navigate("/offboardings")
                    }
                >
                    ← Back to Offboarding
                </button>

                <span className="eyebrow">
                    HR ADMIN
                </span>

                <h1>
                    Initiate Offboarding
                </h1>

                <p>
                    Start a new employee offboarding workflow.
                </p>

            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {template && (
                <div className="info-message">

                    <strong>
                        Workflow:
                    </strong>{" "}

                    {template.name}

                    <br />

                    <small>
                        Approval chain configured with{" "}
                        {template.stages?.length || 0} stages.
                    </small>

                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="form-card"
            >

                <div className="section-heading">

                    <h2>
                        Employee
                    </h2>

                    <p>
                        Select the employee who is leaving.
                    </p>

                </div>

                <div className="form-group">

                    <label>
                        Employee
                    </label>

                    <select
                        value={employeeId}
                        onChange={(e) =>
                            setEmployeeId(e.target.value)
                        }
                    >

                        <option value="">
                            Select an employee
                        </option>

                        {employees.filter(employee => employee.status === "ACTIVE").map(employee => (

                            <option
                                key={employee._id}
                                value={employee._id}
                            >
                                {employee.employeeId} —{" "}
                                {employee.name} —{" "}
                                {employee.department}
                            </option>

                        ))}

                    </select>

                    {employeeId && (() => { const employee = employees.find(item => item._id === employeeId); return employee ? <p className="muted">{employee.email} · {employee.designation} · Manager: {employee.reportingManager?.name || "Not assigned"}</p> : null; })()}

                </div>

                <div className="section-heading">

                    <h2>
                        Offboarding Details
                    </h2>

                    <p>
                        Provide the employee's exit details.
                    </p>

                </div>

                <div className="form-group">

                    <label>
                        Resignation Date
                    </label>

                    <input
                        type="date"
                        value={resignationDate}
                        onChange={(e) =>
                            setResignationDate(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        Last Working Day
                    </label>

                    <input
                        type="date"
                        value={lastWorkingDay}
                        onChange={(e) =>
                            setLastWorkingDay(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        Reason
                    </label>

                    <textarea
                        rows="4"
                        value={reason}
                        onChange={(e) =>
                            setReason(e.target.value)
                        }
                        placeholder="Enter reason for leaving"
                    />

                </div>

                <div className="form-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/offboardings")
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Starting..."
                            : "Start Offboarding"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default InitiateOffboarding;
