import { Link } from "@/navigation";
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('Landing');

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-12 bg-gradient-to-b from-[#FFF] to-[#F1F5F9] font-sans antialiased">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex mb-12">
        <p className="flex items-center gap-3 px-8 py-5 bg-white border-4 border-white rounded-[2rem] shadow-2xl">
          <span className="text-[#64748b] font-black uppercase tracking-widest text-[10px]">{t('welcomeTo')}</span>
          <code className="font-black uppercase tracking-[0.2em] text-[#475569] flex items-center gap-3 border-l-2 border-gray-100 pl-3">
            <span className="text-3xl animate-bounce-slow">🌙</span> QAMAR
          </code>
        </p>
      </div>

      <div className="grid text-center lg:max-w-7xl lg:w-full lg:grid-cols-6 lg:text-left gap-4 md:gap-6">
        {/* 1. DRAWING */}
        <Link
          href="/studio/draw"
          className="group rounded-3xl border border-transparent px-4 py-8 transition-all hover:border-gray-200 hover:bg-white hover:shadow-2xl border-b-8 border-b-[#FF6B6B] bg-white/50 flex flex-col items-center lg:items-start"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">🎨</div>
          <h2 className={`mb-2 text-xl font-black text-[#475569] uppercase tracking-tighter italic`}>
            {t('drawing')}
          </h2>
          <p className={`m-0 text-[9px] text-[#64748b] font-medium leading-relaxed`}>
            {t('drawingDesc')}
          </p>
        </Link>

        {/* 2. MUSIC */}
        <Link
          href="/studio/music"
          className="group rounded-3xl border border-transparent px-4 py-8 transition-all hover:border-gray-200 hover:bg-white hover:shadow-2xl border-b-8 border-b-[#4ECDC4] bg-white/50 flex flex-col items-center lg:items-start"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">🎵</div>
          <h2 className={`mb-2 text-xl font-black text-[#475569] uppercase tracking-tighter italic`}>
            {t('music')}
          </h2>
          <p className={`m-0 text-[9px] text-[#64748b] font-medium leading-relaxed`}>
            {t('musicDesc')}
          </p>
        </Link>

        {/* 3. STORIES */}
        <Link
          href="/studio/story"
          className="group rounded-3xl border border-transparent px-4 py-8 transition-all hover:border-gray-200 hover:bg-white hover:shadow-2xl border-b-8 border-b-[#FFE66D] bg-white/50 flex flex-col items-center lg:items-start"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">📖</div>
          <h2 className={`mb-2 text-xl font-black text-[#475569] uppercase tracking-tighter italic`}>
            {t('stories')}
          </h2>
          <p className={`m-0 text-[9px] text-[#64748b] font-medium leading-relaxed`}>
            {t('storiesDesc')}
          </p>
        </Link>

        {/* 4. QURAN */}
        <Link
          href="/studio/quran"
          className="group rounded-3xl border border-transparent px-4 py-8 transition-all hover:border-gray-200 hover:bg-white hover:shadow-2xl border-b-8 border-b-[#A78BFA] bg-white/50 flex flex-col items-center lg:items-start"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">🕋</div>
          <h2 className={`mb-2 text-xl font-black text-[#475569] uppercase tracking-tighter italic`}>
            {t('quran')}
          </h2>
          <p className={`m-0 text-[9px] text-[#64748b] font-medium leading-relaxed`}>
            {t('quranDesc')}
          </p>
        </Link>

        {/* 5. HADITH */}
        <Link
          href="/studio/hadith"
          className="group rounded-3xl border border-transparent px-4 py-8 transition-all hover:border-gray-200 hover:bg-white hover:shadow-2xl border-b-8 border-b-[#6366f1] bg-white/50 flex flex-col items-center lg:items-start"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">✨</div>
          <h2 className={`mb-2 text-xl font-black text-[#475569] uppercase tracking-tighter italic`}>
            {t('hadith')}
          </h2>
          <p className={`m-0 text-[9px] text-[#64748b] font-medium leading-relaxed`}>
            {t('hadithDesc')}
          </p>
        </Link>

        {/* 6. GALLERY */}
        <Link
          href="/gallery"
          className="group rounded-3xl border border-transparent px-4 py-8 transition-all hover:border-gray-200 hover:bg-white hover:shadow-2xl border-b-8 border-b-[#F472B6] bg-white/50 flex flex-col items-center lg:items-start"
        >
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">🖼️</div>
          <h2 className={`mb-2 text-xl font-black text-[#475569] uppercase tracking-tighter italic`}>
            {t('gallery')}
          </h2>
          <p className={`m-0 text-[9px] text-[#64748b] font-medium leading-relaxed`}>
            {t('galleryDesc')}
          </p>
        </Link>
      </div>

      <div className="mt-20 flex flex-col sm:flex-row gap-6 mb-24">
        <Link href="/signup">
           <button className="px-12 py-5 bg-[#FF6B6B] text-white text-lg font-black rounded-3xl shadow-xl hover:scale-105 hover:bg-[#ff5252] transition-all active:scale-95 uppercase tracking-widest">
             {t('startCreating')}
           </button>
        </Link>
        <Link href="/login">
           <button className="px-12 py-5 bg-white text-[#475569] text-lg font-black rounded-3xl shadow-lg border-2 border-gray-100 hover:bg-gray-50 transition-all uppercase tracking-widest">
             {t('welcomeBack')}
           </button>
        </Link>
      </div>
    </main>
  );
}
