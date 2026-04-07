import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../api/client";
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md" onSubmit={submit}>
        <h2 className="font-display text-2xl font-semibold text-brand-deep">Crear cuenta</h2>
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Contraseña (8+)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded bg-brand-deep py-2 font-semibold text-white" type="submit">Registrarme</button>
        <p className="text-sm">¿Ya tienes cuenta? <Link to="/login" className="text-brand-deep">Inicia sesión</Link></p>
      </form>
    </div>
  );
}
