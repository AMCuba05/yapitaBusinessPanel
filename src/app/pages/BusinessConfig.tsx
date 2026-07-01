import { useState } from 'react';
import { Save, Upload, MapPin, Mail, Phone, Globe } from 'lucide-react';

export default function BusinessConfig() {
  const [config, setConfig] = useState({
    name: 'Mi Negocio',
    description: 'Descripción de mi negocio',
    address: 'Calle Principal 123, Ciudad',
    phone: '+1 234 567 8900',
    email: 'info@minegocio.com',
    website: 'www.minegocio.com',
    primaryColor: '#9333ea',
    secondaryColor: '#f59e0b',
    accentColor: '#10b981',
  });

  const handleSave = () => {
    // Mock save
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl text-gray-900">Configuración del Negocio</h1>
        <p className="mt-2 text-gray-600">Personaliza la información y apariencia de tu negocio</p>
      </div>

      {/* Logo Upload */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg text-gray-900 mb-4">Logo del Negocio</h2>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Subir Logo
            </button>
            <p className="mt-2 text-sm text-gray-500">PNG, JPG o SVG (máx. 2MB)</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg text-gray-900 mb-6">Información del Negocio</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Nombre del Negocio</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Descripción</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg text-gray-900 mb-6">Información de Contacto</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Dirección
            </label>
            <input
              type="text"
              value={config.address}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono
              </label>
              <input
                type="tel"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Sitio Web
            </label>
            <input
              type="url"
              value={config.website}
              onChange={(e) => setConfig({ ...config, website: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg text-gray-900 mb-6">Colores de la Marca</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Color Primario</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="h-12 w-16 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Color Secundario</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                className="h-12 w-16 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.secondaryColor}
                onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Color de Acento</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                className="h-12 w-16 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.accentColor}
                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {/* Color Preview */}
        <div className="mt-6 p-6 rounded-lg border-2 border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Vista Previa de Colores</p>
          <div className="flex gap-4">
            <div 
              className="h-20 w-20 rounded-lg shadow-lg" 
              style={{ backgroundColor: config.primaryColor }}
            />
            <div 
              className="h-20 w-20 rounded-lg shadow-lg" 
              style={{ backgroundColor: config.secondaryColor }}
            />
            <div 
              className="h-20 w-20 rounded-lg shadow-lg" 
              style={{ backgroundColor: config.accentColor }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          Guardar Configuración
        </button>
      </div>
    </div>
  );
}
