import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from './AuthProvider';

export default function Login() {
  const { firebaseUser, profile, loading, error, login } = useAuth();
  const { activateInvitation } = useAuth();
  const [mode, setMode] = useState<'login' | 'activate'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (firebaseUser && profile) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setNotice(null);
    try {
      if (mode === 'activate') {
        await activateInvitation(fullName, email, password);
        setMode('login');
        setNotice(
          'Te enviamos un correo de verificación. Ábrelo antes de iniciar sesión.',
        );
      } else {
        await login(email, password);
      }
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Error de acceso.');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-xl shadow p-8 space-y-5">
        <div>
          <p className="text-sm font-medium text-purple-600">Yapita Negocios</p>
          <h1 className="text-2xl text-gray-900 mt-1">
            {mode === 'login' ? 'Inicia sesión' : 'Activa tu invitación'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Usa exactamente el correo invitado al comercio.
          </p>
        </div>
        {notice && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {notice}
          </div>
        )}
        {(submitError || error) && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {submitError || error}
          </div>
        )}
        {mode === 'activate' && (
          <label className="block text-sm text-gray-700">
            Nombre completo
            <input
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-2 w-full px-4 py-2.5 border rounded-lg"
            />
          </label>
        )}
        <label className="block text-sm text-gray-700">
          Correo
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full px-4 py-2.5 border rounded-lg"
          />
        </label>
        <label className="block text-sm text-gray-700">
          Contraseña
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full px-4 py-2.5 border rounded-lg"
          />
        </label>
        <button
          disabled={loading}
          className="w-full bg-purple-600 text-white rounded-lg py-2.5 hover:bg-purple-700 disabled:opacity-60"
        >
          {loading
            ? 'Procesando…'
            : mode === 'login'
              ? 'Entrar'
              : 'Crear cuenta y verificar correo'}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'activate' : 'login');
            setSubmitError(null);
          }}
          className="w-full text-sm text-purple-600"
        >
          {mode === 'login'
            ? 'Tengo una invitación y aún no tengo cuenta'
            : 'Ya tengo cuenta'}
        </button>
      </form>
    </main>
  );
}
