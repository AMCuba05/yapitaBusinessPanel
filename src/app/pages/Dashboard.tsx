import { TrendingUp, Users, CreditCard, Gift, Eye, UserCheck, Plus, Smartphone } from 'lucide-react';
import { Link } from 'react-router';

const stats = [
  { name: 'Clientes activos', value: '1,234', change: '+12%', icon: Users, color: 'bg-blue-500' },
  { name: 'Tarjetas canjeadas', value: '89', change: '+5%', icon: CreditCard, color: 'bg-green-500' },
  { name: 'Promociones activas', value: '12', change: '+2', icon: Gift, color: 'bg-purple-500' },
  { name: 'Visitas este mes', value: '3,456', change: '+18%', icon: Eye, color: 'bg-orange-500' },
];

const recentActivity = [
  { customer: 'María González', action: 'Canjeó recompensa: Café gratis', time: 'Hace 5 min', type: 'reward' },
  { customer: 'Carlos Ruiz', action: 'Completó tarjeta de sellos', time: 'Hace 12 min', type: 'card' },
  { customer: 'Ana López', action: 'Ganó 50 puntos', time: 'Hace 23 min', type: 'points' },
  { customer: 'Pedro Sánchez', action: 'Se registró en el programa', time: 'Hace 1 hora', type: 'new' },
  { customer: 'Laura Martínez', action: 'Canjeó promoción 2x1', time: 'Hace 2 horas', type: 'promo' },
];

const topCards = [
  { name: 'Café Gratis', redeemed: 45, color: 'bg-green-100 text-green-700' },
  { name: 'Descuento 20%', redeemed: 32, color: 'bg-blue-100 text-blue-700' },
  { name: 'Postre Gratis', redeemed: 28, color: 'bg-purple-100 text-purple-700' },
  { name: 'Combo Especial', redeemed: 21, color: 'bg-orange-100 text-orange-700' },
];

const cashiersSummary = [
  { name: 'Juan Pérez', scansToday: 14, active: true },
  { name: 'Sofia Ramírez', scansToday: 9, active: true },
  { name: 'Miguel Herrera', scansToday: 0, active: false },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Resumen de tu programa de fidelización</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl text-gray-900">{stat.value}</p>
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cajeros quick access */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg text-gray-900">Cajeros</h2>
          </div>
          <Link
            to="/cashiers"
            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 transition-colors"
          >
            Ver todos
          </Link>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {cashiersSummary.map((c) => (
              <div key={c.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${c.active ? 'bg-purple-500' : 'bg-gray-400'}`}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    {c.scansToday} escaneos hoy
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {c.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/cashiers"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar cajero
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg text-gray-900">Actividad Reciente</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'reward' ? 'bg-green-500' :
                    activity.type === 'card' ? 'bg-blue-500' :
                    activity.type === 'points' ? 'bg-purple-500' :
                    activity.type === 'new' ? 'bg-orange-500' :
                    'bg-pink-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.customer}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Cards */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg text-gray-900">Recompensas Más Populares</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCards.map((card, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm ${card.color}`}>
                      #{index + 1}
                    </div>
                    <span className="text-sm text-gray-900">{card.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{card.redeemed} canjes</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
