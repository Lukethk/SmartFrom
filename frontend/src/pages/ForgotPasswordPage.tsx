import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { requestPasswordReset } from "../api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await requestPasswordReset(email);
    setMessage(res.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md" onSubmit={submit}>
        <h2 className="font-display text-2xl font-semibold text-brand-deep">Recuperar contraseña</h2>
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="w-full rounded bg-brand-deep py-2 font-semibold text-white" type="submit">Enviar token</button>
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}
        <p className="text-sm"><Link to="/reset-password" className="text-brand-deep">Ya tengo token</Link></p>
      </form>
    </div>
  );
}
