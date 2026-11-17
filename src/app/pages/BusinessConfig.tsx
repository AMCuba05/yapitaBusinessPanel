import { FormEvent, useEffect, useState } from "react";
import { Globe, Mail, Phone, Save } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import LogoPicker from "../components/LogoPicker";
import { assignmentQuery } from "../lib/api";
import { logoFormData } from "../lib/logoUpload";
import { colorOptions } from "../lib/colorOptions";
import { useBusinessResource } from "../lib/useBusinessResource";

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
  logoUrl: string | null;
  locations: Location[];
}

const empty: Profile = {
  displayName: "",
  description: "",
  contactEmail: "",
  contactPhone: "",
  websiteUrl: "",
  brandColor: "#9333ea",
  logoUrl: "",
  locations: [],
};

export default function BusinessConfig() {
  const { assignment, request } = useAuth();
  const resource = useBusinessResource<Profile>("/business/profile", empty);
  const [form, setForm] = useState({
    displayName: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    websiteUrl: "",
    brandColor: "#9333ea",
    logoUrl: "",
  });
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const canManage =
    !!assignment && ["owner", "admin", "manager"].includes(assignment.role);

  useEffect(() => {
    setLogoFile(null);
    setRemoveLogo(false);
    setMessage(null);
    setLocation(null);
    setLocationError(null);
  }, [assignment?.id]);

  useEffect(() => {
    const profile = resource.data;
    setForm({
      displayName: profile.displayName,
      description: profile.description ?? "",
      contactEmail: profile.contactEmail ?? "",
      contactPhone: profile.contactPhone ?? "",
      websiteUrl: profile.websiteUrl ?? "",
      brandColor: profile.brandColor ?? "#9333ea",
      logoUrl: profile.logoUrl ?? "",
    });
  }, [resource.data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!assignment || saving || !canManage) return;
    setMessage(null);
    setSaving(true);
    let profileSaved = false;
    try {
      const { logoUrl: _logoUrl, ...profile } = form;
      await request("/business/profile", {
        method: "PATCH",
        body: JSON.stringify({
          assignmentId: assignment.id,
          ...profile,
          websiteUrl: form.websiteUrl || undefined,
        }),
      });
      profileSaved = true;
      const path = `/business/profile/logo?${assignmentQuery(assignment.id)}`;
      if (logoFile)
        await request(path, { method: "POST", body: logoFormData(logoFile) });
      else if (removeLogo) await request(path, { method: "DELETE" });
      setLogoFile(null);
      setRemoveLogo(false);
      setMessage("Configuración guardada.");
      await resource.refresh();
    } catch (reason) {
      const detail =
        reason instanceof Error ? reason.message : "No se pudo guardar.";
      setMessage(
        profileSaved
          ? `Los datos se guardaron, pero el cambio de logo está pendiente. ${detail} Puedes volver a guardar para reintentarlo.`
          : detail,
      );
    } finally {
      setSaving(false);
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
      <div>
        <h1 className="text-3xl">Configuración del negocio</h1>
        <p className="mt-2 text-gray-600">
          Información que verán los consumidores.
        </p>
      </div>
      {(resource.error || message) && (
        <div
          className={`p-4 rounded-lg border ${resource.error || message !== "Configuración guardada." ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}
        >
          {resource.error || message}
        </div>
      )}
      <fieldset
        disabled={saving || resource.loading || !!resource.error || !canManage}
        className="space-y-7"
      >
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg">Identidad</h2>
          <label className="block text-sm">
            Nombre
            <input
              required
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
              className="mt-2 w-full border rounded-lg px-4 py-2"
            />
          </label>
          <label className="block text-sm">
            Descripción
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="mt-2 w-full border rounded-lg px-4 py-2"
            />
          </label>
          <LogoPicker
            value={logoFile}
            currentUrl={form.logoUrl}
            removed={removeLogo}
            disabled={saving || !canManage}
            onChange={(file) => {
              setLogoFile(file);
              setRemoveLogo(false);
            }}
            onRemove={() => {
              setRemoveLogo(true);
              setLogoFile(null);
            }}
          />
          {removeLogo && (
            <p className="text-sm text-gray-500">
              El logo se eliminará al guardar los cambios.
            </p>
          )}
        </section>
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg">Contacto</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <Phone className="inline w-4 h-4 mr-2" />
              Teléfono
              <input
                value={form.contactPhone}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
                className="mt-2 w-full border rounded-lg px-4 py-2"
              />
            </label>
            <label className="text-sm">
              <Mail className="inline w-4 h-4 mr-2" />
              Email
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
                className="mt-2 w-full border rounded-lg px-4 py-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            <Globe className="inline w-4 h-4 mr-2" />
            Sitio web
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              className="mt-2 w-full border rounded-lg px-4 py-2"
              placeholder="https://…"
            />
          </label>
        </section>
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg mb-4">Color de marca</h2>
          <label className="block max-w-md text-sm">
            Primario
            <div className="mt-2 flex items-center gap-3">
              <span
                className="h-9 w-9 shrink-0 rounded-lg border border-black/10 shadow-sm"
                style={{ backgroundColor: form.brandColor }}
                aria-hidden="true"
              />
              <select
                value={form.brandColor}
                onChange={(e) =>
                  setForm({ ...form, brandColor: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2"
              >
                {!colorOptions.some(
                  (option) => option.value === form.brandColor,
                ) && <option value={form.brandColor}>Color anterior</option>}
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="mt-1 block text-xs text-gray-500">
              Elige uno de los colores disponibles para mantener buena
              legibilidad en la app.
            </span>
          </label>
        </section>
        {!canManage && (
          <p className="text-sm text-gray-500">
            Solo el propietario, administrador o gerente puede editar el
            negocio.
          </p>
        )}
        <button
          disabled={
            saving || resource.loading || !!resource.error || !canManage
          }
          className="flex gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg"
        >
          <Save className="w-5 h-5" />
          {saving ? "Guardando cambios…" : "Guardar cambios"}
        </button>
      </fieldset>
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
