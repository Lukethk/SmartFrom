import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Batch, listBatches, listTemplates, Template } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { accessToken } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([listTemplates(accessToken), listBatches(accessToken)]).then(([t, b]) => {
      setTemplates(t);
      setBatches(b);
    }).catch(() => undefined);
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <section className="hero-card overflow-hidden rounded-[30px] p-6 text-white lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Dashboard operativo</p>
            <h2 className="mt-3 font-display text-4xl font-semibold lg:text-6xl">SmartForm en movimiento</h2>
            <p className="mt-4 max-w-2xl text-sm text-white/85 lg:text-base">
              Supervisa la creación de plantillas, el estado de los lotes y el flujo de validación desde una sola vista.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Plantillas</p>
              <p className="mt-1 text-2xl font-semibold">{templates.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Lotes</p>
              <p className="mt-1 text-2xl font-semibold">{batches.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Estado</p>
              <p className="mt-1 text-2xl font-semibold">Listo</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="card-surface rounded-[26px] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-brand-deep">Plantillas</h3>
            <Link to="/templates" className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-deep transition hover:bg-brand-deep hover:text-white">
              Gestionar
            </Link>
          </div>
          <p className="mt-4 text-5xl font-semibold text-slate-900">{templates.length}</p>
          <p className="mt-2 text-sm text-slate-600">Plantillas Excel disponibles para mapeo y exportación.</p>
        </article>

        <article className="card-surface rounded-[26px] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-brand-deep">Lotes</h3>
            <Link to="/validation" className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-deep transition hover:bg-brand-deep hover:text-white">
              Validar
            </Link>
          </div>
          <p className="mt-4 text-5xl font-semibold text-slate-900">{batches.length}</p>
          <p className="mt-2 text-sm text-slate-600">Procesos activos, listos o en revisión.</p>
        </article>

        <article className="card-surface rounded-[26px] p-5">
          <h3 className="font-display text-xl font-semibold text-brand-deep">Guía rápida</h3>
          <p className="mt-3 text-sm text-slate-600">
            Usa la sección de guía para aprender el flujo completo antes de operar con datos reales.
          </p>
          <Link to="/guide" className="mt-5 inline-flex rounded-full bg-brand-deep px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg">
            Abrir guía
          </Link>
        </article>
      </section>
    </div>
  );
}
