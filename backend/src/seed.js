require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDatabase = require("./config/database");
const User = require("./models/User");
const Employee = require("./models/Employee");
const WorkflowTemplate = require("./models/WorkflowTemplate");
const Offboarding = require("./models/Offboarding");
const ClearanceTask = require("./models/ClearanceTask");
const Notification = require("./models/Notification");

async function seed() {
  await connectDatabase(); const password = await bcrypt.hash("Demo@123", 10); const saved = {};
  for (const [name, email, role] of [["HR Admin", "hr@blazeup.demo", "HR_ADMIN"], ["Project Manager", "manager@blazeup.demo", "REPORTING_MANAGER"], ["Systems Admin", "admin@blazeup.demo", "ADMIN"], ["Accounts Officer", "accounts@blazeup.demo", "ACCOUNTS"], ["Personnel Officer", "personnel@blazeup.demo", "PERSONNEL"]]) saved[role] = await User.findOneAndUpdate({ email }, { name, email, role, password, isActive: true, isWorkflowApprover: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
  for (const [employeeId, name, department, designation] of [["EMP-001", "Aarav Shah", "Engineering", "Software Engineer"], ["EMP-002", "Diya Nair", "Product", "Product Analyst"], ["EMP-003", "Kabir Singh", "Sales", "Account Executive"], ["EMP-004", "Meera Iyer", "Finance", "Financial Analyst"]]) await Employee.findOneAndUpdate({ employeeId }, { employeeId, name, email: `${employeeId.toLowerCase()}@blazeup.demo`, department, designation, joiningDate: new Date("2022-04-01"), reportingManager: saved.REPORTING_MANAGER._id, status: "ACTIVE" }, { upsert: true, new: true });
  // Keep the pre-existing Rahul demonstration employee aligned with the documented demo manager.
  const rahul = await Employee.findOneAndUpdate({ employeeId: "EMP1001" }, { reportingManager: saved.REPORTING_MANAGER._id }, { new: true });
  if (rahul) {
    const activeCase = await Offboarding.findOne({ employee: rahul._id, status: { $in: ["INITIATED", "IN_PROGRESS"] } });
    if (activeCase?.workflowInstance) {
      const pendingTasks = await ClearanceTask.find({ workflowInstance: activeCase.workflowInstance, status: "PENDING" });
      for (const task of pendingTasks) {
        const approver = saved[task.role];
        if (!approver || task.assignedTo.equals(approver._id)) continue;
        task.assignedTo = approver._id;
        await task.save();
        await Notification.create({ recipient: approver._id, title: "New Clearance Task", message: `You have a new clearance task: ${task.stageName}`, type: "WORKFLOW", referenceId: activeCase._id });
      }
    }
  }
  await WorkflowTemplate.findOneAndUpdate({ process: "OFFBOARDING" }, { name: "Default Employee Offboarding", process: "OFFBOARDING", isActive: true, stages: [
    { name: "Project Clearance", role: "REPORTING_MANAGER", order: 1, executionType: "SEQUENTIAL", checklist: [{ label: "Project tasks completed", required: true }, { label: "Knowledge transfer completed", required: true }, { label: "Client/system access reviewed", required: true }] },
    { name: "Admin & Systems", role: "ADMIN", order: 2, executionType: "PARALLEL", checklist: [{ label: "Laptop returned", required: true }, { label: "Email/system access reviewed", required: true }, { label: "Other assets returned", required: false }] },
    { name: "Accounts Clearance", role: "ACCOUNTS", order: 2, executionType: "PARALLEL", checklist: [{ label: "Travel advance cleared", required: true }, { label: "Loans/advances cleared", required: true }, { label: "Imprest cleared", required: false }] },
    { name: "Personnel Clearance", role: "PERSONNEL", order: 3, executionType: "SEQUENTIAL", checklist: [{ label: "ID card returned", required: true }, { label: "Access card returned", required: true }, { label: "Business cards returned", required: false }] },
    { name: "HR Final Clearance", role: "HR_ADMIN", order: 4, executionType: "SEQUENTIAL", checklist: [{ label: "Final clearance reviewed", required: true }] }
  ] }, { upsert: true, new: true });
  console.log("Seed complete. Password for all demo users: Demo@123"); await mongoose.disconnect();
}
seed().catch(error => { console.error(error); process.exit(1); });
