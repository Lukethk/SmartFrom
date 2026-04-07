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
      <section className="rounded-2xl bg-brand-deep p-6 text-white">
        <h2 className="font-display text-3xl">Panel de SmartForm</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-soft">
          Gestiona plantillas, procesa lotes de formularios y valida datos antes de exportar a Excel.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">Plantillas</h3>
            <Link to="/templates" className="text-sm text-brand-deep">Gestionar</Link>
          </div>
          <p className="mt-2 text-3xl font-semibold">{templates.length}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">Lotes</h3>
            <Link to="/validation" className="text-sm text-brand-deep">Validar</Link>
          </div>
          <p className="mt-2 text-3xl font-semibold">{batches.length}</p>
        </article>
      </section>
    </div>
  );
}
