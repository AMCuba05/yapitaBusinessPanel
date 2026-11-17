import { FormEvent, useState } from 'react';
import { Edit, Plus, Smartphone, Trash2, UserCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { assignmentQuery } from '../lib/api';
import { useBusinessResource } from '../lib/useBusinessResource';

interface Staff {
  id: string;
  fullName: string;
  email: string;
  role: string;
  jobTitle: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  scansTotal: number;
  locations: Array<{ id: string; name: string }>;
}

export default function Cashiers() {
  const { assignment, request } = useAuth();
  const resource = useBusinessResource<Staff[]>('/business/staff', []);
  const branches = useBusinessResource<{ locations: Array<{ id: string; name: string; status: string }> }>('/business/profile', { locations: [] });
  const locations = branches.data.locations.filter(({ status }) => status === 'active');
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'cashier', locationIds: [] as string[] });

  function open(staff?: Staff) {
    setEditing(staff ?? null);
    setForm({
      fullName: staff?.fullName ?? '',
      email: staff?.email ?? '',
      role: staff?.role ?? 'cashier',
      locationIds: staff?.locations.map(({ id }) => id)
        ?? assignment?.locations.map(({ id }) => id).filter((id) => locations.some((location) => location.id === id))
        ?? [],
    });
    setShow(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!assignment) return;
    setError(null);
    try {
      await request(`/business/staff${editing ? `/${editing.id}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify({ assignmentId: assignment.id, ...form, email: editing ? undefined : form.email }),
      });
      setShow(false);
      await resource.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar.');
    }
  }

  async function disable(staff: Staff) {
    if (!assignment || !confirm(`¿Deshabilitar el acceso de ${staff.fullName}?`)) return;
    await request(`/business/staff/${staff.id}?${assignmentQuery(assignment.id)}`, { method: 'DELETE' });
    await resource.refresh();
  }

  const active = resource.data.filter(({ status }) => status === 'active').length;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl">Cajeros y personal</h1><p className="mt-2 text-gray-600">Usuarios autorizados para la app scanner.</p></div>
        <button onClick={() => open()} disabled={branches.loading || !!branches.error} className="flex gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg"><Plus className="w-5 h-5" />Invitar usuario</button>
      </div>
      {(error || resource.error || branches.error) && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error || resource.error || branches.error}</div>}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6"><UserCheck className="text-purple-600" /><p className="text-2xl mt-2">{active}</p><p className="text-sm text-gray-500">Usuarios activos</p></div>
        <div className="bg-white rounded-lg shadow p-6"><Smartphone className="text-green-600" /><p className="text-2xl mt-2">{resource.data.reduce((sum, item) => sum + item.scansTotal, 0)}</p><p className="text-sm text-gray-500">Turnos registrados</p></div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        Yapita ya no usa PINs. El usuario inicia sesión con Firebase Email/Password; su correo debe coincidir exactamente con esta invitación y estar verificado.
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resource.data.map((staff) => (
          <article key={staff.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between"><div className="w-11 h-11 bg-purple-100 text-purple-700 rounded-full grid place-items-center">{staff.fullName.charAt(0)}</div><span className="text-xs bg-gray-100 rounded px-2 py-1 h-fit">{staff.status}</span></div>
            <h2 className="mt-4 text-lg">{staff.fullName}</h2><p className="text-sm text-gray-500">{staff.email}</p>
            <p className="mt-3 text-sm capitalize">{staff.role} · {staff.locations.map(({ name }) => name).join(', ') || 'Sin sucursales asignadas'}</p>
            <p className="text-xs text-gray-400 mt-2">Último acceso: {staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleString('es-BO') : 'pendiente'}</p>
            <div className="flex gap-2 mt-4"><button onClick={() => open(staff)} disabled={branches.loading || !!branches.error} className="p-2 border rounded"><Edit className="w-4 h-4" /></button>{staff.role !== 'owner' && <button onClick={() => void disable(staff)} className="p-2 border rounded text-red-600"><Trash2 className="w-4 h-4" /></button>}</div>
          </article>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
          <form onSubmit={save} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl">{editing ? 'Editar usuario' : 'Invitar usuario'}</h2>
            <input required placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            <input required disabled={Boolean(editing)} type="email" placeholder="correo@negocio.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2"><option value="cashier">Cajero</option><option value="staff">Personal</option><option value="manager">Gerente</option><option value="viewer">Solo lectura</option><option value="admin">Administrador</option></select>
            <fieldset><legend className="text-sm mb-2">Sucursales autorizadas</legend>{locations.map((location) => <label key={location.id} className="flex gap-2 text-sm mb-2"><input type="checkbox" checked={form.locationIds.includes(location.id)} onChange={(e) => setForm({ ...form, locationIds: e.target.checked ? [...form.locationIds, location.id] : form.locationIds.filter((id) => id !== location.id) })} />{location.name}</label>)}</fieldset>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className="px-4 py-2 border rounded-lg">Cancelar</button><button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Guardar</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
