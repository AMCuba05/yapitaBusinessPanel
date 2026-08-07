import { Link, Outlet, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Megaphone,
  Gift,
  Users,
  UserCheck,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Configuración', path: '/config', icon: Settings },
  { name: 'Tarjetas', path: '/cards', icon: CreditCard },
  { name: 'Promociones', path: '/promotions', icon: Megaphone },
  { name: 'Recompensas', path: '/rewards', icon: Gift },
  { name: 'Clientes', path: '/customers', icon: Users },
  { name: 'Cajeros', path: '/cashiers', icon: UserCheck },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, assignment, selectAssignment, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-gray-900/80 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`absolute inset-y-0 left-0 w-64 bg-white transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl text-purple-600">Admin Fidelización</h1>
            <button onClick={() => setSidebarOpen(false)} className="p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r overflow-y-auto">
          <div className="flex items-center h-16 px-6 border-b">
            <h1 className="text-xl text-purple-600">Admin Fidelización</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4 space-y-3">
            {profile && profile.assignments.length > 1 && (
              <select
                value={assignment?.id ?? ''}
                onChange={(event) => selectAssignment(event.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {profile.assignments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.business.displayName}
                  </option>
                ))}
              </select>
            )}
            <div>
              <p className="text-sm text-gray-900 truncate">{profile?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="w-full flex items-center gap-2 text-sm text-gray-600 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="p-2 text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg text-purple-600">Admin Fidelización</h1>
        </div>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
