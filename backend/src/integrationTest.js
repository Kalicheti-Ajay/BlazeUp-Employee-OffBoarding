require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./app");
const Employee = require("./models/Employee");
const Offboarding = require("./models/Offboarding");
const WorkflowInstance = require("./models/WorkflowInstance");
const Notification = require("./models/Notification");
const User = require("./models/User");

const password = "Demo@123";
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const login = async (email) => (await request(app).post("/api/auth/login").send({ email, password }).expect(200)).body;
const details = async (token, workflowId) => {
  const response = await request(app).get(`/api/workflows/${workflowId}`).set(auth(token)).expect(200);
  if (!response.body.workflow || !Array.isArray(response.body.tasks) || !Array.isArray(response.body.auditLogs)) throw new Error("Workflow details contract is invalid");
  return response.body;
};
const pendingTask = (payload, role) => payload.tasks.find((task) => task.role === role && task.status === "PENDING");
const assertTaskOwner = (task, user, role) => {
  if (!task?.assignedTo?._id || String(task.assignedTo._id) !== String(user._id)) throw new Error(`${role} task is not populated and assigned to its seeded approver`);
  if (!Array.isArray(task.checklist) || !task.checklist.length) throw new Error(`${role} task checklist is missing`);
};
const approve = (token, task) => request(app).post(`/api/workflows/tasks/${task._id}/approve`).set(auth(token)).send({ remarks: "Verified by end-to-end integration test", checklist: task.checklist.map((item) => ({ completed: item.required })) }).expect(200);
const createTestEmployee = (suffix, managerId) => Employee.create({ employeeId: `E2E-${suffix}`, name: `Workflow Test ${suffix}`, email: `workflow-test-${suffix}@blazeup.demo`, department: "Engineering", designation: "Test Engineer", joiningDate: new Date("2024-01-01"), reportingManager: managerId, status: "ACTIVE" });

async function main() {
  const [hrSession, managerSession, adminSession, accountsSession, personnelSession] = await Promise.all([login("hr@blazeup.demo"), login("manager@blazeup.demo"), login("admin@blazeup.demo"), login("accounts@blazeup.demo"), login("personnel@blazeup.demo")]);
  const users = { HR_ADMIN: await User.findById(hrSession.user.id), REPORTING_MANAGER: await User.findById(managerSession.user.id), ADMIN: await User.findById(adminSession.user.id), ACCOUNTS: await User.findById(accountsSession.user.id), PERSONNEL: await User.findById(personnelSession.user.id) };
  await request(app).get("/api/employees").expect(401);
  await request(app).get("/api/employees").set(auth(hrSession.token)).expect(200);

  const suffix = Date.now();
  const employee = await createTestEmployee(suffix, users.REPORTING_MANAGER._id);
  const created = await request(app).post("/api/offboarding").set(auth(hrSession.token)).send({ employeeId: employee._id, resignationDate: "2026-09-01", lastWorkingDay: "2026-09-30", reason: "Full workflow contract test" }).expect(201);
  const offboarding = created.body.offboarding;
  if (!created.body.workflow || offboarding.status !== "IN_PROGRESS") throw new Error("Offboarding did not automatically create an in-progress workflow");
  await request(app).post("/api/offboarding").set(auth(hrSession.token)).send({ employeeId: employee._id, resignationDate: "2026-09-01", lastWorkingDay: "2026-09-30" }).expect(400);
  const workflowId = offboarding.workflowInstance;

  let payload = await details(managerSession.token, workflowId);
  let task = pendingTask(payload, "REPORTING_MANAGER");
  assertTaskOwner(task, users.REPORTING_MANAGER, "REPORTING_MANAGER");
  await request(app).post(`/api/workflows/tasks/${task._id}/approve`).set(auth(managerSession.token)).send({ checklist: task.checklist.map(() => ({ completed: false })) }).expect(400);
  await request(app).post(`/api/workflows/tasks/${task._id}/approve`).set(auth(adminSession.token)).send({ checklist: task.checklist }).expect(400);
  await approve(managerSession.token, task);

  payload = await details(adminSession.token, workflowId);
  const adminTask = pendingTask(payload, "ADMIN");
  const accountsTask = pendingTask(payload, "ACCOUNTS");
  assertTaskOwner(adminTask, users.ADMIN, "ADMIN");
  assertTaskOwner(accountsTask, users.ACCOUNTS, "ACCOUNTS");
  await request(app).post(`/api/workflows/tasks/${adminTask._id}/revoke-access`).set(auth(adminSession.token)).send({ accessType: "Email" }).expect(200);
  await approve(adminSession.token, adminTask);
  payload = await details(accountsSession.token, workflowId);
  if (pendingTask(payload, "PERSONNEL")) throw new Error("Personnel activated before both parallel tasks were approved");
  task = pendingTask(payload, "ACCOUNTS"); assertTaskOwner(task, users.ACCOUNTS, "ACCOUNTS after Admin approval"); await request(app).post(`/api/offboarding/${offboarding._id}/reminder`).set(auth(hrSession.token)).expect(200); await approve(accountsSession.token, task);

  payload = await details(personnelSession.token, workflowId); task = pendingTask(payload, "PERSONNEL"); assertTaskOwner(task, users.PERSONNEL, "PERSONNEL"); await approve(personnelSession.token, task);
  payload = await details(hrSession.token, workflowId); task = pendingTask(payload, "HR_ADMIN"); assertTaskOwner(task, users.HR_ADMIN, "HR_ADMIN"); await approve(hrSession.token, task);
  const [workflow, completedOffboarding, completedEmployee] = await Promise.all([WorkflowInstance.findById(workflowId), Offboarding.findById(offboarding._id), Employee.findById(employee._id)]);
  if (workflow.status !== "COMPLETED" || completedOffboarding.status !== "COMPLETED" || completedEmployee.status !== "OFFBOARDED") throw new Error("Final workflow completion state did not persist");
  for (const kind of ["resignation", "noc", "relieving"]) await request(app).get(`/api/offboarding/${offboarding._id}/documents/${kind}`).set(auth(hrSession.token)).expect("Content-Type", /pdf/).expect(200);

  const rejectedEmployee = await createTestEmployee(`${suffix}-R`, users.REPORTING_MANAGER._id);
  const rejected = await request(app).post("/api/offboarding").set(auth(hrSession.token)).send({ employeeId: rejectedEmployee._id, resignationDate: "2026-09-02", lastWorkingDay: "2026-09-30", reason: "Rejection contract test" }).expect(201);
  const rejectedTask = pendingTask(await details(managerSession.token, rejected.body.offboarding.workflowInstance), "REPORTING_MANAGER");
  await request(app).post(`/api/workflows/tasks/${rejectedTask._id}/reject`).set(auth(managerSession.token)).send({ remarks: "Outstanding handover is incomplete" }).expect(200);
  if ((await WorkflowInstance.findById(rejected.body.offboarding.workflowInstance)).status !== "REJECTED") throw new Error("Workflow rejection state did not persist");
  if (!await Notification.exists({ recipient: { $exists: true } })) throw new Error("Notifications were not generated");
  console.log(JSON.stringify({ pass: true, offboarding: String(offboarding._id), workflow: String(workflowId), verifiedRoles: Object.keys(users) }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
