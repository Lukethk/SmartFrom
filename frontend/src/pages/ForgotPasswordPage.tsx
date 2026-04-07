import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { requestPasswordReset } from "../api/client";
import { AuthShell } from "../components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await requestPasswordReset(email);
    setMessage(res.message);
  };

  return (
    <AuthShell
      title="Recupera el acceso en segundos"
      description="Si olvidaste tu contraseña, genera un token de recuperación y vuelve a entrar a tu cuenta."
    >
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <h2 className="font-display text-3xl font-semibold text-brand-deep">Recuperar contraseña</h2>
          <p className="mt-2 text-sm text-slate-600">Te generamos un token temporal para restablecer tu acceso.</p>
        </div>
        <input className="soft-input w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="cta-button w-full rounded-2xl px-4 py-3 font-semibold text-white" type="submit">Enviar token</button>
        {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
        <p className="text-sm text-slate-600"><Link to="/reset-password" className="font-semibold text-brand-deep">Ya tengo token</Link></p>
      </form>
    </AuthShell>
  );
}
