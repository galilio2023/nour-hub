"use client";

import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function GalleryFilter({ currentFilter }: { currentFilter: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("type");
    } else {
      params.set("type", newFilter);
    }
    router.push(`/gallery?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border">
      <Filter className="w-5 h-5 text-[#64748b] ml-2" />
      <select 
        value={currentFilter} 
        onChange={(e) => handleFilterChange(e.target.value)}
        className="bg-transparent outline-none px-4 py-2 text-[#475569] font-semibold cursor-pointer"
      >
        <option value="all">All Creations</option>
        <option value="drawing">Drawings</option>
        <option value="music">Music</option>
        <option value="story">Stories</option>
      </select>
    </div>
  );
}
