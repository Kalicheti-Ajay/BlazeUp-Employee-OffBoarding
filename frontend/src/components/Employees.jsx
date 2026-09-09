import {
    useEffect,
    useState
} from "react";

import employeeService
    from "../services/employeeService";

import {
    useAuth
} from "../context/AuthContext";

import Loading
    from "../components/Loading";


function Employees() {

    const {
        user
    } = useAuth();


    const [
        employees,
        setEmployees
    ] = useState([]);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(true);


    useEffect(() => {

        const loadEmployees =
            async () => {

                try {

                    const data =
                        await employeeService
                            .getEmployees();

                    setEmployees(
                        data.employees || []
                    );

                } catch (error) {

                    console.error(error);

                } finally {

                    setLoading(false);

                }
            };

        loadEmployees();

    }, []);


    const filtered =
        employees.filter(
            employee => {

                const query =
                    search.toLowerCase();

                return (
                    employee.name
                        ?.toLowerCase()
                        .includes(query)
                    ||
                    employee.employeeId
                        ?.toLowerCase()
                        .includes(query)
                    ||
                    employee.department
                        ?.toLowerCase()
                        .includes(query)
                );
            }
        );


    if (loading) {
        return <Loading />;
    }


    return (
        <div>

            <div className="page-header">

                <div>
                    <span className="eyebrow">
                        DIRECTORY
                    </span>

                    <h1>
                        Employees
                    </h1>

                    <p>
                        Manage and view employee
                        information.
                    </p>
                </div>

            </div>


            <section className="panel">

                <div className="toolbar">

                    <div className="search-box">
                        <span>
                            ⌕
                        </span>

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search employees..."
                        />
                    </div>


                    <div className="toolbar-count">
                        {filtered.length} employees
                    </div>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>
                                <th>
                                    Employee
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Designation
                                </th>

                                <th>
                                    Joining Date
                                </th>

                                <th>
                                    Status
                                </th>
                            </tr>

                        </thead>


                        <tbody>

                            {filtered.map(
                                employee => (

                                    <tr
                                        key={employee._id}
                                    >

                                        <td>
                                            <div className="employee-cell">

                                                <div className="avatar">
                                                    {employee.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {employee.name}
                                                    </strong>

                                                    <span>
                                                        {employee.employeeId}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>


                                        <td>
                                            {employee.department}
                                        </td>


                                        <td>
                                            {employee.designation}
                                        </td>


                                        <td>
                                            {employee.joiningDate
                                                ? new Date(
                                                    employee.joiningDate
                                                ).toLocaleDateString()
                                                : "—"}
                                        </td>


                                        <td>
                                            <span className="status-badge status-ACTIVE">
                                                {employee.status}
                                            </span>
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>


                    {filtered.length === 0 && (
                        <div className="empty-state">
                            No employees found.
                        </div>
                    )}

                </div>

            </section>

        </div>
    );
}

export default Employees;