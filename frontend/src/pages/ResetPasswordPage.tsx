import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { confirmPasswordReset } from "../api/client";

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md" onSubmit={submit}>
        <h2 className="font-display text-2xl font-semibold text-brand-deep">Restablecer contraseña</h2>
        <input className="w-full rounded border p-2 font-mono text-sm" placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
        <input className="w-full rounded border p-2" type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full rounded bg-brand-deep py-2 font-semibold text-white" type="submit">Cambiar contraseña</button>
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <p className="text-sm"><Link to="/login" className="text-brand-deep">Volver al login</Link></p>
      </form>
    </div>
  );
}
