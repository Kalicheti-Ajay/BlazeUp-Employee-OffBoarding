
import {
    NavLink
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


function Sidebar({
    mobileOpen,
    closeMobile
}) {

    const {
        user,
        logout
    } = useAuth();


    const isHR =
        user?.role === "HR_ADMIN";


    const navigation = [

        {
            label: "Dashboard",
            path: "/dashboard",
            icon: "⌂"
        },

        {
            label: "Employees",
            path: "/employees",
            icon: "♙"
        },

        {
            label: "Offboarding",
            path: "/offboarding",
            icon: "↗"
        },

        {
            label: "My Tasks",
            path: "/tasks",
            icon: "✓"
        }

    ];


    return (
        <aside
            className={`sidebar ${
                mobileOpen
                    ? "sidebar-open"
                    : ""
            }`}
        >

            <div className="brand">

                <div className="brand-mark">
                    B
                </div>

                <div>
                    <strong>
                        BlazeUp
                    </strong>

                    <small>
                        HROS
                    </small>
                </div>

            </div>


            <div className="workspace">
                Employee Operations
            </div>


            <nav className="sidebar-nav">

                {navigation.map(
                    (item) => (

                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMobile}
                            className={({ isActive }) =>
                                isActive
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                        >

                            <span className="nav-icon">
                                {item.icon}
                            </span>

                            {item.label}

                        </NavLink>
                    )
                )}

            </nav>


            {isHR && (
                <div className="sidebar-section">

                    <div className="sidebar-section-title">
                        Administration
                    </div>

                    <NavLink
                        to="/offboarding"
                        onClick={closeMobile}
                        className="nav-item"
                    >
                        <span className="nav-icon">
                            ⚙
                        </span>

                        Workflow Management
                    </NavLink>

                </div>
            )}


            <div className="sidebar-bottom">

                <div className="sidebar-user">

                    <div className="avatar">
                        {user?.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                    </div>

                    <div className="sidebar-user-info">

                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            {user?.role
                                ?.replaceAll("_", " ")}
                        </span>

                    </div>

                </div>


                <button
                    className="logout-button"
                    onClick={logout}
                >
                    ⇥ Logout
                </button>

            </div>

        </aside>
    );
}

export default Sidebar;