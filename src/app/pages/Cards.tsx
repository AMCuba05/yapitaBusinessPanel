import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Award } from 'lucide-react';

type CardType = 'points' | 'stamps';

interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  goal: number;
  pointsPerVisit?: number;
  active: boolean;
  color: string;
  logo?: string;
  rewardName: string;
  rewardIcon: string;
}

const mockCards: Card[] = [
  {
    id: '1',
    name: 'Tarjeta de Puntos',
    type: 'points',
    description: 'Acumula puntos con cada compra',
    goal: 100,
    pointsPerVisit: 10,
    active: true,
    color: '#9333ea',
    rewardName: 'Café Gratis',
    rewardIcon: '☕',
  },
  {
    id: '2',
    name: 'Tarjeta de Sellos - Café',
    type: 'stamps',
    description: '10 cafés = 1 gratis',
    goal: 10,
    active: true,
    color: '#10b981',
    rewardName: 'Café Gratis',
    rewardIcon: '☕',
  },
  {
    id: '3',
    name: 'Tarjeta Premium',
    type: 'points',
    description: 'Para clientes VIP',
    goal: 200,
    pointsPerVisit: 20,
    active: false,
    color: '#f59e0b',
    rewardName: 'Descuento 20%',
    rewardIcon: '🎁',
  },
];

const rewardIcons = ['☕', '🍰', '🍕', '🍔', '🍱', '💰', '🎫', '🎁', '⭐', '🏆', '🎉', '💎'];

export default function Cards() {
  const [cards, setCards] = useState<Card[]>(mockCards);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedType, setSelectedType] = useState<CardType>('points');
  const [selectedIcon, setSelectedIcon] = useState('☕');

  const handleToggleActive = (id: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, active: !card.active } : card
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      setCards(cards.filter(card => card.id !== id));
    }
  };

  const handleCreate = () => {
    setEditingCard(null);
    setShowModal(true);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setShowModal(true);
    setSelectedType(card.type);
    setSelectedIcon(card.rewardIcon);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Tarjetas de Fidelización</h1>
          <p className="mt-2 text-gray-600">Configura el logo y define qué premio obtienen tus clientes</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Tarjeta
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Card Preview - Como la verá el cliente */}
            <div
              className="h-48 p-6 text-white relative"
              style={{ backgroundColor: card.color }}
            >
              <div className="flex flex-col h-full justify-between">
                {/* Logo & Title */}
                <div className="flex items-start justify-between">
                  <div>
                    {card.logo ? (
                      <img src={card.logo} alt="Logo" className="h-10 w-10 rounded-lg bg-white/20 p-1" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                    )}
                    <h3 className="text-lg mt-2">{card.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    card.active 
                      ? 'bg-green-500/20 text-white' 
                      : 'bg-gray-500/20 text-white'
                  }`}>
                    {card.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                {/* Reward Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-90">
                        {card.type === 'points' 
                          ? `Acumula ${card.goal} puntos` 
                          : `Completa ${card.goal} sellos`
                        }
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-2xl mr-2">{card.rewardIcon}</span>
                        {card.rewardName}
                      </p>
                    </div>
                    <Award className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">{card.description}</p>
              
              <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="text-gray-900">
                    {card.type === 'points' ? 'Puntos' : 'Sellos'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meta:</span>
                  <span className="text-gray-900">
                    {card.goal} {card.type === 'points' ? 'puntos' : 'sellos'}
                  </span>
                </div>
                {card.type === 'points' && card.pointsPerVisit && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Por visita:</span>
                    <span className="text-gray-900">+{card.pointsPerVisit} puntos</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Premio:</span>
                  <span className="text-gray-900">{card.rewardIcon} {card.rewardName}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleToggleActive(card.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={card.active ? 'Desactivar' : 'Activar'}
                >
                  {card.active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(card)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl text-gray-900 mb-6">
              {editingCard ? 'Editar Tarjeta' : 'Nueva Tarjeta de Fidelización'}
            </h2>
            
            <form className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm text-gray-700 mb-3">Logo de la Empresa</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {editingCard?.logo ? (
                      <img src={editingCard.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Subir Logo
                    </button>
                    <p className="mt-2 text-xs text-gray-500">PNG, JPG o SVG (recomendado 200x200px)</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg text-gray-900 mb-4">Información de la Tarjeta</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Nombre de la Tarjeta</label>
                    <input
                      type="text"
                      placeholder="Ej: Tarjeta de Puntos"
                      defaultValue={editingCard?.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Tipo de Tarjeta</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedType('points')}
                        className={`px-4 py-3 border-2 rounded-lg transition-colors ${
                          selectedType === 'points'
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">⭐</div>
                        <div className="text-sm">Puntos</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedType('stamps')}
                        className={`px-4 py-3 border-2 rounded-lg transition-colors ${
                          selectedType === 'stamps'
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">✓</div>
                        <div className="text-sm">Sellos</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Descripción</label>
                    <textarea
                      placeholder="Describe cómo funciona tu tarjeta"
                      rows={2}
                      defaultValue={editingCard?.description}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg text-gray-900 mb-4">Configuración del Premio</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      {selectedType === 'points' ? '¿Cuántos puntos?' : '¿Cuántos sellos?'}
                    </label>
                    <input
                      type="number"
                      placeholder={selectedType === 'points' ? '100' : '10'}
                      defaultValue={editingCard?.goal}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Cantidad necesaria para obtener el premio
                    </p>
                  </div>

                  {selectedType === 'points' && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Puntos por visita</label>
                      <input
                        type="number"
                        placeholder="10"
                        defaultValue={editingCard?.pointsPerVisit}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Puntos que gana el cliente por cada compra
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-700 mb-2">¿Qué premio recibirá el cliente?</label>
                  <input
                    type="text"
                    placeholder="Ej: Café Gratis, Descuento 20%, Postre Gratis"
                    defaultValue={editingCard?.rewardName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm text-gray-700 mb-3">Icono del Premio</label>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                    {rewardIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-2xl transition-all ${
                          selectedIcon === icon
                            ? 'border-purple-600 bg-purple-50 scale-110'
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg text-gray-900 mb-4">Personalización Visual</h3>
                
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Color de la Tarjeta</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      defaultValue={editingCard?.color || '#9333ea'}
                      className="h-12 w-16 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue={editingCard?.color || '#9333ea'}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6">
                  <label className="block text-sm text-gray-700 mb-3">Vista Previa</label>
                  <div 
                    className="h-40 rounded-lg p-4 text-white"
                    style={{ backgroundColor: editingCard?.color || '#9333ea' }}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-start justify-between">
                        <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20">
                          Activa
                        </span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded p-2">
                        <p className="text-xs opacity-90">
                          {selectedType === 'points' ? 'Acumula 100 puntos' : 'Completa 10 sellos'}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="text-xl mr-1">{selectedIcon}</span>
                          {editingCard?.rewardName || 'Tu premio aquí'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Tarjeta guardada exitosamente');
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingCard ? 'Guardar Cambios' : 'Crear Tarjeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}