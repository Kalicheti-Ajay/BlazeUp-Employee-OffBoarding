
import {
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


function Topbar({
    onMenuClick
}) {

    const {
        user
    } = useAuth();

    const location =
        useLocation();


    const titles = {
        "/dashboard": "Dashboard",
        "/employees": "Employees",
        "/offboarding": "Offboarding",
        "/tasks": "My Tasks"
    };


    const title =
        titles[location.pathname]
        || "Employee Operations";


    return (
        <header className="topbar">

            <div className="topbar-left">

                <button
                    className="menu-button"
                    onClick={onMenuClick}
                >
                    ☰
                </button>

                <div>

                    <div className="page-title">
                        {title}
                    </div>

                    <div className="breadcrumb">
                        BlazeUp HROS
                        <span>/</span>
                        {title}
                    </div>

                </div>

            </div>


            <div className="topbar-right">

                <button
                    className="notification-button"
                    title="Notifications"
                >
                    ♢
                    <span className="notification-dot" />
                </button>


                <div className="topbar-user">

                    <div className="avatar small">
                        {user?.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                    </div>

                    <div className="topbar-user-info">

                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            {user?.role
                                ?.replaceAll("_", " ")}
                        </span>

                    </div>

                </div>

            </div>

        </header>
    );
}

export default Topbar;