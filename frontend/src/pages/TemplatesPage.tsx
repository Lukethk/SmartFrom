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
    <div className="grid gap-6 xl:grid-cols-5">
      <section className="card-surface space-y-4 rounded-[26px] p-5 xl:col-span-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Configuración</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-brand-deep">Nueva plantilla</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sube tu Excel base, define los campos lógicos y deja listo el mapeo para procesar lotes con consistencia.
          </p>
        </div>
        <form className="space-y-3" onSubmit={uploadTemplate}>
          <input className="soft-input w-full" placeholder="Nombre de plantilla" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="soft-input w-full" type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
          <textarea className="soft-input h-32 w-full font-mono text-sm" value={fieldsText} onChange={(e) => setFieldsText(e.target.value)} />
          <button className="cta-button rounded-2xl px-4 py-3 text-white" type="submit">Guardar plantilla</button>
        </form>
      </section>

      <section className="card-surface space-y-4 rounded-[26px] p-5 xl:col-span-2">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Mapeo</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-brand-deep">Mapeador visual</h2>
          <p className="mt-2 text-sm text-slate-600">
            Define cómo cada campo lógico cae en columnas reales del Excel.
          </p>
        </div>
        <select className="soft-input w-full" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
          {templates.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
        </select>
        <textarea className="soft-input h-36 w-full font-mono text-sm" value={mappingText} onChange={(e) => setMappingText(e.target.value)} />
        <button className="cta-button rounded-2xl px-4 py-3 font-semibold text-white" onClick={saveMapping}>Guardar mapeo</button>
        <p className="text-sm text-slate-600">{message}</p>
        <ul className="space-y-2 text-sm">
          {mappings.map((map) => (
            <li key={map.id} className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
              <span className="font-semibold">{map.name}</span> - {map.sheet_name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
