import { FormEvent, useEffect, useState } from "react";

import {
  createMapping,
  createTemplate,
  listMappings,
  listTemplates,
  MappingProfile,
  saveTemplateFields,
  Template,
} from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function TemplatesPage() {
  const { accessToken } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mappings, setMappings] = useState<MappingProfile[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fieldsText, setFieldsText] = useState("first_name,Primer Nombre\nlast_name,Apellido\ndoc_id,Documento");
  const [mappingText, setMappingText] = useState("first_name:B\nlast_name:C\ndoc_id:D");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    if (!accessToken) return;
    const [t, m] = await Promise.all([listTemplates(accessToken), listMappings(accessToken)]);
    setTemplates(t);
    setMappings(m);
    if (t.length > 0 && !selectedTemplateId) setSelectedTemplateId(t[0].id);
  };

  useEffect(() => { refresh().catch(() => undefined); }, [accessToken]);

  const uploadTemplate = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || !file) return;
    const created = await createTemplate(accessToken, name, file);
    const fields = fieldsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [logical_key, label] = line.split(",");
        return { logical_key: logical_key.trim(), label: (label ?? logical_key).trim() };
      });
    await saveTemplateFields(accessToken, created.id, fields);
    await refresh();
    setMessage("Plantilla creada y campos guardados.");
  };

  const saveMapping = async () => {
    if (!accessToken || !selectedTemplateId) return;
    const mapping_json = Object.fromEntries(
      mappingText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [k, v] = line.split(":");
          return [k.trim(), v.trim()];
        }),
    );
    await createMapping(accessToken, {
      template_id: selectedTemplateId,
      name: `Mapeo ${new Date().toLocaleTimeString()}`,
      sheet_name: "Sheet1",
      start_row: 2,
      mapping_json,
    });
    await refresh();
    setMessage("Mapeo guardado.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-display text-xl text-brand-deep">Nueva plantilla</h2>
        <form className="space-y-3" onSubmit={uploadTemplate}>
          <input className="w-full rounded border p-2" placeholder="Nombre de plantilla" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full rounded border p-2" type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
          <textarea className="h-28 w-full rounded border p-2 font-mono text-sm" value={fieldsText} onChange={(e) => setFieldsText(e.target.value)} />
          <button className="rounded bg-brand-deep px-4 py-2 text-white" type="submit">Guardar plantilla</button>
        </form>
      </section>

      <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-display text-xl text-brand-deep">Mapeador visual (rápido)</h2>
        <select className="w-full rounded border p-2" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
          {templates.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
        </select>
        <textarea className="h-32 w-full rounded border p-2 font-mono text-sm" value={mappingText} onChange={(e) => setMappingText(e.target.value)} />
        <button className="rounded bg-brand-accent px-4 py-2 font-semibold" onClick={saveMapping}>Guardar mapeo</button>
        <p className="text-sm text-slate-600">{message}</p>
        <ul className="space-y-2 text-sm">
          {mappings.map((map) => (
            <li key={map.id} className="rounded border p-2">
              <span className="font-semibold">{map.name}</span> - {map.sheet_name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
