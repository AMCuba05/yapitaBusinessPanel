import { FormEvent, useEffect, useState } from 'react';
import { Globe, Mail, Phone, Save } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useBusinessResource } from '../lib/useBusinessResource';

interface Location {
  id: string;
  name: string;
  addressLine: string;
  city: string | null;
  phone: string | null;
}

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
  locations: Location[];
}

const empty: Profile = { displayName: '', description: '', contactEmail: '', contactPhone: '', websiteUrl: '', brandColor: '#9333ea', secondaryColor: '#f59e0b', accentColor: '#10b981', logoUrl: '', locations: [] };

export default function BusinessConfig() {
  const { assignment, request } = useAuth();
  const resource = useBusinessResource<Profile>('/business/profile', empty);
  const [form, setForm] = useState({ displayName: '', description: '', contactEmail: '', contactPhone: '', websiteUrl: '', brandColor: '#9333ea', secondaryColor: '#f59e0b', accentColor: '#10b981', logoUrl: '' });
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const canManage = !!assignment && ['owner', 'admin', 'manager'].includes(assignment.role);
  useEffect(() => {
    setLocation(null);
    setLocationError(null);
  }, [assignment?.id]);
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

  function editLocation(next: Location) {
    const { id, name, addressLine, city, phone } = next;
    setLocation({ id, name, addressLine, city, phone });
    setLocationError(null);
  }

  async function saveLocation(event: FormEvent) {
    event.preventDefault();
    if (!assignment || !canManage || !location || savingLocation) return;
    setSavingLocation(true);
    setLocationError(null);
    try {
      const { id, ...fields } = location;
      await request(id ? `/business/locations/${id}` : "/business/locations", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({ assignmentId: assignment.id, ...fields }),
      });
      setLocation(null);
      await resource.refresh();
    } catch (reason) {
      setLocationError(reason instanceof Error ? reason.message : "No se pudo guardar la sucursal.");
    } finally {
      setSavingLocation(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-7">
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
        <h2 className="text-lg">Contacto</h2>
        <div className="grid sm:grid-cols-2 gap-4"><label className="text-sm"><Phone className="inline w-4 h-4 mr-2" />Teléfono<input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" /></label><label className="text-sm"><Mail className="inline w-4 h-4 mr-2" />Email<input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" /></label></div>
        <label className="block text-sm"><Globe className="inline w-4 h-4 mr-2" />Sitio web<input type="url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="mt-2 w-full border rounded-lg px-4 py-2" placeholder="https://…" /></label>
      </section>
      <section className="bg-white rounded-lg shadow p-6"><h2 className="text-lg mb-4">Colores de marca</h2><div className="grid sm:grid-cols-3 gap-5">{([['brandColor', 'Primario'], ['secondaryColor', 'Secundario'], ['accentColor', 'Acento']] as const).map(([key, label]) => <label key={key} className="text-sm">{label}<div className="flex gap-2 mt-2"><input type="color" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-10 w-14" /><input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full border rounded-lg px-3" /></div></label>)}</div></section>
      <button className="flex gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg"><Save className="w-5 h-5" />Guardar cambios</button>
    </form>
    <section className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg">Sucursales</h2>
        {canManage && !resource.loading && !resource.error && (
          <button
            type="button"
            disabled={savingLocation}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white"
            onClick={() => editLocation({ id: "", name: "", addressLine: "", city: "", phone: "" })}
          >
            Nueva sucursal
          </button>
        )}
      </div>
      <ul className="divide-y">
        {resource.data.locations.map((branch) => (
          <li key={branch.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p>{branch.name}</p>
              <p className="text-sm text-gray-600">{[branch.addressLine, branch.city].filter(Boolean).join(", ")}</p>
            </div>
            {canManage && (
              <button type="button" disabled={savingLocation} className="text-purple-700" onClick={() => editLocation(branch)}>
                Editar
              </button>
            )}
          </li>
        ))}
      </ul>
      {location && canManage && (
        <form onSubmit={saveLocation} className="space-y-4 border-t pt-4">
          <h3>{location.id ? "Editar sucursal" : "Nueva sucursal"}</h3>
          {locationError && <p role="alert" className="text-sm text-red-700">{locationError}</p>}
          <fieldset disabled={savingLocation} className="grid gap-4 sm:grid-cols-2">
            {([
              ["name", "Nombre", 160, true],
              ["addressLine", "Dirección", 240, true],
              ["city", "Ciudad", 120, false],
              ["phone", "Teléfono", 40, false],
            ] as const).map(([field, label, maxLength, required]) => (
              <label key={field} className="block text-sm">
                {label}
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  required={required}
                  maxLength={maxLength}
                  value={location[field] ?? ""}
                  onChange={(event) => setLocation({ ...location, [field]: event.target.value })}
                />
              </label>
            ))}
            <div className="flex gap-3 sm:col-span-2">
              <button className="px-4 py-2 rounded-lg bg-purple-600 text-white">
                {savingLocation ? "Guardando…" : "Guardar sucursal"}
              </button>
              <button type="button" onClick={() => setLocation(null)} className="px-4 py-2 border rounded-lg">
                Cancelar
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
    </div>
  );
}
