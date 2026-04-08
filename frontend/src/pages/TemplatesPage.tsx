import { useEffect, useState } from "react";

import { listMappings, listTemplates, MappingProfile, Template } from "../api/client";
import { useAuth } from "../hooks/useAuth";

const employeeFields = [
  "Código",
  "Nombre",
  "Segundo Nombre",
  "Apellido Paterno",
  "Apellido Materno",
  "Profesión",
  "Dirección",
  "Sexo",
  "Fecha Nacimiento",
  "Pais",
  "Departamento",
  "Ciudad",
  "Procedencia",
  "Estado Civil",
  "Tipo Documento",
  "C.I.",
  "Tipo Planilla",
  "Sucursal",
  "Moneda",
  "Tipo Pago",
  "Expedido",
  "Telefono 1",
  "Telefono 2",
  "Móvil",
  "E_mail",
  "Pais Destino",
  "Departamento Destino",
  "Ciudad Destino",
  "Fecha Contrato",
  "Fecha Ingreso",
  "Haber Básico",
  "Hrs. Jornada Trabajo",
  "Cargo",
  "Tipo Sueldo",
  "Tipo Contrato",
  "AFP",
  "NUA",
  "Aporte AFP",
  "Area",
  "Centro de Costo",
  "Observación",
];

export default function TemplatesPage() {
  const { accessToken } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mappings, setMappings] = useState<MappingProfile[]>([]);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([listTemplates(accessToken), listMappings(accessToken)])
      .then(([tpl, map]) => {
        setTemplates(tpl);
        setMappings(map);
      })
      .catch(() => undefined);
  }, [accessToken]);

  return (
    <div className="space-y-6">
      <section className="hero-card overflow-hidden rounded-[30px] p-6 text-white lg:p-8">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">Excel disponibles</p>
          <h2 className="mt-3 font-display text-4xl font-semibold lg:text-5xl">Plantillas fijas, no editables</h2>
          <p className="mt-4 max-w-2xl text-sm text-white/85 lg:text-base">
            El usuario no configura el Excel. Solo selecciona el tipo disponible y carga la foto para generar el archivo.
          </p>
        </div>
      </section>

      <section className="card-surface rounded-[28px] p-5 lg:p-6">
        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-[24px] bg-brand-deep p-5 text-white shadow-lg shadow-brand-deep/15">
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">Opción activa</p>
            <h3 className="mt-3 font-display text-3xl font-semibold">
              {templates[0]?.name ?? "Empleados"}
            </h3>
            <p className="mt-3 text-sm text-white/85">
              Formato Importación Empleado.xlsx. Es el primer Excel predefinido del sistema.
            </p>
            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Estado</p>
              <p className="mt-1 text-sm font-semibold">Preset listo para usar</p>
            </div>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Campos que llena</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {employeeFields.map((field) => (
                <div key={field} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {field}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-brand-soft/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mapeo activo</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {mappings[0]?.name ?? "Mapeo Empleados"}
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
