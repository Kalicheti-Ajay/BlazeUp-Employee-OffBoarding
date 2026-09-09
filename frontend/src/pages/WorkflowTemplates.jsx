import { useEffect, useState } from "react";
import api from "../services/api";
import { getWorkflowTemplates } from "../services/workflowService";

const roles = ["REPORTING_MANAGER", "ADMIN", "ACCOUNTS", "PERSONNEL", "HR_ADMIN"];
const newTemplate = () => ({ name: "", process: "OFFBOARDING", isActive: true, stages: [{ name: "Project Clearance", role: "REPORTING_MANAGER", order: 1, executionType: "SEQUENTIAL", checklist: [{ label: "Knowledge transfer completed", required: true }] }] });

export default function WorkflowTemplates() {
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(newTemplate);
  const load = async () => { try { setTemplates(await getWorkflowTemplates()); } catch (e) { setError(e.response?.data?.message || "Unable to load templates"); } };
  useEffect(() => { load(); }, []);
  const save = async (e) => { e.preventDefault(); try { setSaving(true); setError(""); const payload = { ...form, stages: form.stages.map(stage => ({ ...stage, order: Number(stage.order) })) }; if (editingId) await api.put(`/workflow-templates/${editingId}`, payload); else await api.post("/workflow-templates", payload); setForm(newTemplate()); setEditingId(null); await load(); } catch (err) { setError(err.response?.data?.message || "Unable to save template"); } finally { setSaving(false); } };
  const changeStage = (index, key, value) => setForm(current => ({ ...current, stages: current.stages.map((stage, i) => i === index ? { ...stage, [key]: value } : stage) }));
  const editTemplate = (template) => { setEditingId(template._id); setForm({ name: template.name, process: template.process, isActive: template.isActive, stages: template.stages.map(({ name, role, order, executionType, checklist }) => ({ name, role, order, executionType, checklist: checklist?.map(({ label, required }) => ({ label, required })) || [] })) }); };
  const cancelEdit = () => { setEditingId(null); setForm(newTemplate()); };

  return <div className="page-container"><div className="page-header"><div><p className="eyebrow">HR ADMIN</p><h1>Workflow Templates</h1><p className="page-description">Configure reusable approval stages. Equal order numbers activate in parallel.</p></div></div>{error && <div className="alert alert-error">{error}</div>}<section className="card"><h2>{editingId ? "Edit template" : "Create template"}</h2><form className="form-card" onSubmit={save}><input placeholder="Template name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />{form.stages.map((stage, index) => <div className="detail-info-grid" key={index}><input placeholder="Stage name" value={stage.name} onChange={e => changeStage(index, "name", e.target.value)} required /><select value={stage.role} onChange={e => changeStage(index, "role", e.target.value)}>{roles.map(role => <option key={role}>{role}</option>)}</select><input type="number" min="1" value={stage.order} onChange={e => changeStage(index, "order", e.target.value)} /><input placeholder="Required checklist item" value={stage.checklist?.[0]?.label || ""} onChange={e => changeStage(index, "checklist", [{ label: e.target.value, required: true }])} /><button type="button" className="btn btn-secondary" onClick={() => setForm({ ...form, stages: form.stages.filter((_, i) => i !== index) })}>Remove</button></div>)}<div className="header-actions"><button type="button" className="btn btn-secondary" onClick={() => setForm({ ...form, stages: [...form.stages, { name: "", role: "ADMIN", order: form.stages.length + 1, executionType: "SEQUENTIAL", checklist: [] }] })}>Add stage</button>{editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel edit</button>}<button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save template"}</button></div></form></section><section className="card"><h2>Existing templates</h2>{templates.map(template => <div className="case-row" key={template._id}><div className="case-info"><strong>{template.name}</strong><span>{template.stages.length} stages · {template.isActive ? "Active" : "Inactive"}</span></div><button className="btn btn-secondary" onClick={() => editTemplate(template)}>Edit</button></div>)}</section></div>;
}
