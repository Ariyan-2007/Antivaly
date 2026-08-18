"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressFormDialog } from "@/components/account/address-form-dialog";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import type { AddressResponse } from "@/types/api";

/** Deleting the current default promotes another one server-side (blueprint §9.41) — which
 * one can't be derived client-side, so every mutation just re-fetches the full list rather
 * than patching local state. Low-frequency profile UI, correctness over one extra GET. */
export function AddressBook({ initialAddresses }: { initialAddresses: AddressResponse[] }) {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const [addresses, setAddresses] = useState(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AddressResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refetch() {
    startTransition(async () => {
      try {
        const fresh = await browserFetch<AddressResponse[]>("/api/shop/account/addresses");
        setAddresses(Array.isArray(fresh) ? fresh : []);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  function handleSaved() {
    setDialogOpen(false);
    refetch();
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await browserFetch(`/api/shop/account/addresses/${id}`, { method: "DELETE" });
        const fresh = await browserFetch<AddressResponse[]>("/api/shop/account/addresses");
        setAddresses(Array.isArray(fresh) ? fresh : []);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noSavedAddresses")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-border p-4"
            >
              <div className="flex flex-col gap-0.5 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">{address.label}</span>
                  {address.isDefault && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="size-3 fill-current" />
                      {t("defaultAddress")}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {[address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("editAddress")}
                  disabled={isPending}
                  onClick={() => {
                    setEditing(address);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={tc("remove")}
                  disabled={isPending}
                  onClick={() => handleDelete(address.id)}
                >
                  {deletingId === address.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
      >
        <Plus className="size-4" />
        {t("addAddress")}
      </Button>

      <AddressFormDialog
        address={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />
    </div>
  );
}
