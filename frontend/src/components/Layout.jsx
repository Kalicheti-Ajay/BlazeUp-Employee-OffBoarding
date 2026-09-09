
import {
    useState
} from "react";

import {
    Outlet
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";


function Layout() {

    const [
        mobileOpen,
        setMobileOpen
    ] = useState(false);


    return (
        <div className="app-shell">

            <Sidebar
                mobileOpen={mobileOpen}
                closeMobile={() =>
                    setMobileOpen(false)
                }
            />

            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() =>
                        setMobileOpen(false)
                    }
                />
            )}


            <main className="main-content">

                <Topbar
                    onMenuClick={() =>
                        setMobileOpen(
                            !mobileOpen
                        )
                    }
                />

                <div className="page-content">

                    <Outlet />

                </div>

            </main>

        </div>
    );
}

export default Layout;