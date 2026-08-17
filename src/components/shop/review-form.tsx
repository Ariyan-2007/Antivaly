"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const schema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  body: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function ReviewForm({ productId }: { productId: string }) {
  const t = useTranslations("reviews");
  const tc = useTranslations("common");
  const user = useAuth();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { rating: 5 } });

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("signInToReview")}
        </Link>
      </p>
    );
  }

  if (submitted) {
    return <p className="text-sm text-muted-foreground">{t("submittedPendingModeration")}</p>;
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {t("writeReview")}
      </Button>
    );
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await browserFetch(`/api/shop/account/reviews`, {
          method: "POST",
          body: { productId, ...values },
        });
        setSubmitted(true);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-lg border border-border p-4"
    >
      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => field.onChange(star)}>
                <Star
                  className={cn(
                    "size-6",
                    star <= field.value ? "fill-deal text-deal" : "text-muted-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-title">{t("reviewTitle")}</Label>
        <Input id="review-title" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-body">{t("reviewBody")}</Label>
        <Textarea id="review-body" rows={3} {...register("body")} />
        {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("submitReview")}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {tc("cancel")}
        </Button>
      </div>
    </form>
  );
}
