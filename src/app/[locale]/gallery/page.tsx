import { db } from "@/db";
import { creations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Link } from "@/navigation";
import { ArrowLeft } from "lucide-react";
import { GalleryFilter } from "@/components/studio/gallery-filter";
import { CreationGrid, Creation } from "@/components/studio/creation-grid";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const currentFilter = type || "all";

  // Fetch data directly from DB on the server
  const allCreations = await db.query.creations.findMany({
    where: currentFilter === "all" ? undefined : eq(creations.type, currentFilter as 'drawing' | 'music' | 'story' | 'design'),
    with: {
      likes: true,
      user: {
        columns: {
          name: true,
          image: true,
        },
      },
      parent: {
        with: {
          user: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [desc(creations.createdAt)],
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <ArrowLeft className="w-6 h-6 text-[#475569]" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#475569] uppercase tracking-tighter italic flex items-center gap-2">
              <span className="text-3xl">🌙</span> QAMAR GALLERY
            </h1>
            <p className="text-[#64748b] font-medium">Explore amazing art and beats from our community!</p>
          </div>
        </div>

        <GalleryFilter currentFilter={currentFilter} />
      </header>

      <main className="max-w-7xl mx-auto">
        {allCreations.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-inner">
            <p className="text-2xl font-bold text-[#475569] mb-4">No creations found yet!</p>
            <Link href="/studio/draw">
                <button className="px-8 py-3 bg-[#FF6B6B] text-white font-bold rounded-full hover:scale-105 transition-transform">
                    Be the first to create!
                </button>
            </Link>
          </div>
        ) : (
          <CreationGrid creations={allCreations as unknown as Creation[]} />
        )}
      </main>
    </div>
  );
}

