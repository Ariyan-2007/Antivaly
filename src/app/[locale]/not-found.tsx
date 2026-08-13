import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="font-heading text-6xl font-bold text-primary">404</span>
      <h1 className="font-heading text-xl font-bold text-foreground">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Button render={<Link href="/">{t("cta")}</Link>} />
    </div>
  );
}
