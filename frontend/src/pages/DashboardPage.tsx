import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { createBatch, listMappings, listTemplates, MappingProfile, Template } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { downloadFile } from "../lib/api";

const EMPLOYEE_TEMPLATE_NAME = "Empleados";

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mappings, setMappings] = useState<MappingProfile[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
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
    const employeeTemplate = templates.find((tpl) => tpl.name === EMPLOYEE_TEMPLATE_NAME) ?? templates[0];
    if (employeeTemplate) setSelectedTemplateId(employeeTemplate.id);
  }, [templates]);

  const activeTemplate = useMemo(
    () => templates.find((tpl) => tpl.id === selectedTemplateId) ?? templates.find((tpl) => tpl.name === EMPLOYEE_TEMPLATE_NAME),
    [templates, selectedTemplateId],
  );
  const activeMapping = useMemo(
    () => mappings.find((map) => map.template_id === activeTemplate?.id) ?? mappings[0],
    [mappings, activeTemplate],
  );

  const quickConvert = async () => {
    if (!accessToken) return;
    if (!activeTemplate) {
      setMessage("No se encontró el Excel de empleados.");
      return;
    }
    if (!activeMapping) {
      setMessage("El preset de empleados no se cargó correctamente.");
      return;
    }
    if (files.length === 0) {
      setMessage("Sube una foto o PDF para convertir.");
      return;
    }

    setIsWorking(true);
    setMessage("Procesando la imagen y generando el Excel...");
    try {
      const batch = await createBatch(accessToken, activeTemplate.id, "Importación de empleados", files);
      await downloadFile("/exports/xlsx", accessToken, {
        batch_id: batch.id,
        mapping_profile_id: activeMapping.id,
        include_only_validated: false,
      });
      setMessage("Listo. Tu Excel de empleados ya se descargó.");
      await refresh();
      setFiles([]);
    } catch (error) {
      setMessage((error as Error).message || "No se pudo convertir la foto.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="hero-card overflow-hidden rounded-[34px] p-6 text-white lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.38em] text-white/70">Flujo simple</p>
            <h2 className="mt-3 font-display text-4xl font-semibold lg:text-6xl">Sube la foto y descarga el Excel</h2>
            <p className="mt-4 max-w-xl text-sm text-white/85 lg:text-base">
              El sistema está pensado para una sola acción principal: tomar una foto o PDF, procesarlo y exportarlo al Excel de empleados.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">1</p>
              <p className="mt-1 text-lg font-semibold">Selecciona Excel</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">2</p>
              <p className="mt-1 text-lg font-semibold">Sube foto</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">3</p>
              <p className="mt-1 text-lg font-semibold">Descarga</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="card-surface rounded-[32px] p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Acción principal</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-brand-deep">Convertir a Excel</h3>
            </div>
            <div className="rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-deep">
              Preset: Empleados
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Excel activo</p>
              <div className="mt-3 rounded-2xl bg-brand-deep p-4 text-white">
                <p className="font-display text-2xl font-semibold">{activeTemplate?.name ?? "Empleados"}</p>
                <p className="mt-1 text-sm text-white/80">Formato Importación Empleado.xlsx</p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>• Plantilla fija, no editable.</p>
                <p>• Mapeo automático para empleados.</p>
                <p>• Descarga lista para usar.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Sube la foto o PDF</span>
                <div className="rounded-[28px] border border-dashed border-brand-deep/25 bg-gradient-to-br from-white to-brand-soft/40 p-4 transition hover:border-brand-deep/40">
                  <input
                    className="soft-input w-full file:mr-4 file:rounded-full file:border-0 file:bg-brand-deep file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  />
                  <p className="mt-3 text-sm text-slate-600">
                    Puedes subir una o varias fotos. HEIC, JPG, PNG y PDF quedan cubiertos por el flujo simplificado.
                  </p>
                </div>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="cta-button rounded-2xl px-5 py-3 font-semibold text-white"
                  onClick={quickConvert}
                  disabled={isWorking}
                >
                  {isWorking ? "Procesando..." : "Convertir a Excel"}
                </button>
                <Link to="/guide" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  Ver guía
                </Link>
              </div>

              {message ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="card-surface rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Estado</p>
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Listo para usar</p>
                <p className="mt-1 font-semibold text-slate-900">Preset de empleados cargado</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Archivos</p>
                <p className="mt-1 font-semibold text-slate-900">{files.length} archivo(s) seleccionado(s)</p>
              </div>
              <div className="rounded-2xl bg-brand-soft/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mapeo</p>
                <p className="mt-1 font-semibold text-slate-900">{activeMapping?.name ?? "Mapeo Empleados"}</p>
              </div>
            </div>
          </div>

          <div className="card-surface rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Resumen</p>
            <h4 className="mt-2 font-display text-2xl font-semibold text-brand-deep">Una sola acción</h4>
            <p className="mt-3 text-sm text-slate-600">
              La interfaz fue reducida para que el usuario no tenga que configurar nada. Solo selecciona el Excel de empleados y sube la foto.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
