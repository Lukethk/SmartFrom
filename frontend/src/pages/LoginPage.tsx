import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../api/client";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setTokens } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login(email, password);
      setTokens(res.access_token, res.refresh_token);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <AuthShell
      title="Inicia sesión y retoma el control"
      description="Accede a tu espacio de trabajo, procesa lotes y exporta resultados en una interfaz más clara, moderna y rápida."
    >
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <h2 className="font-display text-3xl font-semibold text-brand-deep">Iniciar sesión</h2>
          <p className="mt-2 text-sm text-slate-600">Entra con tu correo y empieza a trabajar en tu flujo de documentos.</p>
        </div>
        <input className="soft-input w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="soft-input w-full" placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <button className="cta-button w-full rounded-2xl px-4 py-3 font-semibold text-white" type="submit">Entrar</button>
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-600">¿No tienes cuenta? <Link to="/register" className="font-semibold text-brand-deep">Regístrate</Link></p>
          <Link to="/forgot-password" className="font-semibold text-brand-deep">Olvidé mi contraseña</Link>
        </div>
      </form>
    </AuthShell>
  );
}
