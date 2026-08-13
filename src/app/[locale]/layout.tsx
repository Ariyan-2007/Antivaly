import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Poppins, Hind_Siliguri } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { routing } from "@/i18n/routing";
import { getBusiness, getCategories } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { isValidHexColor, contrastForeground } from "@/lib/color";
import "../globals.css";

const fontSans = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const fontHeading = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
const fontBengali = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer" });

  try {
    const business = await getBusiness();
    const name = business.name || "Antivaly";
    return {
      title: { default: name, template: `%s | ${name}` },
      description: business.description || t("aboutTitle"),
      icons: business.logoUrl ? [{ url: business.logoUrl }] : undefined,
      openGraph: {
        siteName: name,
        images: business.bannerUrl ? [business.bannerUrl] : undefined,
      },
    };
  } catch {
    return { title: "Antivaly" };
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  let business;
  try {
    business = await getBusiness();
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  // Categories are non-critical to the shell (nav still works via direct links) — a failure
  // here shouldn't take down the whole site the way a missing Business would.
  const categories = await getCategories().catch(() => []);

  const brand = isValidHexColor(business.themeColor) ? business.themeColor : undefined;
  const brandStyle = brand
    ? ({ "--brand": brand, "--brand-foreground": contrastForeground(brand) } as React.CSSProperties)
    : undefined;

  return (
    <html
      lang={locale}
      style={brandStyle}
      className={`${fontSans.variable} ${fontHeading.variable} ${fontBengali.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <AuthProvider>
            <SiteHeader business={business} categories={categories} />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <SiteFooter business={business} categories={categories} />
            <MobileBottomNav />
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
