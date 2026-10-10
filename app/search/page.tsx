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
      <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-10 sm:pt-14">
        <div className="text-center">
          <p className="inline-block rounded-sm border border-primary-200 bg-primary-100/40 px-3 py-1.5 text-small font-semibold tracking-[0.15em] text-primary-600 uppercase">
            Search results
          </p>
          <h1 className="mt-5 font-display text-display-2 font-medium tracking-tight break-words sm:text-display-1">
            {q ? (
              <>
                Results for <span className="text-primary-500">“{q}”</span>
              </>
            ) : (
              "Search your learning"
            )}
          </h1>
        </div>
        <SearchResults key={q} q={q} />
      </section>
    </PageFrame>
  );
}
