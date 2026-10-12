import type { Metadata } from "next";
import { PageFrame } from "@/components/page-frame";
import { SearchResults } from "@/components/search-results";

type Props = PageProps<"/search">;

const queryOf = async (searchParams: Props["searchParams"]) => {
  const q = (await searchParams).q;
  return (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 200) ?? "";
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await queryOf(searchParams);
  return { title: q ? `Search: ${q} · Vertex` : "Search · Vertex" };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = await queryOf(searchParams);

  return (
    <PageFrame>
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-8 sm:pt-14">
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-extrabold tracking-[-0.035em] break-words text-balance">
          {q ? (
            <>
              <span className="sr-only">Results for </span>
              <span className="text-amber">“</span>
              {q}
              <span className="text-amber">”</span>
            </>
          ) : (
            "Search your learning"
          )}
        </h1>
        <SearchResults key={q} q={q} />
      </section>
    </PageFrame>
  );
}
