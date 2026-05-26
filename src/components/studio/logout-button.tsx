"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/navigation";
import { useTranslations } from 'next-intl';

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations('Dashboard');
  
  return (
    <button 
      onClick={async () => { 
        await authClient.signOut(); 
        router.push("/login"); 
      }}
      className="px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white font-black uppercase text-[10px] tracking-widest border border-white/20 transition-all active:scale-95 shadow-xl"
    >
      {t('logout')} 🚪
    </button>
  );
}
