import { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.7),_transparent_28%),linear-gradient(180deg,#f3f8ff_0%,#edf3ff_40%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute left-0 top-10 h-80 w-80 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="animate-float-medium absolute right-0 top-32 h-96 w-96 rounded-full bg-brand-deep/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 lg:px-6">
        <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="hero-card overflow-hidden rounded-[32px] p-6 text-white shadow-[0_30px_80px_rgba(19,49,92,0.22)] lg:p-8">
            <Link to="/" className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/15">
              SmartForm
            </Link>
            <div className="mt-10 max-w-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">Plataforma inteligente</p>
              <h1 className="mt-4 font-display text-4xl font-semibold lg:text-6xl">{title}</h1>
              <p className="mt-5 max-w-lg text-sm text-white/85 lg:text-base">{description}</p>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Extrae</p>
                <p className="mt-2 text-lg font-semibold">IA + OCR</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Revisa</p>
                <p className="mt-2 text-lg font-semibold">Data-grid</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Exporta</p>
                <p className="mt-2 text-lg font-semibold">XLSX final</p>
              </div>
            </div>
          </section>

          <section className="glass-panel flex items-center rounded-[32px] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)] lg:p-6">
            <div className="w-full">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
