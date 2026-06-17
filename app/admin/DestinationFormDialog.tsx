"use client";

import { Plus, Trash2, Upload } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveDestinationAction,
  type DestinationSaveState,
} from "./actions";

type ImageRow = { url: string; alt: string };
type AvailabilityRow = { startDate: string; endDate: string; spotsLeft: number };

function ImageRowEditor({
  row,
  onChange,
  onRemove,
  onUploadError,
}: {
  row: ImageRow;
  onChange: (next: ImageRow) => void;
  onRemove: () => void;
  onUploadError: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        onUploadError(data.error ?? "Upload échoué.");
        return;
      }
      const { url } = (await res.json()) as { url: string };
      onChange({ ...row, url });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="grid grid-cols-[1fr_140px_auto_auto] gap-2">
      <Input
        placeholder="https://..."
        value={row.url}
        onChange={(e) => onChange({ ...row, url: e.target.value })}
      />
      <Input
        placeholder="Texte alternatif"
        value={row.alt}
        onChange={(e) => onChange({ ...row, alt: e.target.value })}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={uploading}
        title="Téléverser un fichier"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="h-4 w-4" />
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </div>
  );
}

export type DestinationInitial = {
  id: string;
  name: string;
  country: string;
  basePrice: number;
  shortDescription: string;
  description: string;
  images: { url: string; alt: string | null }[];
  availabilities: { startDate: Date; endDate: Date; spotsLeft: number }[];
};

function toIsoDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export default function DestinationFormDialog({
  initial,
  trigger,
}: {
  initial?: DestinationInitial;
  trigger: React.ReactElement;
}) {
  const isEdit = !!initial;
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [country, setCountry] = useState(initial?.country ?? "");
  const [basePrice, setBasePrice] = useState<number | "">(initial?.basePrice ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [images, setImages] = useState<ImageRow[]>(
    initial?.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })) ?? [],
  );
  const [availabilities, setAvailabilities] = useState<AvailabilityRow[]>(
    initial?.availabilities.map((a) => ({
      startDate: toIsoDate(a.startDate),
      endDate: toIsoDate(a.endDate),
      spotsLeft: a.spotsLeft,
    })) ?? [],
  );

  const [uploadError, setUploadError] = useState<string | null>(null);

  const [state, action, pending] = useActionState<DestinationSaveState, FormData>(
    saveDestinationAction,
    null,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      setOpen(false);
    }
  }, [state]);

  useEffect(() => {
    if (!open && !isEdit) {
      setName("");
      setCountry("");
      setBasePrice("");
      setShortDescription("");
      setDescription("");
      setImages([]);
      setAvailabilities([]);
    }
    if (!open) setUploadError(null);
  }, [open, isEdit]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form action={action} className="space-y-5">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? `Modifier — ${initial?.name}` : "Ajouter une destination"}
            </DialogTitle>
            <DialogDescription>
              Renseignez les champs ci-dessous. Les images et disponibilités existantes
              seront remplacées par celles fournies ici.
            </DialogDescription>
          </DialogHeader>

          {state && "error" in state && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {state.error}
            </p>
          )}

          {uploadError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {uploadError}
            </p>
          )}

          {isEdit && <input type="hidden" name="id" value={initial!.id} />}
          <input type="hidden" name="images" value={JSON.stringify(images)} />
          <input
            type="hidden"
            name="availabilities"
            value={JSON.stringify(availabilities)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="d-name">Nom</Label>
              <Input
                id="d-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-country">Pays</Label>
              <Input
                id="d-country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-price">Prix de base (€)</Label>
              <Input
                id="d-price"
                name="basePrice"
                type="number"
                min={0}
                step="0.01"
                value={basePrice}
                onChange={(e) =>
                  setBasePrice(e.target.value === "" ? "" : Number(e.target.value))
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-short">Description courte</Label>
              <Input
                id="d-short"
                name="shortDescription"
                maxLength={280}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="d-desc">Description complète</Label>
            <textarea
              id="d-desc"
              name="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <fieldset className="space-y-2">
            <div className="flex items-center justify-between">
              <legend className="text-sm font-medium">Images</legend>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setImages((arr) => [...arr, { url: "", alt: "" }])}
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </Button>
            </div>
            {images.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune image pour l'instant.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_140px_auto_auto] gap-2 px-1 text-xs text-muted-foreground">
                  <span>URL</span>
                  <span>Texte alternatif</span>
                  <span className="text-center">Fichier</span>
                  <span className="sr-only">Actions</span>
                </div>
                {images.map((img, i) => (
                  <ImageRowEditor
                    key={i}
                    row={img}
                    onChange={(next) =>
                      setImages((arr) => arr.map((v, j) => (j === i ? next : v)))
                    }
                    onRemove={() =>
                      setImages((arr) => arr.filter((_, j) => j !== i))
                    }
                    onUploadError={setUploadError}
                  />
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-2">
            <div className="flex items-center justify-between">
              <legend className="text-sm font-medium">Disponibilités</legend>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  setAvailabilities((arr) => [
                    ...arr,
                    { startDate: "", endDate: "", spotsLeft: 10 },
                  ])
                }
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </Button>
            </div>
            {availabilities.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune date disponible.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_90px_auto] gap-2 px-1 text-xs text-muted-foreground">
                  <span>Date de début</span>
                  <span>Date de fin</span>
                  <span>Places</span>
                  <span className="sr-only">Actions</span>
                </div>
                {availabilities.map((av, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_90px_auto] gap-2">
                    <Input
                      type="date"
                      value={av.startDate}
                      onChange={(e) =>
                        setAvailabilities((arr) =>
                          arr.map((v, j) =>
                            j === i ? { ...v, startDate: e.target.value } : v,
                          ),
                        )
                      }
                    />
                    <Input
                      type="date"
                      value={av.endDate}
                      onChange={(e) =>
                        setAvailabilities((arr) =>
                          arr.map((v, j) =>
                            j === i ? { ...v, endDate: e.target.value } : v,
                          ),
                        )
                      }
                    />
                    <Input
                      type="number"
                      min={0}
                      value={av.spotsLeft}
                      onChange={(e) =>
                        setAvailabilities((arr) =>
                          arr.map((v, j) =>
                            j === i
                              ? { ...v, spotsLeft: Number(e.target.value) || 0 }
                              : v,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setAvailabilities((arr) => arr.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
