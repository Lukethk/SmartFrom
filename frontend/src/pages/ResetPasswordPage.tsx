import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { confirmPasswordReset } from "../api/client";
import { AuthShell } from "../components/AuthShell";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await confirmPasswordReset(token, password);
      setMessage(res.message);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <AuthShell
      title="Restablece tu contraseña con seguridad"
      description="Pega tu token temporal, crea una nueva clave y vuelve al flujo de trabajo sin perder contexto."
    >
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <h2 className="font-display text-3xl font-semibold text-brand-deep">Restablecer contraseña</h2>
          <p className="mt-2 text-sm text-slate-600">Usa el token recibido para definir una nueva contraseña segura.</p>
        </div>
        <input className="soft-input w-full font-mono text-sm" placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
        <input className="soft-input w-full" type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="cta-button w-full rounded-2xl px-4 py-3 font-semibold text-white" type="submit">Cambiar contraseña</button>
        {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <p className="text-sm text-slate-600"><Link to="/login" className="font-semibold text-brand-deep">Volver al login</Link></p>
      </form>
    </AuthShell>
  );
}
