import { useState } from 'react';
import { Plus, Edit, Trash2, Gift, Eye, EyeOff } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stampsCost?: number;
  type: 'product' | 'discount' | 'service';
  active: boolean;
  stock?: number;
  icon: string;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'Café Gratis',
    description: 'Un café de cualquier tamaño',
    pointsCost: 100,
    type: 'product',
    active: true,
    stock: 50,
    icon: '☕',
  },
  {
    id: '2',
    name: '10% de descuento',
    description: 'Válido en toda la tienda',
    pointsCost: 50,
    type: 'discount',
    active: true,
    icon: '💰',
  },
  {
    id: '3',
    name: 'Postre Gratis',
    description: 'Elige tu postre favorito',
    pointsCost: 80,
    stampsCost: 8,
    type: 'product',
    active: true,
    stock: 30,
    icon: '🍰',
  },
  {
    id: '4',
    name: '20% de descuento',
    description: 'En tu próxima compra',
    pointsCost: 200,
    type: 'discount',
    active: true,
    icon: '🎫',
  },
  {
    id: '5',
    name: 'Combo Especial',
    description: 'Café + Sandwich + Postre',
    pointsCost: 300,
    type: 'product',
    active: false,
    stock: 20,
    icon: '🍱',
  },
];

const rewardTypes = [
  { value: 'product', label: 'Producto' },
  { value: 'discount', label: 'Descuento' },
  { value: 'service', label: 'Servicio' },
];

const iconOptions = ['☕', '🍰', '🍕', '🍔', '🍱', '💰', '🎫', '🎁', '⭐', '🏆'];

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const handleToggleActive = (id: string) => {
    setRewards(rewards.map(reward => 
      reward.id === id ? { ...reward, active: !reward.active } : reward
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta recompensa?')) {
      setRewards(rewards.filter(reward => reward.id !== id));
    }
  };

  const handleCreate = () => {
    setEditingReward(null);
    setShowModal(true);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Recompensas</h1>
          <p className="mt-2 text-gray-600">Define qué pueden canjear tus clientes</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Recompensa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{rewards.length}</p>
              <p className="text-sm text-gray-600">Total Recompensas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{rewards.filter(r => r.active).length}</p>
              <p className="text-sm text-gray-600">Activas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
            <div>
              <p className="text-2xl text-gray-900">156</p>
              <p className="text-sm text-gray-600">Canjes este mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
                    {reward.icon}
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-900">{reward.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      reward.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {reward.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

              {/* Info */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600">Costo:</span>
                  <span className="text-gray-900">{reward.pointsCost} puntos</span>
                </div>
                {reward.stampsCost && (
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-600">O:</span>
                    <span className="text-gray-900">{reward.stampsCost} sellos</span>
                  </div>
                )}
                {reward.stock !== undefined && (
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`${reward.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {reward.stock} disponibles
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="text-gray-900 capitalize">{reward.type}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(reward.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={reward.active ? 'Desactivar' : 'Activar'}
                >
                  {reward.active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(reward)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl text-gray-900 mb-6">
              {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
            </h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nombre de la Recompensa</label>
                <input
                  type="text"
                  placeholder="Ej: Café Gratis"
                  defaultValue={editingReward?.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Icono</label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:border-purple-500 flex items-center justify-center text-2xl transition-colors"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Tipo de Recompensa</label>
                <div className="grid grid-cols-3 gap-3">
                  {rewardTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-purple-500 transition-colors"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Descripción</label>
                <textarea
                  placeholder="Describe la recompensa"
                  rows={3}
                  defaultValue={editingReward?.description}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Costo en Puntos</label>
                  <input
                    type="number"
                    placeholder="100"
                    defaultValue={editingReward?.pointsCost}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Costo en Sellos (opcional)</label>
                  <input
                    type="number"
                    placeholder="10"
                    defaultValue={editingReward?.stampsCost}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Stock Disponible (opcional)</label>
                <input
                  type="number"
                  placeholder="50"
                  defaultValue={editingReward?.stock}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Deja en blanco para stock ilimitado</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="active"
                  defaultChecked={editingReward?.active ?? true}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Activar recompensa inmediatamente
                </label>
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
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Recompensa guardada');
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingReward ? 'Guardar Cambios' : 'Crear Recompensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
