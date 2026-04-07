import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="font-display text-xl font-semibold text-brand-deep">SmartForm</h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:text-brand-deep">Dashboard</Link>
            <Link to="/templates" className="hover:text-brand-deep">Plantillas</Link>
            <button
              className="rounded bg-brand-accent px-3 py-1 font-semibold"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Salir
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
