import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import employeeService
    from "../services/employeeService";

import offboardingService
    from "../services/offboardingService";

import workflowService
    from "../services/workflowService";

import StatusBadge
    from "../components/StatusBadge";

import Loading
    from "../components/Loading";


function Offboarding() {

    const [
        employees,
        setEmployees
    ] = useState([]);


    const [
        cases,
        setCases
    ] = useState([]);


    const [
        templateId,
        setTemplateId
    ] = useState("");


    const [
        employeeId,
        setEmployeeId
    ] = useState("");


    const [
        resignationDate,
        setResignationDate
    ] = useState("");


    const [
        lastWorkingDay,
        setLastWorkingDay
    ] = useState("");


    const [
        reason,
        setReason
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        submitting,
        setSubmitting
    ] = useState(false);


    const [
        message,
        setMessage
    ] = useState("");


    const [
        error,
        setError
    ] = useState("");


    const loadData =
        async () => {

            try {

                const [
                    employeeData,
                    caseData
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

                setCases(
                    caseData.offboardings
                    || []
                );


            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }
        };


    useEffect(() => {
        loadData();
    }, []);


    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setMessage("");
            setError("");
            setSubmitting(true);


            try {

                const data =
                    await offboardingService
                        .createOffboarding({
                            employeeId,
                            resignationDate,
                            lastWorkingDay,
                            reason
                        });


                const offboardingId =
                    data.offboarding._id;


                if (templateId) {

                    await workflowService
                        .startWorkflow(
                            templateId,
                            offboardingId
                        );

                }


                setMessage(
                    "Offboarding case created successfully."
                );


                setEmployeeId("");
                setResignationDate("");
                setLastWorkingDay("");
                setReason("");


                await loadData();


            } catch (error) {

                setError(
                    error.response
                        ?.data
                        ?.message
                    || "Unable to create offboarding case."
                );

            } finally {

                setSubmitting(false);

            }
        };


    if (loading) {
        return <Loading />;
    }


    return (
        <div>

            <div className="page-header">

                <div>
                    <span className="eyebrow">
                        EMPLOYEE TRANSITIONS
                    </span>

                    <h1>
                        Offboarding
                    </h1>

                    <p>
                        Initiate and track employee
                        offboarding workflows.
                    </p>
                </div>

            </div>


            <div className="offboarding-grid">

                <section className="panel">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Start Offboarding
                            </h2>

                            <p>
                                Create a new employee
                                transition case.
                            </p>
                        </div>

                        <span className="panel-step">
                            01
                        </span>

                    </div>


                    <form
                        className="offboarding-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label>
                                Employee
                            </label>

                            <select
                                value={employeeId}
                                onChange={(event) =>
                                    setEmployeeId(
                                        event.target.value
                                    )
                                }
                                required
                            >

                                <option value="">
                                    Select employee
                                </option>

                                {employees
                                    .filter(
                                        employee =>
                                            employee.status
                                            !== "OFFBOARDED"
                                    )
                                    .map(
                                        employee => (
                                            <option
                                                key={employee._id}
                                                value={employee._id}
                                            >
                                                {employee.name}
                                                {" — "}
                                                {employee.employeeId}
                                            </option>
                                        )
                                    )}

                            </select>

                        </div>


                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Resignation Date
                                </label>

                                <input
                                    type="date"
                                    value={resignationDate}
                                    onChange={(event) =>
                                        setResignationDate(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Last Working Day
                                </label>

                                <input
                                    type="date"
                                    value={lastWorkingDate}
                                    onChange={(event) =>
                                        setLastWorkingDay(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Reason / Details
                            </label>

                            <textarea
                                value={reason}
                                onChange={(event) =>
                                    setReason(
                                        event.target.value
                                    )
                                }
                                rows="4"
                                placeholder="Enter resignation reason or additional details..."
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Workflow Template ID
                            </label>

                            <input
                                value={templateId}
                                onChange={(event) =>
                                    setTemplateId(
                                        event.target.value
                                    )
                                }
                                placeholder="Paste OFFBOARDING template ID"
                            />

                            <small className="field-help">
                                Use the OFFBOARDING template
                                ID from your workflow template
                                API.
                            </small>

                        </div>


                        {message && (
                            <div className="success-message">
                                ✓ {message}
                            </div>
                        )}


                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}


                        <button
                            className="primary-button"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Creating..."
                                : "Start Offboarding"}
                        </button>

                    </form>

                </section>


                <section className="panel">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Active Cases
                            </h2>

                            <p>
                                Current employee
                                transitions.
                            </p>
                        </div>

                        <span className="case-count">
                            {cases.length}
                        </span>

                    </div>


                    <div className="case-list">

                        {cases.length === 0 ? (

                            <div className="empty-state">
                                No offboarding cases yet.
                            </div>

                        ) : (

                            cases.map(item => (

                                <Link
                                    key={item._id}
                                    to={`/offboarding/${item._id}`}
                                    className="case-card"
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
                                            {item.employee?.employeeId}
                                            {" · "}
                                            {item.employee?.department}
                                        </span>

                                        <small>
                                            LWD:{" "}
                                            {new Date(
                                                item.lastWorkingDay
                                            ).toLocaleDateString()}
                                        </small>

                                    </div>


                                    <StatusBadge
                                        status={item.status}
                                    />

                                </Link>

                            ))

                        )}

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Offboarding;