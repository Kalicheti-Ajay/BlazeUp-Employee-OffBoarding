const express = require("express");

const {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const {
    protect
} = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Create employee
router.post(
    "/",
    protect,
    authorizeRoles("HR_ADMIN"),
    createEmployee
);


// Get employees
router.get(
    "/",
    protect,
    authorizeRoles(
        "HR_ADMIN",
        "REPORTING_MANAGER",
        "ADMIN",
        "ACCOUNTS",
        "PERSONNEL"
    ),
    getEmployees
);


// Get employee
router.get(
    "/:id",
    protect,
    authorizeRoles(
        "HR_ADMIN",
        "REPORTING_MANAGER",
        "ADMIN",
        "ACCOUNTS",
        "PERSONNEL"
    ),
    getEmployee
);


// Update employee
router.put(
    "/:id",
    protect,
    authorizeRoles("HR_ADMIN"),
    updateEmployee
);


// Delete employee
router.delete(
    "/:id",
    protect,
    authorizeRoles("HR_ADMIN"),
    deleteEmployee
);


module.exports = router;