"use client";

import { NoorAvatar } from "@/components/studio/noor-avatar";

export function DashboardAvatar({ 
  level, 
  avatarState 
}: { 
  level: number, 
  avatarState?: string | null 
}) {
  return (
    <div className="relative z-20 shrink-0">
      <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse scale-150" />
      <div 
        className="cursor-pointer hover:rotate-6 transition-transform duration-500 hover:scale-110 active:scale-95 relative z-30"
      >
        <NoorAvatar level={level} state={avatarState} size="xl" />
      </div>
      <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-2xl rotate-12 z-40">
        <span className="text-2xl">👋</span>
      </div>
    </div>
  );
}
