import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/", label: "Inicio rápido", hint: "Sube y convierte" },
  { to: "/templates", label: "Excel", hint: "Empleados" },
  { to: "/guide", label: "Guía", hint: "Cómo usar la plataforma" },
];

export function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.65),_transparent_30%),linear-gradient(180deg,#f5f9ff_0%,#eef4ff_38%,#f8fafc_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -left-24 top-12 h-72 w-72 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="animate-float-medium absolute right-0 top-40 h-96 w-96 rounded-full bg-brand-deep/20 blur-3xl" />
        <div className="animate-float-fast absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 lg:p-6">
        <aside className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-[290px] shrink-0 flex-col rounded-[28px] p-5 shadow-[0_25px_80px_rgba(15,23,42,0.18)] lg:flex">
          <div className="rounded-[24px] bg-brand-deep px-5 py-5 text-white shadow-lg shadow-brand-deep/20">
            <p className="text-xs uppercase tracking-[0.32em] text-brand-soft/80">SmartForm</p>
            <h1 className="mt-2 font-display text-2xl font-semibold">Sube la foto y obtén tu Excel</h1>
            <p className="mt-2 text-sm text-brand-soft/90">
              Un flujo simple para convertir imágenes de formularios en archivos Excel listos para usar.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "group block rounded-2xl border px-4 py-4 transition-all duration-300",
                    isActive
                      ? "border-brand-deep/20 bg-white text-brand-deep shadow-lg shadow-slate-200/60"
                      : "border-transparent bg-white/55 text-slate-700 hover:-translate-y-0.5 hover:bg-white hover:shadow-md",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-1 h-2.5 w-2.5 rounded-full transition-all",
                        isActive ? "bg-brand-deep shadow-[0_0_0_6px_rgba(19,49,92,0.1)]" : "bg-brand-accent",
                      ].join(" ")}
                    />
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.hint}</p>
                    </div>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Atajos</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>Excel de empleados</span>
                <span className="rounded-full bg-brand-soft px-2 py-1 text-xs text-brand-deep">Fijo</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>Exportar xlsx</span>
                <span className="rounded-full bg-brand-soft px-2 py-1 text-xs text-brand-deep">Final</span>
              </div>
            </div>
          </div>

          <button
            className="mt-auto rounded-2xl bg-brand-deep px-4 py-3 font-semibold text-white shadow-lg shadow-brand-deep/25 transition hover:-translate-y-0.5 hover:shadow-xl"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Cerrar sesión
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="glass-panel flex items-center justify-between rounded-[28px] px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)] lg:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">SmartForm / Workspace</p>
              <h2 className="font-display text-xl font-semibold text-slate-900 lg:text-2xl">
                Plataforma para captura y exportación inteligente
              </h2>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                Servicio activo
              </div>
              <div className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
                Validación asistida
              </div>
            </div>
          </header>

          <div className="glass-panel flex gap-2 overflow-x-auto rounded-[22px] px-3 py-3 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    isActive ? "bg-brand-deep text-white shadow-lg" : "bg-white/90 text-slate-700 hover:bg-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              className="shrink-0 rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-slate-900"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Salir
            </button>
          </div>

          <main className="glass-panel min-h-[calc(100vh-10rem)] rounded-[28px] p-4 shadow-[0_25px_80px_rgba(15,23,42,0.12)] lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
