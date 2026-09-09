const Employee = require("../models/Employee");

// Create employee
const createEmployee = async (req, res) => {
    try {
        const {
            employeeId,
            name,
            email,
            department,
            designation,
            joiningDate,
            reportingManager
        } = req.body;

        const existingEmployee = await Employee.findOne({
            employeeId
        });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: "Employee ID already exists"
            });
        }

        const employee = await Employee.create({
            employeeId,
            name,
            email,
            department,
            designation,
            joiningDate,
            reportingManager
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate("reportingManager", "name email role")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: employees.length,
            employees
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get single employee
const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate("reportingManager", "name email role");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.json({
            success: true,
            employee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Update employee
const updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.json({
            success: true,
            message: "Employee updated successfully",
            employee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Delete employee
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(
            req.params.id
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.json({
            success: true,
            message: "Employee deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
};