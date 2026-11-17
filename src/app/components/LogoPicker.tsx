import { useEffect, useId, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { LOGO_ACCEPT, validateLogo } from "../lib/logoUpload";

interface Props {
  value: File | null;
  currentUrl?: string | null;
  removed?: boolean;
  disabled?: boolean;
  onChange(file: File | null): void;
  onRemove?(): void;
}

export default function LogoPicker({
  value,
  currentUrl,
  removed,
  disabled,
  onChange,
  onRemove,
}: Props) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);
  const src = preview || (!removed ? currentUrl : null);
  useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <div className="logo-picker">
      <div className="logo-picker-preview">
        {src && !broken ? (
          <img
            src={src}
            alt="Vista previa del logo"
            onError={() => setBroken(true)}
          />
        ) : (
          <ImagePlus size={28} aria-hidden="true" />
        )}
      </div>
      <div className="logo-picker-controls">
        <label htmlFor={id}>Logo del negocio</label>
        <input
          id={id}
          type="file"
          accept={LOGO_ACCEPT}
          disabled={disabled}
          aria-describedby={`${id}-help`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            const issue = validateLogo(file);
            setError(issue);
            if (!issue) onChange(file);
          }}
        />
        <p id={`${id}-help`}>
          PNG, JPEG o WebP · máximo 2 MB y 4096 × 4096 px.
        </p>
        {value && <p>{value.name}</p>}
        {(value || (!removed && currentUrl)) && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setError(null);
              if (value) onChange(null);
              else onRemove?.();
            }}
          >
            <Trash2 size={15} />
            {value ? "Cancelar selección" : "Quitar logo"}
          </button>
        )}
        {removed && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
          >
            Conservar logo actual
          </button>
        )}
        {error && (
          <p role="alert" className="logo-picker-error">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
