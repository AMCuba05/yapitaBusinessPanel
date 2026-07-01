import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar, Percent, Eye, EyeOff } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'discount' | '2x1' | 'points' | 'free';
  value: string;
  startDate: string;
  endDate: string;
  active: boolean;
  color: string;
}

const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: '¡2x1 en cafés esta semana!',
    description: 'Compra un café y llévate otro gratis. Válido hasta el domingo.',
    type: '2x1',
    value: '2x1',
    startDate: '2026-03-25',
    endDate: '2026-03-31',
    active: true,
    color: '#f59e0b',
  },
  {
    id: '2',
    title: '¡Ganaste 50 puntos!',
    description: 'Gracias por tu compra en Pollos Copacabana.',
    type: 'points',
    value: '50',
    startDate: '2026-03-20',
    endDate: '2026-04-05',
    active: true,
    color: '#10b981',
  },
  {
    id: '3',
    title: '30% en tickets de cine',
    description: 'Aprovecha este descuento especial para funciones de lunes a jueves.',
    type: 'discount',
    value: '30',
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    active: true,
    color: '#8b5cf6',
  },
  {
    id: '4',
    title: 'Happy Hour en Paprika',
    description: '2x1 en bebidas de 5pm a 7pm todos los días.',
    type: '2x1',
    value: '2x1',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    active: false,
    color: '#ef4444',
  },
];

const promotionTypes = [
  { value: 'discount', label: 'Descuento %', icon: Percent },
  { value: '2x1', label: '2x1', icon: Plus },
  { value: 'points', label: 'Puntos Extra', icon: Plus },
  { value: 'free', label: 'Gratis', icon: Plus },
];

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const handleToggleActive = (id: string) => {
    setPromotions(promotions.map(promo => 
      promo.id === id ? { ...promo, active: !promo.active } : promo
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta promoción?')) {
      setPromotions(promotions.filter(promo => promo.id !== id));
    }
  };

  const handleCreate = () => {
    setEditingPromo(null);
    setShowModal(true);
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setShowModal(true);
  };

  const getPromotionIcon = (type: string) => {
    if (type === 'discount') return '%';
    if (type === '2x1') return '2x1';
    if (type === 'points') return '+' + 'pts';
    return '🎁';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Promociones</h1>
          <p className="mt-2 text-gray-600">Crea ofertas especiales para tus clientes</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Promoción
        </button>
      </div>

      {/* Promotions List */}
      <div className="space-y-4">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Color Bar & Icon */}
              <div
                className="w-full lg:w-24 h-24 lg:h-auto flex items-center justify-center text-white"
                style={{ backgroundColor: promo.color }}
              >
                <span className="text-2xl">{getPromotionIcon(promo.type)}</span>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg text-gray-900">{promo.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        promo.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {promo.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{promo.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(promo.startDate).toLocaleDateString('es')} - {new Date(promo.endDate).toLocaleDateString('es')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(promo.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title={promo.active ? 'Desactivar' : 'Activar'}
                    >
                      {promo.active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(promo)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
              {editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Título de la Promoción</label>
                <input
                  type="text"
                  placeholder="Ej: 2x1 en cafés esta semana"
                  defaultValue={editingPromo?.title}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Tipo de Promoción</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {promotionTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-purple-500 transition-colors"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Descripción</label>
                <textarea
                  placeholder="Describe los detalles de la promoción"
                  rows={3}
                  defaultValue={editingPromo?.description}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Valor</label>
                <input
                  type="text"
                  placeholder="Ej: 30 (para 30%), 2x1, 50 puntos, etc."
                  defaultValue={editingPromo?.value}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Fecha de Inicio</label>
                  <input
                    type="date"
                    defaultValue={editingPromo?.startDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Fecha de Fin</label>
                  <input
                    type="date"
                    defaultValue={editingPromo?.endDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    defaultValue={editingPromo?.color || '#9333ea'}
                    className="h-12 w-16 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={editingPromo?.color || '#9333ea'}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="active"
                  defaultChecked={editingPromo?.active ?? true}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Activar promoción inmediatamente
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
                    alert('Promoción guardada');
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingPromo ? 'Guardar Cambios' : 'Crear Promoción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
