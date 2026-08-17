"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getCachedNotificationPreferences,
  setCachedNotificationPreferences,
} from "@/lib/account/notification-preferences-cache";
import type { UpdateNotificationPreferencesRequest } from "@/types/api";

const FIELDS: (keyof UpdateNotificationPreferencesRequest)[] = [
  "marketingEmail",
  "backInStockAlerts",
  "reviewRequests",
  "marketingSms",
];

const DEFAULTS: UpdateNotificationPreferencesRequest = {
  marketingEmail: false,
  backInStockAlerts: false,
  reviewRequests: false,
  marketingSms: false,
};

/** Every preference defaults to false — opt-in only (blueprint §6.5). There's no GET for this
 * resource on the API, so on mount this loads whatever this browser last successfully saved
 * (see notification-preferences-cache.ts) rather than always showing a blank opt-out state
 * that would silently overwrite real opt-ins on the next save. */
export function NotificationPreferencesForm() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const user = useAuth();
  const [values, setValues] = useState<UpdateNotificationPreferencesRequest>(DEFAULTS);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) return;
    const cached = getCachedNotificationPreferences(user.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) setValues(cached);
  }, [user]);

  function handleSave() {
    startTransition(async () => {
      try {
        await browserFetch("/api/shop/account/notification-preferences", {
          method: "PUT",
          body: values,
        });
        if (user) setCachedNotificationPreferences(user.id, values);
        toast.success(tc("save"));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {FIELDS.map((field) => (
        <label key={field} className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={values[field]}
            onCheckedChange={(v) => setValues((prev) => ({ ...prev, [field]: !!v }))}
          />
          <Label className="cursor-pointer font-normal">{t(`notifications.${field}`)}</Label>
        </label>
      ))}
      <Button size="sm" onClick={handleSave} disabled={isPending} className="mt-1 w-fit">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {tc("save")}
      </Button>
    </div>
  );
}
