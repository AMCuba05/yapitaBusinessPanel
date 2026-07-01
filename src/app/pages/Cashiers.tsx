import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, UserCheck, Smartphone, Copy, RefreshCw } from 'lucide-react';

interface Cashier {
  id: string;
  name: string;
  pin: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  scansToday: number;
  scansTotal: number;
}

const mockCashiers: Cashier[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    pin: '4821',
    active: true,
    createdAt: '2026-01-15',
    lastLogin: '2026-07-01T09:32:00',
    scansToday: 14,
    scansTotal: 342,
  },
  {
    id: '2',
    name: 'Sofia Ramírez',
    pin: '7734',
    active: true,
    createdAt: '2026-02-20',
    lastLogin: '2026-07-01T08:55:00',
    scansToday: 9,
    scansTotal: 187,
  },
  {
    id: '3',
    name: 'Miguel Herrera',
    pin: '2290',
    active: false,
    createdAt: '2026-03-05',
    lastLogin: '2026-06-10T17:10:00',
    scansToday: 0,
    scansTotal: 95,
  },
];

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function Cashiers() {
  const [cashiers, setCashiers] = useState<Cashier[]>(mockCashiers);
  const [showModal, setShowModal] = useState(false);
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
  const [newPin, setNewPin] = useState(generatePin());
  const [pinVisible, setPinVisible] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');

  const handleToggleActive = (id: string) => {
    setCashiers(cashiers.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este cajero? Perderá acceso inmediatamente.')) {
      setCashiers(cashiers.filter(c => c.id !== id));
    }
  };

  const handleCreate = () => {
    setEditingCashier(null);
    setFormName('');
    setNewPin(generatePin());
    setShowModal(true);
  };

  const handleEdit = (cashier: Cashier) => {
    setEditingCashier(cashier);
    setFormName(cashier.name);
    setNewPin(cashier.pin);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editingCashier) {
      setCashiers(cashiers.map(c =>
        c.id === editingCashier.id ? { ...c, name: formName, pin: newPin } : c
      ));
    } else {
      setCashiers([...cashiers, {
        id: String(Date.now()),
        name: formName,
        pin: newPin,
        active: true,
        createdAt: new Date().toISOString().split('T')[0],
        scansToday: 0,
        scansTotal: 0,
      }]);
    }
    setShowModal(false);
  };

  const togglePinVisible = (id: string) => {
    setPinVisible(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPin = (id: string, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const activeCashiers = cashiers.filter(c => c.active);
  const totalScansToday = cashiers.reduce((sum, c) => sum + c.scansToday, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Cajeros</h1>
          <p className="mt-2 text-gray-600">Usuarios con acceso a la app de escaneo</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cajero
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{activeCashiers.length}</p>
            <p className="text-sm text-gray-600">Cajeros activos</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl text-gray-900">{totalScansToday}</p>
            <p className="text-sm text-gray-600">Escaneos hoy</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <p className="text-2xl text-gray-900">{cashiers.reduce((s, c) => s + c.scansTotal, 0)}</p>
            <p className="text-sm text-gray-600">Escaneos totales</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
        <Smartphone className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-sm text-purple-800">
          <span className="font-medium">¿Cómo funciona?</span> Cada cajero inicia sesión en la app de escaneo con su nombre y PIN de 4 dígitos. Desde ahí puede registrar visitas, sumar puntos y validar recompensas de los clientes.
        </div>
      </div>

      {/* Cashiers list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cashiers.map((cashier) => (
          <div key={cashier.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold ${cashier.active ? 'bg-purple-500' : 'bg-gray-400'}`}>
                    {cashier.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base text-gray-900">{cashier.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs mt-0.5 ${cashier.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {cashier.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* PIN */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">PIN de acceso</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg tracking-widest text-gray-900 font-mono">
                    {pinVisible[cashier.id] ? cashier.pin : '••••'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePinVisible(cashier.id)}
                      className="p-1.5 text-gray-500 hover:text-gray-700"
                      title={pinVisible[cashier.id] ? 'Ocultar PIN' : 'Ver PIN'}
                    >
                      {pinVisible[cashier.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyPin(cashier.id, cashier.pin)}
                      className="p-1.5 text-gray-500 hover:text-gray-700"
                      title="Copiar PIN"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {copiedId === cashier.id && (
                  <p className="text-xs text-green-600 mt-1">¡PIN copiado!</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="text-center bg-purple-50 rounded-lg p-2">
                  <p className="text-xl text-purple-700">{cashier.scansToday}</p>
                  <p className="text-xs text-gray-500">Hoy</p>
                </div>
                <div className="text-center bg-gray-50 rounded-lg p-2">
                  <p className="text-xl text-gray-700">{cashier.scansTotal}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>

              {/* Last login */}
              {cashier.lastLogin && (
                <p className="text-xs text-gray-400 mb-4">
                  Último acceso: {new Date(cashier.lastLogin).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(cashier.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {cashier.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {cashier.active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleEdit(cashier)}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cashier.id)}
                  className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl text-gray-900 mb-6">
              {editingCashier ? 'Editar Cajero' : 'Nuevo Cajero'}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nombre del cajero</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">PIN de acceso (4 dígitos)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-xl tracking-widest"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setNewPin(generatePin())}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Generar PIN aleatorio"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">El cajero usará este PIN para ingresar a la app de escaneo</p>
              </div>

              {/* Preview */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-xs text-purple-600 mb-1">El cajero iniciará sesión con</p>
                <p className="text-base text-purple-900">{formName || 'Nombre del cajero'}</p>
                <p className="text-3xl font-mono tracking-widest text-purple-700 mt-1">{newPin}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!formName.trim() || newPin.length !== 4}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCashier ? 'Guardar Cambios' : 'Crear Cajero'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
