import { FormEvent, useState } from "react";
import { Navigate } from "react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "./AuthProvider";

export default function Login() {
  const { firebaseUser, profile, loading, error, login, activateInvitation } =
    useAuth();
  const [mode, setMode] = useState<"login" | "activate">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (firebaseUser && profile) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setSubmitError(null);
    setNotice(null);
    try {
      if (mode === "activate") {
        await activateInvitation(fullName, email, password);
        setMode("login");
        setNotice(
          "Te enviamos un correo de verificación. Ábrelo antes de iniciar sesión.",
        );
      } else {
        await login(email, password);
      }
    } catch (reason) {
      setSubmitError(
        reason instanceof Error ? reason.message : "Error de acceso.",
      );
    }
  }

  return (
    <main className="business-auth-page">
      <section className="business-auth-brand">
        <div className="business-auth-mark" aria-hidden="true">
          Y
        </div>
        <p className="business-auth-eyebrow">YAPITA · NEGOCIOS</p>
        <h1>El centro de control de tu negocio.</h1>
        <p>
          Gestiona tus programas de lealtad, recompensas y promociones, y
          conecta con tus clientes desde un solo lugar.
        </p>
        <div className="business-auth-security">
          <ShieldCheck size={20} aria-hidden="true" />
          Acceso para propietarios y equipos autorizados.
        </div>
      </section>
      <section
        className="business-auth-panel"
        aria-labelledby="business-login-title"
      >
        <form
          onSubmit={submit}
          className="business-auth-card"
          aria-busy={loading}
        >
          <div>
            <p className="business-auth-eyebrow">PANEL DE NEGOCIOS</p>
            <h2 id="business-login-title">
              {mode === "login" ? "Bienvenido" : "Activa tu invitación"}
            </h2>
            <p className="business-auth-muted">
              {mode === "login"
                ? "Ingresa con tu cuenta de Yapita."
                : "Usa el correo invitado a tu comercio para crear tu cuenta."}
            </p>
          </div>
          {notice && (
            <div role="status" className="business-auth-alert success">
              {notice}
            </div>
          )}
          {(submitError || error) && (
            <div role="alert" className="business-auth-alert error">
              {submitError || error}
            </div>
          )}
          <fieldset disabled={loading}>
            {mode === "activate" && (
              <label>
                Nombre completo
                <input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Tu nombre completo"
                />
              </label>
            )}
            <label>
              Correo
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@tunegocio.com"
              />
            </label>
            <label>
              Contraseña
              <input
                required
                minLength={6}
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </label>
            <button
              type="submit"
              className="business-auth-primary"
              disabled={loading}
            >
              {loading
                ? "Procesando…"
                : mode === "login"
                  ? "Ingresar"
                  : "Crear cuenta y verificar"}
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="business-auth-text-button"
              disabled={loading}
              onClick={() => {
                setMode(mode === "login" ? "activate" : "login");
                setSubmitError(null);
                setNotice(null);
              }}
            >
              {mode === "login"
                ? "Primera vez: activar mi invitación"
                : "Ya tengo una cuenta"}
            </button>
          </fieldset>
        </form>
      </section>
    </main>
  );
}
