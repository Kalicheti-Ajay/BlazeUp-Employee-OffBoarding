import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    UserMinus,
    ClipboardCheck,
    Settings2,
    LogOut,
    ShieldCheck,
    Bell
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AppLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    useEffect(() => { if (user) api.get("/notifications").then(response => setNotifications(response.data.notifications || [])).catch(() => {}); }, [user]);
    const openNotification = async (notification) => {
        try { await api.patch(`/notifications/${notification._id}/read`); } catch { /* navigation remains available */ }
        setNotifications(items => items.map(item => item._id === notification._id ? { ...item, isRead: true } : item)); setShowNotifications(false);
        if (notification.referenceId) navigate(`/offboardings/${notification.referenceId}`);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        {
            label: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            label: "Employees",
            path: "/employees",
            icon: Users
        },
        {
            label: "Offboarding",
            path: "/offboardings",
            icon: UserMinus
        },
        {
            label: "My Tasks",
            path: "/tasks",
            icon: ClipboardCheck
        }
    ];

    if (user?.role === "HR_ADMIN") navItems.push({ label: "Workflow Templates", path: "/workflow-templates", icon: Settings2 });

    return (
        <div className="app-shell">

            {/* Sidebar */}
            <aside className="sidebar">

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <ShieldCheck size={24} />
                    </div>

                    <div>
                        <h2>BlazeUp</h2>
                        <span>HROS</span>
                    </div>
                </div>

                <div className="sidebar-section-title">
                    WORKSPACE
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >
                                <Icon size={19} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                        </div>

                        <div className="user-info">
                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <span>
                                {formatRole(
                                    user?.role
                                )}
                            </span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="main-content">

                <header className="topbar">
                    <div>
                        <h1>Employee Offboarding</h1>
                        <p>
                            Manage employee exits,
                            approvals and clearances
                        </p>
                    </div>

                    <div className="topbar-user">
                        <div style={{ position: "relative" }}>
                            <button className="btn btn-secondary" onClick={() => setShowNotifications(open => !open)}><Bell size={17} /> {notifications.filter(item => !item.isRead).length || ""}</button>
                            {showNotifications && <div className="card" style={{ position: "absolute", zIndex: 20, right: 0, top: 45, width: 300, padding: 8 }}><strong>Notifications</strong>{notifications.length ? notifications.slice(0, 6).map(notification => <button key={notification._id} className="case-row" style={{ width: "100%", textAlign: "left", fontWeight: notification.isRead ? 400 : 700 }} onClick={() => openNotification(notification)}><div className="case-info"><strong>{notification.title}</strong><span>{notification.message}</span></div></button>) : <p className="muted">No notifications</p>}</div>}
                        </div>
                        <div className="topbar-avatar">
                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                        </div>

                        <div>
                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <span>
                                {formatRole(
                                    user?.role
                                )}
                            </span>
                        </div>
                    </div>
                </header>

                <section className="page-content">
                    <Outlet />
                </section>

            </main>
        </div>
    );
}

function formatRole(role) {
    if (!role) {
        return "User";
    }

    return role
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

export default AppLayout;
