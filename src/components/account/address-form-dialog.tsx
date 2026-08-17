"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import type { AddressResponse, SaveAddressRequest } from "@/types/api";

const schema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(6),
  isDefault: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY_VALUES: FormValues = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Bangladesh",
  phone: "",
  isDefault: false,
};

function fromAddress(address: AddressResponse): FormValues {
  return {
    label: address.label ?? "",
    line1: address.line1 ?? "",
    line2: address.line2 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    postalCode: address.postalCode ?? "",
    country: address.country || "Bangladesh",
    phone: address.phone ?? "",
    isDefault: address.isDefault,
  };
}

/** Shared add/edit dialog, fully controlled from AddressBook — `address` is null for "add
 * new", set for "edit this one". The first address ever saved becomes the default
 * automatically server-side (blueprint §9.41), so the checkbox is just a hint, not the only
 * way a customer ends up with a default. */
export function AddressFormDialog({
  address,
  open,
  onOpenChange,
  onSaved,
}: {
  address: AddressResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const tch = useTranslations("checkout");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY_VALUES });

  useEffect(() => {
    if (open) reset(address ? fromAddress(address) : EMPTY_VALUES);
  }, [open, address, reset]);

  async function onSubmit(values: FormValues) {
    const body: SaveAddressRequest = { ...values, line2: values.line2 ?? "" };
    try {
      if (address) {
        await browserFetch(`/api/shop/account/addresses/${address.id}`, { method: "PUT", body });
      } else {
        await browserFetch("/api/shop/account/addresses", { method: "POST", body });
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? t("editAddress") : t("addAddress")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addr-label">{tch("addressLabel")}</Label>
            <Input id="addr-label" placeholder={tch("addressLabelPlaceholder")} {...register("label")} />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addr-line1">{tch("line1")}</Label>
            <Input id="addr-line1" {...register("line1")} />
            {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addr-line2">{tch("line2")}</Label>
            <Input id="addr-line2" {...register("line2")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-city">{tch("city")}</Label>
              <Input id="addr-city" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-state">{tch("state")}</Label>
              <Input id="addr-state" {...register("state")} />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-postalCode">{tch("postalCode")}</Label>
              <Input id="addr-postalCode" {...register("postalCode")} />
              {errors.postalCode && (
                <p className="text-xs text-destructive">{errors.postalCode.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-country">{tch("country")}</Label>
              <Input id="addr-country" {...register("country")} />
              {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addr-phone">{tch("phone")}</Label>
            <Input id="addr-phone" type="tel" {...register("phone")} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <Controller
            control={control}
            name="isDefault"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                {tch("setAsDefault")}
              </label>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {tc("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
