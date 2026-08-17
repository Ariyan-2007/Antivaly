"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useCartStore } from "@/store/cart-store";
import type { ChangePasswordRequest } from "@/types/api";

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });

type FormValues = z.infer<typeof schema>;

/** Distinct from forgot/reset-password (blueprint §6.1) — this is for a signed-in customer
 * who knows their current password. Success revokes every active session, including this
 * device's, so this logs the user out locally right after rather than leaving stale cookies
 * that would just 401 on the next authed call. */
export function ChangePasswordForm() {
  const t = useTranslations("account");
  const ta = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const { setUser } = useAuthContext();
  const setCart = useCartStore((s) => s.setCart);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const body: ChangePasswordRequest = {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        };
        await browserFetch("/api/auth/me/change-password", { method: "POST", body });
        reset();
        setDone(true);
        toast.success(t("passwordChanged"));
        await browserFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        setCart(null);
        setUser(null);
        router.push(`/login?redirect=${encodeURIComponent("/account")}`);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  if (done) {
    return <p className="text-sm text-muted-foreground">{t("passwordChanged")}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
        <Input id="currentPassword" type="password" {...register("currentPassword")} />
        {errors.currentPassword && (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">{ta("newPassword")}</Label>
        <Input id="newPassword" type="password" {...register("newPassword")} />
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">{ta("confirmPassword")}</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{ta("passwordMismatch")}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-fit">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {t("changePassword")}
      </Button>
    </form>
  );
}
