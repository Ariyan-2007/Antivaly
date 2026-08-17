import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import { getPages, getPage } from "@/lib/api/catalog";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const pages = await getPages();
    return pages.filter((p) => p.slug).map((p) => ({ slug: p.slug as string }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.metaTitle || page.title || undefined,
    description: page.metaDescription || undefined,
    alternates: { canonical: `/${locale}/pages/${slug}` },
  };
}

export default async function StaticPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getPage(slug);
  if (!page || !page.isVisibleNow) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading mb-2 text-2xl font-bold text-foreground">{page.title}</h1>
      {page.subtitle && <p className="mb-6 text-muted-foreground">{page.subtitle}</p>}
      <div
        className={[
          "flex flex-col gap-4 text-sm leading-relaxed text-foreground",
          "[&_h1]:font-heading [&_h1]:text-xl [&_h1]:font-bold",
          "[&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold",
          "[&_h3]:font-heading [&_h3]:text-base [&_h3]:font-semibold",
          "[&_p]:text-muted-foreground [&_li]:text-muted-foreground",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        ].join(" ")}
      >
        <ReactMarkdown>{page.body || ""}</ReactMarkdown>
      </div>
    </div>
  );
}
