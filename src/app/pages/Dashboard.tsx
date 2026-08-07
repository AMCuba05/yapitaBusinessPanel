import { CreditCard, Eye, Gift, Smartphone, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router';
import { useBusinessResource } from '../lib/useBusinessResource';

interface DashboardData {
  stats: {
    activeCustomers: number;
    redemptions: number;
    activePromotions: number;
    scansThisMonth: number;
  };
  recentActivity: Array<{
    id: string;
    customerName: string;
    action: string;
    occurredAt: string;
    type: string;
  }>;
  topRewards: Array<{ id: string; title: string; redemptions: number }>;
  cashiers: Array<{
    id: string;
    name: string;
    scansToday: number;
    status: string;
  }>;
}

const empty: DashboardData = {
  stats: {
    activeCustomers: 0,
    redemptions: 0,
    activePromotions: 0,
    scansThisMonth: 0,
  },
  recentActivity: [],
  topRewards: [],
  cashiers: [],
};

export default function Dashboard() {
  const { data, loading, error } = useBusinessResource('/business/dashboard', empty);
  const stats = [
    { name: 'Clientes activos', value: data.stats.activeCustomers, icon: Users, color: 'bg-blue-500' },
    { name: 'Recompensas canjeadas', value: data.stats.redemptions, icon: CreditCard, color: 'bg-green-500' },
    { name: 'Promociones activas', value: data.stats.activePromotions, icon: Gift, color: 'bg-purple-500' },
    { name: 'Escaneos este mes', value: data.stats.scansThisMonth, icon: Eye, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Resumen real de tu programa de fidelización</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl text-gray-900">{loading ? '…' : stat.value.toLocaleString('es-BO')}</p>
                  <p className="mt-2 text-xs text-gray-400 flex gap-1"><TrendingUp className="w-4 h-4" /> Datos en línea</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}><Icon className="w-6 h-6 text-white" /></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-5 border-b flex justify-between">
          <h2 className="text-lg text-gray-900">Cajeros</h2>
          <Link to="/cashiers" className="text-sm text-purple-600">Gestionar</Link>
        </div>
        <div className="p-6 grid sm:grid-cols-3 gap-4">
          {data.cashiers.length === 0 && <p className="text-sm text-gray-500">Todavía no hay cajeros asignados.</p>}
          {data.cashiers.map((cashier) => (
            <div key={cashier.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-purple-500 text-white grid place-items-center">{cashier.name.charAt(0)}</div>
              <div className="min-w-0">
                <p className="text-sm truncate">{cashier.name}</p>
                <p className="text-xs text-gray-500 flex gap-1"><Smartphone className="w-3 h-3" />{cashier.scansToday} turnos hoy</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow">
          <h2 className="px-6 py-5 border-b text-lg">Actividad reciente</h2>
          <div className="p-6 space-y-4">
            {data.recentActivity.length === 0 && <p className="text-sm text-gray-500">Sin actividad registrada.</p>}
            {data.recentActivity.map((item) => (
              <div key={item.id} className="border-l-2 border-purple-400 pl-3">
                <p className="text-sm text-gray-900">{item.customerName}</p>
                <p className="text-sm text-gray-600">{item.action}</p>
                <p className="text-xs text-gray-400">{new Date(item.occurredAt).toLocaleString('es-BO')}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-white rounded-lg shadow">
          <h2 className="px-6 py-5 border-b text-lg">Recompensas más populares</h2>
          <div className="p-6 space-y-4">
            {data.topRewards.length === 0 && <p className="text-sm text-gray-500">Aún no hay canjes validados.</p>}
            {data.topRewards.map((reward, index) => (
              <div key={reward.id} className="flex justify-between text-sm">
                <span>#{index + 1} {reward.title}</span>
                <span className="text-gray-500">{reward.redemptions} canjes</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
