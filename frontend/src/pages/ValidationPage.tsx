import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

import {
  Batch,
  createBatch,
  Extraction,
  listBatches,
  listExtractionsByBatch,
  listMappings,
  listTemplates,
  MappingProfile,
  patchExtraction,
  Template,
} from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { downloadFile } from "../lib/api";

type EditableCell = {
  id: string;
  extractionId: string;
  logical_key: string;
  normalized_value: string;
  confidence: number;
  source_bbox: Record<string, number>;
  is_validated: boolean;
};

export default function ValidationPage() {
  const { accessToken } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mappings, setMappings] = useState<MappingProfile[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedMappingId, setSelectedMappingId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<EditableCell[]>([]);
  const deferredSearch = useDeferredValue(search);

  const loadBase = async () => {
    if (!accessToken) return;
    const [tpl, map, bat] = await Promise.all([listTemplates(accessToken), listMappings(accessToken), listBatches(accessToken)]);
    setTemplates(tpl);
    setMappings(map);
    setBatches(bat);
    if (tpl[0]) setSelectedTemplateId((prev) => prev || tpl[0].id);
    if (map[0]) setSelectedMappingId((prev) => prev || map[0].id);
    if (bat[0]) setSelectedBatchId((prev) => prev || bat[0].id);
  };

  const loadExtractions = async (batchId: string) => {
    if (!accessToken || !batchId) return;
    const extractions = await listExtractionsByBatch(accessToken, batchId);
    const nextRows: EditableCell[] = [];
    extractions.forEach((extraction: Extraction) => {
      extraction.cells.forEach((cell) => {
        nextRows.push({
          id: cell.id,
          extractionId: extraction.id,
          logical_key: cell.logical_key,
          normalized_value: cell.normalized_value || cell.raw_text,
          confidence: cell.confidence,
          source_bbox: cell.source_bbox,
          is_validated: cell.is_validated,
        });
      });
    });
    setRows(nextRows);
  };

  useEffect(() => { loadBase().catch(() => undefined); }, [accessToken]);
  useEffect(() => { loadExtractions(selectedBatchId).catch(() => undefined); }, [selectedBatchId]);

  const filteredRows = useMemo(
    () => rows.filter((row) => row.logical_key.toLowerCase().includes(deferredSearch.toLowerCase())),
    [rows, deferredSearch],
  );

  const createNewBatch = async () => {
    if (!accessToken || !selectedTemplateId || files.length === 0) return;
    await createBatch(accessToken, selectedTemplateId, batchName || `Lote ${Date.now()}`, files);
    await loadBase();
  };

  const saveEdits = async () => {
    if (!accessToken) return;
    const byExtraction = new Map<string, EditableCell[]>();
    rows.forEach((row) => {
      const arr = byExtraction.get(row.extractionId) ?? [];
      arr.push(row);
      byExtraction.set(row.extractionId, arr);
    });
    await Promise.all(
      Array.from(byExtraction.entries()).map(([extractionId, items]) =>
        patchExtraction(
          accessToken,
          extractionId,
          items.map((item) => ({
            id: item.id,
            normalized_value: item.normalized_value,
            is_validated: item.is_validated,
          })),
        ),
      ),
    );
    await loadBase();
  };

  const exportBatch = async () => {
    if (!accessToken || !selectedBatchId || !selectedMappingId) return;
    await downloadFile("/exports/xlsx", accessToken, {
      batch_id: selectedBatchId,
      mapping_profile_id: selectedMappingId,
      include_only_validated: true,
    });
  };

  const Row = ({ index, style }: ListChildComponentProps) => {
    const row = filteredRows[index];
    if (!row) return <div style={style} />;
    const color = row.confidence < 0.6 ? "bg-red-50" : row.confidence < 0.85 ? "bg-yellow-50" : "bg-green-50";
    return (
      <div style={style} className={`grid grid-cols-12 items-center gap-2 border-b px-2 text-sm ${color}`}>
        <div className="col-span-3 font-mono">{row.logical_key}</div>
        <input
          className="col-span-5 rounded border p-1"
          value={row.normalized_value}
          onChange={(e) => {
            const value = e.target.value;
            startTransition(() => {
              setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, normalized_value: value } : item)));
            });
          }}
        />
        <div className="col-span-2 text-xs">{Math.round(row.confidence * 100)}%</div>
        <label className="col-span-2 flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={row.is_validated}
            onChange={(e) => {
              const checked = e.target.checked;
              setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, is_validated: checked } : item)));
            }}
          />
          Validado
        </label>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="card-surface grid gap-4 rounded-[26px] p-5 md:grid-cols-4">
        <select className="soft-input rounded-2xl p-3" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
          {templates.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
        </select>
        <input className="soft-input rounded-2xl p-3" placeholder="Nombre del lote" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
        <input className="soft-input rounded-2xl p-3" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        <button className="cta-button rounded-2xl px-4 py-3 text-white" onClick={createNewBatch}>Crear lote</button>
      </section>

      <section className="card-surface grid gap-4 rounded-[26px] p-5 md:grid-cols-4">
        <select className="soft-input rounded-2xl p-3" value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.status})</option>)}
        </select>
        <select className="soft-input rounded-2xl p-3" value={selectedMappingId} onChange={(e) => setSelectedMappingId(e.target.value)}>
          {mappings.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input className="soft-input rounded-2xl p-3" placeholder="Filtrar por logical key" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2">
          <button className="cta-button rounded-2xl px-4 py-3 font-semibold text-white" onClick={saveEdits}>Guardar validación</button>
          <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" onClick={exportBatch}>Exportar</button>
        </div>
      </section>

      <section className="card-surface overflow-hidden rounded-[26px] p-4">
        <div className="mb-3 grid grid-cols-12 gap-2 border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <div className="col-span-3">Campo</div>
          <div className="col-span-5">Valor</div>
          <div className="col-span-2">Confianza</div>
          <div className="col-span-2">Estado</div>
        </div>
        <List height={480} itemCount={filteredRows.length} itemSize={52} width="100%">
          {Row}
        </List>
      </section>
    </div>
  );
}
