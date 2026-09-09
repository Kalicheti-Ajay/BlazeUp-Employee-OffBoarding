const PDFDocument = require("pdfkit");
const Offboarding = require("../models/Offboarding");
const ClearanceTask = require("../models/ClearanceTask");
const { createAuditLog } = require("../services/workflowService");

const titles = { resignation: "Resignation Acceptance Letter", noc: "No Objection / Clearance Certificate", relieving: "Experience and Relieving Letter" };
exports.downloadDocument = async (req, res) => {
  try {
    const offboarding = await Offboarding.findById(req.params.id).populate("employee").populate("workflowInstance");
    if (!offboarding) return res.status(404).json({ success: false, message: "Offboarding record not found" });
    if (offboarding.status !== "COMPLETED") return res.status(400).json({ success: false, message: "Documents are available after final clearance" });
    const kind = req.params.kind;
    if (!titles[kind]) return res.status(404).json({ success: false, message: "Document type not found" });
    const employee = offboarding.employee;
    const tasks = await ClearanceTask.find({ workflowInstance: offboarding.workflowInstance._id }).populate("assignedTo", "name role");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${kind}-${employee.employeeId}.pdf`);
    const doc = new PDFDocument({ margin: 60 }); doc.pipe(res);
    doc.fontSize(20).fillColor("#163b65").text("BLAZEUP HROS", { align: "center" });
    doc.moveDown().fontSize(16).fillColor("#111827").text(titles[kind], { align: "center" });
    doc.moveDown(2).fontSize(11).text(`Date: ${new Date().toLocaleDateString("en-IN")}`);
    doc.moveDown().text(`Employee: ${employee.name} (${employee.employeeId})`);
    doc.text(`Designation: ${employee.designation} | Department: ${employee.department}`);
    doc.text(`Joining date: ${new Date(employee.joiningDate).toLocaleDateString("en-IN")}`);
    doc.text(`Last working day: ${new Date(offboarding.lastWorkingDay).toLocaleDateString("en-IN")}`);
    doc.moveDown();
    const common = `This is to confirm that ${employee.name}'s resignation dated ${new Date(offboarding.resignationDate).toLocaleDateString("en-IN")} has been accepted and their employment concludes on ${new Date(offboarding.lastWorkingDay).toLocaleDateString("en-IN")}.`;
    if (kind === "resignation") doc.text(`${common}\n\nThe employee remains bound by all applicable confidentiality, non-compete and non-solicitation obligations.\n\nRegards,\nHuman Resources, BlazeUp`);
    if (kind === "relieving") doc.text(`${employee.name} has been relieved from their duties following completion of the exit process. We appreciate their contribution and wish them success in their future endeavours.\n\nRegards,\nHuman Resources, BlazeUp`);
    if (kind === "noc") { doc.text("All required departmental clearances have been completed:"); tasks.forEach(t => doc.text(`• ${t.stageName} — approved by ${t.assignedTo?.name || t.role} on ${new Date(t.actionAt).toLocaleDateString("en-IN")}`)); doc.moveDown().text("This certificate records that no outstanding internal clearance remains."); }
    doc.end();
    createAuditLog({ process: "OFFBOARDING", referenceId: offboarding._id, action: "DOCUMENT_GENERATED", description: `${titles[kind]} downloaded`, performedBy: req.user.id, role: req.user.role }).catch(() => {});
  } catch (error) { if (!res.headersSent) res.status(500).json({ success: false, message: error.message }); }
};
