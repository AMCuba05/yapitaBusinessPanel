import { useMemo, useState } from 'react';
import { Download, Mail, Phone, Search, Star, TrendingUp } from 'lucide-react';
import { useBusinessResource } from '../lib/useBusinessResource';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  points: number;
  stamps: number;
  visits: number;
  totalSpentMinor: number;
  joinedAt: string;
  lastVisitAt: string | null;
  status: string;
  tier: string;
}

export default function Customers() {
  const { data, loading, error } = useBusinessResource<Customer[]>('/business/customers', []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const filtered = useMemo(() => data.filter((customer) => {
    const term = search.toLowerCase();
    return (status === 'all' || customer.status === status || customer.tier === status) &&
      (customer.name.toLowerCase().includes(term) || customer.email?.toLowerCase().includes(term));
  }), [data, search, status]);

  function exportCsv() {
    const rows = [['Nombre', 'Email', 'Teléfono', 'Puntos', 'Sellos', 'Visitas', 'Gastado BOB'], ...filtered.map((c) => [c.name, c.email ?? '', c.phone ?? '', c.points, c.stamps, c.visits, (c.totalSpentMinor / 100).toFixed(2)])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'clientes-yapita.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const totalPoints = data.reduce((sum, item) => sum + item.points, 0);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl">Clientes</h1><p className="mt-2 text-gray-600">Base consolidada desde PostgreSQL.</p></div><button onClick={exportCsv} className="flex gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg"><Download className="w-5 h-5" />Exportar CSV</button></div>
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-5"><p className="text-2xl">{data.length}</p><p className="text-sm text-gray-500">Clientes</p></div>
        <div className="bg-white shadow rounded-lg p-5"><TrendingUp className="text-green-600" /><p className="text-2xl">{data.filter((c) => c.status === 'active').length}</p><p className="text-sm text-gray-500">Activos</p></div>
        <div className="bg-white shadow rounded-lg p-5"><Star className="text-purple-600" /><p className="text-2xl">{data.filter((c) => c.tier === 'vip').length}</p><p className="text-sm text-gray-500">VIP</p></div>
        <div className="bg-white shadow rounded-lg p-5"><p className="text-2xl">{totalPoints.toLocaleString('es-BO')}</p><p className="text-sm text-gray-500">Puntos vigentes</p></div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex gap-3"><div className="relative flex-1"><Search className="absolute w-4 h-4 left-3 top-3 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente" className="w-full border rounded-lg pl-9 pr-3 py-2" /></div><select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3"><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option><option value="vip">VIP</option></select></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="p-4">Cliente</th><th className="p-4">Contacto</th><th className="p-4">Saldos</th><th className="p-4">Visitas</th><th className="p-4">Gastado</th><th className="p-4">Última visita</th></tr></thead>
            <tbody>{loading ? <tr><td colSpan={6} className="p-6 text-gray-500">Cargando…</td></tr> : filtered.map((customer) => <tr key={customer.id} className="border-t"><td className="p-4"><strong>{customer.name}</strong><p className="text-xs text-gray-500">{customer.tier}</p></td><td className="p-4 text-gray-600"><p className="flex gap-1"><Mail className="w-3 h-3" />{customer.email || '—'}</p><p className="flex gap-1"><Phone className="w-3 h-3" />{customer.phone || '—'}</p></td><td className="p-4">{customer.points} pts · {customer.stamps} sellos</td><td className="p-4">{customer.visits}</td><td className="p-4">Bs {(customer.totalSpentMinor / 100).toFixed(2)}</td><td className="p-4">{customer.lastVisitAt ? new Date(customer.lastVisitAt).toLocaleDateString('es-BO') : '—'}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
