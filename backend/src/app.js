const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/database");
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const workflowTemplateRoutes = require("./routes/workflowTemplateRoutes");
const offboardingRoutes =
    require("./routes/offboardingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const documentRoutes = require("./routes/documentRoutes");
const app = express();

// Database
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/workflows", workflowRoutes);
app.use(
    "/api/workflow-templates",
    workflowTemplateRoutes
);

app.use(
    "/api/offboarding",
    offboardingRoutes
);
app.use("/api/notifications", notificationRoutes);
app.use("/api/offboarding", documentRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Employee Offboarding API is running"
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
