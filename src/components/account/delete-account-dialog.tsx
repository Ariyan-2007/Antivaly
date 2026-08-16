"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import { browserFetch } from "@/lib/api/browser";
import { ApiError } from "@/lib/api/client";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useCartStore } from "@/store/cart-store";

const CONFIRM_WORD = "DELETE";

export function DeleteAccountDialog() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const router = useRouter();
  const { setUser } = useAuthContext();
  const setCart = useCartStore((s) => s.setCart);
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await browserFetch("/api/shop/account", { method: "DELETE" });
        await browserFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        setCart(null);
        setUser(null);
        setOpen(false);
        router.push("/");
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : tc("errorGeneric"));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">{t("deleteAccount")}</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteAccountTitle")}</DialogTitle>
          <DialogDescription>{t("deleteAccountDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-delete">{t("deleteAccountConfirmLabel", { word: CONFIRM_WORD })}</Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={confirmText !== CONFIRM_WORD || isPending}
            onClick={handleDelete}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {t("deleteAccountConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
