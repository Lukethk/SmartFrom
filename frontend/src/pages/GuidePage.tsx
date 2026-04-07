const steps = [
  {
    title: "1. Crea tu plantilla",
    desc: "Sube el archivo Excel base y define los campos lógicos que quieres reconocer.",
  },
  {
    title: "2. Configura el mapeo",
    desc: "Relaciona cada campo con la columna o celda exacta donde debe escribirse.",
  },
  {
    title: "3. Sube tus documentos",
    desc: "Arrastra imágenes o PDFs y deja que la IA extraiga la información inicial.",
  },
  {
    title: "4. Revisa y corrige",
    desc: "Usa la tabla editable para validar datos con confianza alta, media o baja.",
  },
  {
    title: "5. Exporta el resultado",
    desc: "Genera el .xlsx final listo para usar en escritorio sin perder formato.",
  },
];

const tips = [
  "Usa nombres de campos consistentes como `first_name`, `last_name`, `document_id`.",
  "Empieza con pocos campos para validar el flujo y luego escala el mapeo.",
  "Si un documento sale con baja confianza, revisa primero los campos marcados en amarillo o rojo.",
  "Mantén una sola plantilla por proceso al inicio para reducir errores de mapeo.",
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <section className="hero-card overflow-hidden rounded-[30px] p-6 text-white lg:p-8">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">Guía de usuario</p>
          <h3 className="mt-3 font-display text-3xl font-semibold lg:text-5xl">Aprende SmartForm en 5 pasos</h3>
          <p className="mt-4 max-w-2xl text-sm text-white/85 lg:text-base">
            Esta guía te lleva desde la creación de plantillas hasta la exportación final. Está pensada para que
            cualquier usuario pueda comenzar sin entrenamiento técnico previo.
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card-surface rounded-[26px] p-5">
          <h4 className="font-display text-2xl font-semibold text-brand-deep">Flujo recomendado</h4>
          <div className="mt-5 space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft font-semibold text-brand-deep">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="text-sm text-slate-600">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card-surface rounded-[26px] p-5">
          <h4 className="font-display text-2xl font-semibold text-brand-deep">Consejos prácticos</h4>
          <div className="mt-5 space-y-3">
            {tips.map((tip) => (
              <div key={tip} className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-sm text-slate-700 shadow-sm">
                {tip}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-brand-deep p-5 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">Soporte visual</p>
            <p className="mt-2 text-sm text-white/85">
              La interfaz resalta estados, confianza y acciones principales para reducir fricción y errores.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
