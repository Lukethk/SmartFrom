import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { createBatch, listMappings, listTemplates, MappingProfile, Template } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { downloadFile } from "../lib/api";

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mappings, setMappings] = useState<MappingProfile[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedMappingId, setSelectedMappingId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [batchName, setBatchName] = useState("");
  const [message, setMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  const refresh = async () => {
    if (!accessToken) return;
    const [tpl, map] = await Promise.all([listTemplates(accessToken), listMappings(accessToken)]);
    setTemplates(tpl);
    setMappings(map);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [accessToken]);

  useEffect(() => {
    if (!selectedTemplateId && templates[0]) setSelectedTemplateId(templates[0].id);
  }, [templates, selectedTemplateId]);

  const templateMappings = useMemo(
    () => mappings.filter((mapping) => mapping.template_id === selectedTemplateId),
    [mappings, selectedTemplateId],
  );

  useEffect(() => {
    if (templateMappings.length > 0) {
      setSelectedMappingId(templateMappings[0].id);
    } else {
      setSelectedMappingId("");
    }
  }, [templateMappings]);

  const quickConvert = async () => {
    if (!accessToken) return;
    if (!selectedTemplateId) {
      setMessage("Primero crea o elige una plantilla.");
      return;
    }
    if (!selectedMappingId) {
      setMessage("La plantilla seleccionada no tiene mapeo. Crea uno en Plantillas.");
      return;
    }
    if (files.length === 0) {
      setMessage("Sube al menos una foto o PDF para convertir.");
      return;
    }

    setIsWorking(true);
    setMessage("Procesando la imagen y generando el Excel...");
    try {
      const batch = await createBatch(accessToken, selectedTemplateId, batchName || "Lote rápido", files);
      await downloadFile("/exports/xlsx", accessToken, {
        batch_id: batch.id,
        mapping_profile_id: selectedMappingId,
        include_only_validated: true,
      });
      setMessage("Listo. Tu Excel ya se descargó.");
      await refresh();
      setFiles([]);
      setBatchName("");
    } catch (error) {
      setMessage((error as Error).message || "No se pudo convertir la foto.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="hero-card overflow-hidden rounded-[30px] p-6 text-white lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Inicio rápido</p>
            <h2 className="mt-3 font-display text-4xl font-semibold lg:text-6xl">Sube la foto y obtén tu Excel</h2>
            <p className="mt-4 max-w-2xl text-sm text-white/85 lg:text-base">
              SmartForm está pensado para una sola tarea principal: cargar una imagen o PDF, convertirlo con IA y descargar el Excel final.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">1</p>
              <p className="mt-1 text-lg font-semibold">Sube la foto</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">2</p>
              <p className="mt-1 text-lg font-semibold">Procesa</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">3</p>
              <p className="mt-1 text-lg font-semibold">Descarga Excel</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface rounded-[28px] p-5 lg:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Paso principal</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-brand-deep">Convierte en un clic</h3>
              <p className="mt-2 text-sm text-slate-600">
                Selecciona una plantilla, sube tus fotos y deja que el sistema entregue el archivo Excel listo para usar.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Plantilla</span>
                <select
                  className="soft-input w-full"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                  <option value="">Selecciona una plantilla</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Nombre del lote</span>
                <input
                  className="soft-input w-full"
                  placeholder="Ej. fotos de enero"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Sube la foto o PDF</span>
              <input
                className="soft-input w-full file:mr-4 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-deep"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="cta-button rounded-2xl px-5 py-3 font-semibold text-white" onClick={quickConvert} disabled={isWorking}>
                {isWorking ? "Procesando..." : "Convertir a Excel"}
              </button>
              <Link to="/templates" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                Crear plantilla
              </Link>
              <Link to="/guide" className="rounded-2xl border border-transparent px-5 py-3 font-semibold text-brand-deep transition hover:bg-brand-soft">
                Ver guía
              </Link>
            </div>

            {message ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {message}
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Modo simple</p>
            <h4 className="mt-2 font-display text-2xl font-semibold text-brand-deep">Sin complicaciones</h4>
            <p className="mt-3 text-sm text-slate-600">
              Si ya tienes una plantilla y su mapeo, el flujo principal se reduce a subir el archivo y descargar el Excel.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-brand-soft/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Plantilla activa</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {templates.find((tpl) => tpl.id === selectedTemplateId)?.name ?? "Ninguna seleccionada"}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-soft/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Mapeo activo</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {templateMappings.find((map) => map.id === selectedMappingId)?.name ?? "Sin mapeo"}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-soft/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Archivos cargados</p>
                <p className="mt-1 font-semibold text-slate-900">{files.length} archivo(s)</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-brand-deep p-4 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Consejo</p>
              <p className="mt-2 text-sm text-white/85">
                Mantén una sola plantilla por proceso para que el flujo sea realmente de un clic.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
