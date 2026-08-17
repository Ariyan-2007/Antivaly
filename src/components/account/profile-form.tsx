"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import type { UserSummaryResponse } from "@/types/api";

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: UserSummaryResponse }) {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // `UserSummaryResponse` returns phone directly since 2026-08-17 (§9.41) — no more
    // guessing at a client-cached value.
    defaultValues: { fullName: user.fullName ?? "", phone: user.phone ?? "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await browserFetch("/api/auth/me", { method: "PUT", body: values });
      toast.success(t("saved"));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" value={user.email ?? ""} disabled />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input id="phone" type="tel" {...register("phone")} />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-fit">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {t("saveChanges")}
      </Button>

      {user.createdAt && (
        <p className="text-xs text-muted-foreground">
          {t("memberSince", { date: formatDate(user.createdAt, locale) })}
        </p>
      )}
    </form>
  );
}
