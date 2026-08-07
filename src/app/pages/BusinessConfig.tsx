import { FormEvent, useEffect, useState } from 'react';
import { Globe, Mail, MapPin, Phone, Save } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useBusinessResource } from '../lib/useBusinessResource';

interface Profile {
  displayName: string;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  websiteUrl: string | null;
  brandColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  locations: Array<{ id: string; addressLine: string; city: string | null }>;
}

const empty: Profile = { displayName: '', description: '', contactEmail: '', contactPhone: '', websiteUrl: '', brandColor: '#9333ea', secondaryColor: '#f59e0b', accentColor: '#10b981', logoUrl: '', locations: [] };

export default function BusinessConfig() {
  const { assignment, request } = useAuth();
  const resource = useBusinessResource<Profile>('/business/profile', empty);
  const [form, setForm] = useState({ displayName: '', description: '', contactEmail: '', contactPhone: '', websiteUrl: '', brandColor: '#9333ea', secondaryColor: '#f59e0b', accentColor: '#10b981', logoUrl: '', addressLine: '', city: '' });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const profile = resource.data;
    setForm({
      displayName: profile.displayName,
      description: profile.description ?? '',
      contactEmail: profile.contactEmail ?? '',
      contactPhone: profile.contactPhone ?? '',
      websiteUrl: profile.websiteUrl ?? '',
      brandColor: profile.brandColor ?? '#9333ea',
      secondaryColor: profile.secondaryColor ?? '#f59e0b',
      accentColor: profile.accentColor ?? '#10b981',
      logoUrl: profile.logoUrl ?? '',
      addressLine: profile.locations[0]?.addressLine ?? '',
      city: profile.locations[0]?.city ?? '',
    });
  }, [resource.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!assignment) return;
    setMessage(null);
    try {
      await request('/business/profile', { method: 'PATCH', body: JSON.stringify({ assignmentId: assignment.id, ...form, websiteUrl: form.websiteUrl || undefined, logoUrl: form.logoUrl || undefined }) });
      setMessage('Configuración guardada.');
      await resource.refresh();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'No se pudo guardar.');
    }
  }

  return (
    <form onSubmit={save} className="max-w-4xl space-y-7">
      <div><h1 className="text-3xl">Configuración del negocio</h1><p className="mt-2 text-gray-600">Información que verán los consumidores.</p></div>
      {(resource.error || message) && <div className={`p-4 rounded-lg border ${resource.error || message !== 'Configuración guardada.' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>{resource.error || message}</div>}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg">Identidad</h2>
        <label className="block text-sm">Nombre<input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" /></label>
        <label className="block text-sm">Descripción<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" /></label>
        <label className="block text-sm">URL del logo<input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" placeholder="https://…" /></label>
      </section>
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg">Contacto y sucursal principal</h2>
        <label className="block text-sm"><MapPin className="inline w-4 h-4 mr-2" />Dirección<input value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" /></label>
        <label className="block text-sm">Ciudad<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" /></label>
        <div className="grid sm:grid-cols-2 gap-4"><label className="text-sm"><Phone className="inline w-4 h-4 mr-2" />Teléfono<input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" /></label><label className="text-sm"><Mail className="inline w-4 h-4 mr-2" />Email<input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" /></label></div>
        <label className="block text-sm"><Globe className="inline w-4 h-4 mr-2" />Sitio web<input type="url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" placeholder="https://…" /></label>
      </section>
      <section className="bg-white rounded-lg shadow p-6"><h2 className="text-lg mb-4">Colores de marca</h2><div className="grid sm:grid-cols-3 gap-5">{([['brandColor', 'Primario'], ['secondaryColor', 'Secundario'], ['accentColor', 'Acento']] as const).map(([key, label]) => <label key={key} className="text-sm">{label}<div className="flex gap-2 mt-2"><input type="color" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-10 w-14" /><input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full border rounded-lg px-3" /></div></label>)}</div></section>
      <button className="flex gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg"><Save className="w-5 h-5" />Guardar cambios</button>
    </form>
  );
}
