import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../api/client";
import { AuthShell } from "../components/AuthShell";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setTokens } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await register(email, password);
      setTokens(res.access_token, res.refresh_token);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <AuthShell
      title="Crea tu cuenta y construye tu flujo"
      description="Registra tu usuario, prepara tus plantillas y centraliza la validación de formularios en SmartForm."
    >
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <h2 className="font-display text-3xl font-semibold text-brand-deep">Crear cuenta</h2>
          <p className="mt-2 text-sm text-slate-600">Solo necesitas un correo y una contraseña segura para empezar.</p>
        </div>
        <input className="soft-input w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="soft-input w-full" placeholder="Contraseña (8+)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <button className="cta-button w-full rounded-2xl px-4 py-3 font-semibold text-white" type="submit">Registrarme</button>
        <p className="text-sm text-slate-600">¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-brand-deep">Inicia sesión</Link></p>
      </form>
    </AuthShell>
  );
}
