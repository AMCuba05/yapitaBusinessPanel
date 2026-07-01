import { useState } from 'react';
import { Search, Filter, Download, Mail, Phone, Star, TrendingUp } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  stamps: number;
  visits: number;
  totalSpent: number;
  joinDate: string;
  lastVisit: string;
  status: 'active' | 'inactive' | 'vip';
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+1 234 567 8900',
    points: 450,
    stamps: 8,
    visits: 23,
    totalSpent: 1250,
    joinDate: '2025-10-15',
    lastVisit: '2026-03-30',
    status: 'vip',
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@email.com',
    phone: '+1 234 567 8901',
    points: 320,
    stamps: 5,
    visits: 18,
    totalSpent: 980,
    joinDate: '2025-11-20',
    lastVisit: '2026-03-29',
    status: 'active',
  },
  {
    id: '3',
    name: 'Ana López',
    email: 'ana.lopez@email.com',
    phone: '+1 234 567 8902',
    points: 150,
    stamps: 3,
    visits: 12,
    totalSpent: 560,
    joinDate: '2026-01-10',
    lastVisit: '2026-03-28',
    status: 'active',
  },
  {
    id: '4',
    name: 'Pedro Sánchez',
    email: 'pedro.sanchez@email.com',
    phone: '+1 234 567 8903',
    points: 80,
    stamps: 2,
    visits: 5,
    totalSpent: 320,
    joinDate: '2026-02-14',
    lastVisit: '2026-03-25',
    status: 'active',
  },
  {
    id: '5',
    name: 'Laura Martínez',
    email: 'laura.martinez@email.com',
    phone: '+1 234 567 8904',
    points: 600,
    stamps: 10,
    visits: 35,
    totalSpent: 2100,
    joinDate: '2025-09-05',
    lastVisit: '2026-03-31',
    status: 'vip',
  },
  {
    id: '6',
    name: 'Diego Fernández',
    email: 'diego.fernandez@email.com',
    phone: '+1 234 567 8905',
    points: 45,
    stamps: 1,
    visits: 3,
    totalSpent: 180,
    joinDate: '2026-03-01',
    lastVisit: '2026-03-15',
    status: 'active',
  },
  {
    id: '7',
    name: 'Isabel Torres',
    email: 'isabel.torres@email.com',
    phone: '+1 234 567 8906',
    points: 0,
    stamps: 0,
    visits: 1,
    totalSpent: 45,
    joinDate: '2025-12-20',
    lastVisit: '2026-01-05',
    status: 'inactive',
  },
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'vip' | 'inactive'>('all');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    vip: customers.filter(c => c.status === 'vip').length,
    totalPoints: customers.reduce((sum, c) => sum + c.points, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Clientes</h1>
          <p className="mt-2 text-gray-600">Gestiona tu base de clientes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Download className="w-5 h-5" />
          Exportar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Clientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.vip}</p>
              <p className="text-sm text-gray-600">VIP</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.totalPoints}</p>
              <p className="text-sm text-gray-600">Puntos Totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'active'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus('vip')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'vip'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              VIP
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Puntos</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Sellos</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Visitas</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Gasto Total</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500">
                        Desde {new Date(customer.joinDate).toLocaleDateString('es')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 mt-1">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{customer.points}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{customer.stamps}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{customer.visits}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">${customer.totalSpent}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 rounded-full ${
                      customer.status === 'vip'
                        ? 'bg-purple-100 text-purple-800'
                        : customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status === 'vip' ? '⭐ VIP' : customer.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron clientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
