import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Link } from "@/navigation";
import { Sparkles, Trophy, Award, PartyPopper, Cloud, Sun } from "lucide-react";
import { db } from "@/db";
import { userBadges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardAvatar } from "@/components/studio/dashboard-avatar";
import { LogoutButton } from "@/components/studio/logout-button";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const t = await getTranslations('Dashboard');
  const { user } = session;
  const xp = typeof user?.xp === 'number' ? user.xp : 0;
  const level = typeof user?.level === 'number' ? user.level : 1;
  const avatarState = user?.avatarState;
  const xpInLevel = xp % 100;
  const progress = (xpInLevel / 100) * 100;

  // Fetch badges on the server
  const badges = await db.query.userBadges.findMany({
    where: eq(userBadges.userId, user.id),
    with: {
        badge: true
    }
  });

  return (
    <div className="min-h-screen bg-[#FFFBEB] font-sans antialiased overflow-x-hidden relative flex flex-col">
      {/* DECORATIVE FLOATING ELEMENTS */}
      <div className="absolute top-20 left-10 opacity-20 animate-float pointer-events-none">
        <Cloud size={100} className="text-[#A78BFA]" />
      </div>
      <div className="absolute top-40 right-20 opacity-20 animate-float-delayed pointer-events-none">
        <Sun size={80} className="text-[#FFE66D]" />
      </div>
      <div className="absolute bottom-40 left-20 opacity-10 animate-spin-slow pointer-events-none">
        <Sparkles size={120} className="text-[#FF6B6B]" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto w-full flex-1">
        
        {/* HERO SECTION */}
        <div className="w-full bg-gradient-to-br from-[#A78BFA] to-[#818CF8] rounded-[3rem] p-8 md:p-12 mb-10 shadow-2xl border-b-[12px] border-black/10 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 min-h-[300px]">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <DashboardAvatar level={level} avatarState={avatarState} />

            <div className="text-center lg:text-left flex-1 space-y-4 relative z-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest animate-bounce-slow">
                    <PartyPopper size={12} />
                    {t('welcomeKingdom')}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-lg">
                    {t('greeting', { name: (user?.name || "Hero").split(' ')[0] })}
                </h1>
                <p className="text-white/90 text-base md:text-lg font-bold uppercase tracking-tight max-w-xl">
                    {t('magicDay')}
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                    {/* Progress Card */}
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 min-w-[220px]">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                            <Trophy className="text-[#FFE66D] fill-[#FFE66D] w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">{t('explorer')}</p>
                            <p className="text-xl font-black text-white leading-none">{t('level', { level })}</p>
                        </div>
                        <div className="ml-auto w-10 h-10 flex items-center justify-center relative">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="20" cy="20" r="16" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                <circle cx="20" cy="20" r="16" fill="transparent" stroke="white" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset={100.5 - (100.5 * (progress || 0)) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                            <span className="absolute text-[8px] font-black text-white">{Math.round(progress || 0)}%</span>
                        </div>
                    </div>

                    <LogoutButton />
                </div>
            </div>
        </div>


        {/* SIX CREATIVE PILLARS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
            <PillarCard 
                href="/studio/draw" 
                icon="🎨" 
                title={t('masterArt')} 
                desc={t('magicBrushes')} 
                color="#FF6B6B" 
                shadow="shadow-glow-red" 
            />
            <PillarCard 
                href="/studio/music" 
                icon="🎵" 
                title={t('beatLab')} 
                desc={t('mixMelodies')} 
                color="#4ECDC4" 
                shadow="shadow-glow-teal" 
            />
            <PillarCard 
                href="/studio/story" 
                icon="📖" 
                title={t('tales')} 
                desc={t('prophetStories')} 
                color="#FFE66D" 
                shadow="shadow-glow-yellow" 
            />
            <PillarCard 
                href="/studio/quran" 
                icon="🕋" 
                title={t('quran')} 
                desc={t('listenLearn')} 
                color="#A78BFA" 
                shadow="shadow-glow-purple" 
            />
            <PillarCard 
                href="/studio/hadith" 
                icon="✨" 
                title={t('hadith')} 
                desc={t('dailyWisdom')} 
                color="#6366f1" 
                shadow="shadow-glow-blue" 
            />
            <PillarCard 
                href="/gallery" 
                icon="🌟" 
                title={t('gallery')} 
                desc={t('seeAllArt')} 
                color="#F472B6" 
                shadow="shadow-glow-pink" 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Badges Section */}
            <div className="bg-[#475569] p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group border-b-[16px] border-black/20">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-10 relative z-10 flex items-center gap-4">
                    <Trophy className="text-[#FFE66D] fill-[#FFE66D]" /> {t('hallOfFame')}
                </h2>
                <div className="relative z-10 flex-1 min-h-[160px]">
                    {badges.length === 0 ? (
                        <div className="text-center py-10 px-4 bg-black/10 rounded-[2.5rem] border-2 border-dashed border-white/10">
                            <Award className="w-16 h-16 text-white/5 mx-auto mb-4" />
                            <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">{t('unlockFirstBadge')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">
                            {badges.map((ub) => {
                                const b = ub.badge;
                                if (!b || Array.isArray(b)) return null;
                                return (
                                    <div key={ub.badgeId} className="flex flex-col items-center gap-2 group/badge" title={b.description || ""}>
                                        <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-4xl group-hover/badge:scale-110 transition-all shadow-2xl">
                                            {b.icon}
                                        </div>
                                        <span className="text-[9px] font-black text-white/60 text-center truncate w-full">{b.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Magic Vault Section */}
            <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden border-b-[16px] border-[#FFE66D]/20 flex flex-col justify-between group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Sparkles size={120} className="text-[#FFE66D]" /></div>
                <h2 className="text-3xl font-black text-[#475569] uppercase tracking-tighter italic mb-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#A78BFA]/10 rounded-xl flex items-center justify-center"><Sparkles className="text-[#A78BFA]" /></div>
                    {t('magicVault')}
                </h2>
                <div className="flex-1 flex items-center justify-center py-12 px-6 bg-[#FFFBEB] rounded-[2.5rem] border-4 border-dashed border-[#FFE66D]/30 mb-6">
                    <div className="text-center">
                        <p className="text-[#64748b] font-black text-xl mb-8 uppercase tracking-widest">{t('vaultWaiting')}</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/studio/draw"><button className="px-10 py-5 bg-[#FF6B6B] text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs border-b-4 border-red-600">{t('masterArt')} 🎨</button></Link>
                            <Link href="/studio/music"><button className="px-10 py-5 bg-[#4ECDC4] text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs border-b-4 border-teal-600">{t('beatLab')} 🎵</button></Link>
                        </div>
                    </div>
                </div>
                <div className="text-center text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.5em]">{t('vaultMotto')}</div>
            </div>
        </div>
      </div>

      <footer className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-50">
          <div className="bg-white px-10 py-4 rounded-full shadow-3xl border-4 border-[#FFE66D] flex items-center gap-4 animate-bounce-slow">
              <span className="text-3xl">🌙</span>
              <span className="text-sm font-black text-[#475569] uppercase tracking-[0.6em]">{t('universe')}</span>
          </div>
      </footer>
    </div>
  );
}

function PillarCard({ href, icon, title, desc, color, shadow }: { href: string, icon: string, title: string, desc: string, color: string, shadow: string }) {
    return (
        <Link
            href={href}
            className={`p-8 bg-white rounded-[3rem] shadow-xl hover:shadow-2xl ${shadow} transition-all border-b-[12px] group active:scale-95 flex flex-col items-center text-center relative overflow-hidden h-full min-h-[280px]`}
            style={{ borderBottomColor: color }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700" style={{ color }}><Sparkles className="w-20 h-20" /></div>
            <div className="text-8xl mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-2xl">{icon}</div>
            <h2 className="text-2xl font-black text-[#475569] mb-2 uppercase tracking-tighter italic leading-tight">{title}</h2>
            <p className="text-[#64748b] text-[11px] leading-relaxed font-black uppercase tracking-widest opacity-60">{desc}</p>
        </Link>
    );
}
