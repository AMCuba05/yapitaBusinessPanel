import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute() {
  const { firebaseUser, profile, loading, error } = useAuth();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-gray-500">Cargando panel…</div>;
  }
  if (!firebaseUser || !profile) {
    return <Navigate to="/login" replace state={{ error }} />;
  }
  if (!profile.assignments.length) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="text-xl text-gray-900">Sin comercios asignados</h1>
          <p className="text-gray-500 mt-2">Solicita una invitación activa al administrador de Yapita.</p>
        </div>
      </div>
    );
  }
  return <Outlet />;
}
