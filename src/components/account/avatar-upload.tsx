"use client";

import { useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Camera, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { browserFetch, browserFetchFormData } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { useAuthContext } from "@/components/providers/auth-provider";
import { resolveApiImageUrl } from "@/lib/image";
import type { UserSummaryResponse } from "@/types/api";

// Same whitelist/limit as product images and every other upload on the API (blueprint §9.41).
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarUpload({ user }: { user: UserSummaryResponse }) {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const router = useRouter();
  const { refresh } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const avatarSrc = resolveApiImageUrl(user.avatarUrl);
  const initial = (user.fullName || user.email || "?").slice(0, 1).toUpperCase();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("avatarInvalidType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("avatarTooLarge"));
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await browserFetchFormData("/api/auth/me/avatar", { method: "POST", formData });
        await refresh();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      try {
        await browserFetch("/api/auth/me/avatar", { method: "DELETE" });
        await refresh();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar size="lg" className="size-16">
        {avatarSrc && <AvatarImage src={avatarSrc} alt="" />}
        <AvatarFallback className="text-lg">{initial}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            {t("avatarChange")}
          </Button>
          {avatarSrc && (
            <Button type="button" size="sm" variant="ghost" disabled={isPending} onClick={handleRemove}>
              <X className="size-4" />
              {t("avatarRemove")}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("avatarHint")}</p>
      </div>
    </div>
  );
}
