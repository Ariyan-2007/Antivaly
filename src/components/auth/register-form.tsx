"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { useAuthContext } from "@/components/providers/auth-provider";
import type { UserSummaryResponse } from "@/types/api";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().min(1).email(),
  phone: z.string().min(6),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const { setUser } = useAuthContext();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const user = await browserFetch<UserSummaryResponse>("/api/auth/register", {
        method: "POST",
        body: values,
      });
      setUser(user);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          for (const [field, messages] of Object.entries(err.errors)) {
            setError(field as keyof FormValues, { message: messages[0] });
          }
        }
        toast.error(err.message || tc("errorGeneric"));
      } else {
        toast.error(tc("errorGeneric"));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" placeholder={t("fullNamePlaceholder")} {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" placeholder={t("emailPlaceholder")} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input id="phone" type="tel" placeholder={t("phonePlaceholder")} {...register("phone")} />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t("passwordPlaceholder")}
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {t("submitRegister")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
