import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import offboardingService
    from "../services/offboardingService";

import StatusBadge
    from "../components/StatusBadge";

import Loading
    from "../components/Loading";


function OffboardingDetails() {

    const {
        id
    } = useParams();


    const [
        data,
        setData
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    useEffect(() => {

        const load =
            async () => {

                try {

                    const result =
                        await offboardingService
                            .getOffboarding(id);

                    setData(
                        result.offboarding
                    );

                } catch (error) {

                    console.error(error);

                } finally {

                    setLoading(false);

                }
            };

        load();

    }, [id]);


    if (loading) {
        return <Loading />;
    }


    if (!data) {

        return (
            <div className="empty-state">
                Offboarding case not found.
            </div>
        );
    }


    return (
        <div>

            <div className="page-header">

                <div>

                    <Link
                        to="/offboarding"
                        className="back-link"
                    >
                        ← Back to Offboarding
                    </Link>

                    <h1>
                        {data.employee?.name}
                    </h1>

                    <p>
                        {data.employee?.employeeId}
                        {" · "}
                        {data.employee?.designation}
                    </p>

                </div>


                <StatusBadge
                    status={data.status}
                />

            </div>


            <div className="detail-grid">

                <section className="panel">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Employee Information
                            </h2>
                        </div>

                    </div>


                    <div className="detail-list">

                        <div>
                            <span>
                                Employee ID
                            </span>

                            <strong>
                                {data.employee?.employeeId}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Email
                            </span>

                            <strong>
                                {data.employee?.email}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Department
                            </span>

                            <strong>
                                {data.employee?.department}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Designation
                            </span>

                            <strong>
                                {data.employee?.designation}
                            </strong>
                        </div>

                    </div>

                </section>


                <section className="panel">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Offboarding Details
                            </h2>
                        </div>

                    </div>


                    <div className="detail-list">

                        <div>
                            <span>
                                Resignation Date
                            </span>

                            <strong>
                                {new Date(
                                    data.resignationDate
                                ).toLocaleDateString()}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Last Working Day
                            </span>

                            <strong>
                                {new Date(
                                    data.lastWorkingDay
                                ).toLocaleDateString()}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Reason
                            </span>

                            <strong>
                                {data.reason || "—"}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Initiated By
                            </span>

                            <strong>
                                {data.initiatedBy?.name}
                            </strong>
                        </div>

                    </div>

                </section>

            </div>


            {data.workflowInstance ? (

                <section className="panel workflow-preview">

                    <div className="panel-header">

                        <div>
                            <h2>
                                Workflow
                            </h2>

                            <p>
                                View the complete approval
                                chain and audit history.
                            </p>
                        </div>

                        <Link
                            to={`/workflow/${data.workflowInstance._id}`}
                            className="primary-button"
                        >
                            View Workflow →
                        </Link>

                    </div>

                </section>

            ) : (

                <section className="panel">

                    <div className="empty-state">
                        Workflow has not been started yet.
                    </div>

                </section>

            )}

        </div>
    );
}

export default OffboardingDetails;
