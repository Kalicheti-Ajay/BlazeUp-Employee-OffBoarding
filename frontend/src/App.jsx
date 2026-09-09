import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Offboardings from "./pages/Offboardings";
import InitiateOffboarding from "./pages/InitiateOffboarding";
import OffboardingDetails from "./pages/OffboardingDetails";
import MyTasks from "./pages/MyTasks";
import WorkflowTemplates from "./pages/WorkflowTemplates";

function App() {
    return (
        <Routes>

            {/* Public */}
            <Route
                path="/login"
                element={<Login />}
            />

            {/* Protected Application */}
            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/employees"
                    element={<Employees />}
                />

                <Route
                    path="/offboardings"
                    element={<Offboardings />}
                />

                <Route
                    path="/offboardings/new"
                    element={
                        <InitiateOffboarding />
                    }
                />

                <Route
                    path="/offboardings/:id"
                    element={
                        <OffboardingDetails />
                    }
                />

                <Route
                    path="/tasks"
                    element={<MyTasks />}
                />
                <Route path="/workflow-templates" element={<WorkflowTemplates />} />
            </Route>

            {/* Unknown URL */}
            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default App;
