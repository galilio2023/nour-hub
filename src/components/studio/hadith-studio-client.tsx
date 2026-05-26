"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Search, 
  Volume2, 
  CheckCircle, 
  Star,
  RefreshCw,
  BookMarked,
  Sparkles,
  Info,
  BookOpen
} from 'lucide-react';
import { Hadith, Adhkar } from '@/lib/data/hadith';

interface ApiHadith {
    hadithnumber: number;
    text: string;
}

interface ApiDua {
    id: string;
    category: string;
    text: string;
}

export default function HadithStudioClient({ 
    initialAdhkar, 
    initialHadiths,
    curatedAdhkar,
    curatedHadiths
}: { 
    initialAdhkar: ApiDua[], 
    initialHadiths: ApiHadith[],
    curatedAdhkar: Adhkar[],
    curatedHadiths: Hadith[]
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'adeia' | 'hadith'>('adeia');
  const [showCuratedOnly, setShowCuratedOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [masteredItems, setMasteredItems] = useState<string[]>([]);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [visibleCount, setVisibleCount] = useState(12);

  // Sync mastered items
  useEffect(() => {
    const stored = localStorage.getItem('qamar_mastered_huge_library');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            setTimeout(() => setMasteredItems(parsed), 0);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const toggleMastered = (id: string) => {
    const newMastered = masteredItems.includes(id)
      ? masteredItems.filter(i => i !== id)
      : [...masteredItems, id];
    setMasteredItems(newMastered);
    localStorage.setItem('qamar_mastered_huge_library', JSON.stringify(newMastered));
  };

  const filteredAdhkar = useMemo(() => {
    const base = showCuratedOnly ? [] : initialAdhkar;
    const combined = [...curatedAdhkar.map(a => ({ ...a, isCurated: true })), ...base];
    
    if (!searchQuery) return combined;
    return combined.filter(item => 
      ('category' in item && item.category.includes(searchQuery)) ||
      ('title' in item && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.text.includes(searchQuery)
    );
  }, [initialAdhkar, curatedAdhkar, searchQuery, showCuratedOnly]);

  const filteredHadith = useMemo(() => {
    const base = showCuratedOnly ? [] : initialHadiths;
    const combined = [...curatedHadiths.map(h => ({ ...h, isCurated: true })), ...base];

    if (!searchQuery) return combined;
    return combined.filter(item => 
      item.text.includes(searchQuery) ||
      ('topic' in item && item.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ('hadithnumber' in item && item.hadithnumber.toString().includes(searchQuery))
    );
  }, [initialHadiths, curatedHadiths, searchQuery, showCuratedOnly]);

  const readAloud = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      const arabicVoices = voices.filter(v => v.lang.startsWith('ar'));
      
      let selectedVoice = null;
      if (voiceGender === 'female') {
          selectedVoice = arabicVoices.find(v => 
              v.name.toLowerCase().includes('female') || 
              v.name.toLowerCase().includes('zira') || 
              v.name.toLowerCase().includes('muna') ||
              v.name.toLowerCase().includes('hoda') ||
              v.name.toLowerCase().includes('laila') ||
              v.name.toLowerCase().includes('mariam') ||
              v.name.toLowerCase().includes('fatima')
          );
      } else {
          selectedVoice = arabicVoices.find(v => 
              v.name.toLowerCase().includes('male') || 
              v.name.toLowerCase().includes('hassan') || 
              v.name.toLowerCase().includes('naayf') ||
              v.name.toLowerCase().includes('tarik')
          );
      }

      if (selectedVoice || (voiceGender === 'male' && arabicVoices.length > 0)) {
        const finalVoice = selectedVoice || arabicVoices[0];
        utterance.voice = finalVoice;
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = voiceGender === 'female' ? 1.4 : 0.9;
        
        utterance.onerror = () => {
            playCloudFallback(text);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        playCloudFallback(text);
      }
    } else {
      playCloudFallback(text);
    }
  };

  const playCloudFallback = (text: string) => {
    const url = `/api/tts?text=${encodeURIComponent(text)}&gender=${voiceGender}`;
    const audio = new Audio(url);
    
    if (voiceGender === 'female') {
        audio.playbackRate = 1.15;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ea = audio as any;
        if ('preservesPitch' in ea) ea.preservesPitch = false;
        if ('mozPreservesPitch' in ea) ea.mozPreservesPitch = false;
        if ('webkitPreservesPitch' in ea) ea.webkitPreservesPitch = false;
    }
    
    audio.play().catch(e => console.error("Cloud TTS Error:", e));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F3F3F4] selection:bg-[#00F5D4]/30 font-sans antialiased overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-2xl border-b border-white/5 px-4 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all"><ArrowLeft className="w-4 h-4" /></button>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight uppercase italic">المكتبة</h1>
              <p className="text-[#8E8E93] text-[9px] uppercase tracking-widest font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#FF0055]">لغة عربية</p>
            </div>
          </div>
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93]" />
            <input 
              type="text" 
              placeholder="ابحث..."
              dir="rtl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161619] border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-[#00F5D4]/50 transition-all text-xs font-bold"
            />
          </div>

          <div className="flex bg-[#161619] p-1 rounded-xl border border-white/10">
            <button 
                onClick={() => setVoiceGender('female')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${voiceGender === 'female' ? 'bg-[#00F5D4] text-black' : 'text-[#8E8E93] hover:text-white'}`}
                title="Female Voice"
            >
                <span className="text-xs">👩</span>
                <span className="text-[8px] font-black uppercase tracking-widest hidden md:inline">Female</span>
            </button>
            <button 
                onClick={() => setVoiceGender('male')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${voiceGender === 'male' ? 'bg-[#00F5D4] text-black' : 'text-[#8E8E93] hover:text-white'}`}
                title="Male Voice"
            >
                <span className="text-xs">👨</span>
                <span className="text-[8px] font-black uppercase tracking-widest hidden md:inline">Male</span>
            </button>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0F0F11] border border-white/5 flex items-center gap-2">
            <BookMarked className="w-3.5 h-3.5 text-[#FFB703]" />
            <span className="text-[10px] font-black text-white tabular-nums">{masteredItems.length}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* Kid-Friendly Filter Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex gap-2 p-1 bg-[#0F0F11] border border-white/5 rounded-2xl w-fit">
                <button
                    onClick={() => { setActiveTab('adeia'); setVisibleCount(12); }}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all uppercase tracking-wider text-[10px] md:text-xs ${
                    activeTab === 'adeia' ? 'bg-[#00F5D4] text-black' : 'text-[#8E8E93] hover:text-white'
                    }`}
                >
                    الأدعية ({filteredAdhkar.length})
                </button>
                <button
                    onClick={() => { setActiveTab('hadith'); setVisibleCount(12); }}
                    className={`px-6 py-2.5 rounded-xl font-black transition-all uppercase tracking-wider text-[10px] md:text-xs ${
                    activeTab === 'hadith' ? 'bg-[#FF0055] text-white' : 'text-[#8E8E93] hover:text-white'
                    }`}
                >
                    الأحاديث ({filteredHadith.length})
                </button>
            </div>

            <button 
                onClick={() => setShowCuratedOnly(!showCuratedOnly)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 ${
                    showCuratedOnly 
                    ? 'bg-[#00F5D4]/10 border-[#00F5D4]/30 text-[#00F5D4]' 
                    : 'bg-white/5 border-white/10 text-[#8E8E93] hover:text-white'
                }`}
            >
                <Sparkles className={`w-4 h-4 ${showCuratedOnly ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {showCuratedOnly ? 'عرض كل المكتبة' : 'دروس مختارة للأطفال فقط'}
                </span>
            </button>
        </div>

        {/* Hero Section for Curated Content */}
        {showCuratedOnly && (
            <div className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-[#111111] to-[#050505] border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F5D4]/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2 text-[#00F5D4] font-black text-[10px] uppercase tracking-[0.2em]">
                            <Star className="w-3 h-3 fill-current" /> محتوى مختار
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none italic">
                            تعلم مع <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#00A3FF]">نور</span>
                        </h2>
                        <p className="text-[#8E8E93] text-sm md:text-base font-medium max-w-xl">
                            مجموعة مختارة بعناية من الأحاديث والأدعية السهلة والمبسطة لتساعدك في رحلتك اليومية لتكون مسلماً أفضل.
                        </p>
                    </div>
                    <div className="w-48 h-48 relative animate-float">
                         <div className="absolute inset-0 bg-gradient-to-tr from-[#00F5D4] to-transparent opacity-20 blur-2xl rounded-full" />
                         <Image 
                            src="/api/proxy-image?url=https%3A%2F%2Fgen.pollinations.ai%2Fimage%2Fa%2520cute%2520little%2520star%2520character%2520with%2520a%2520friendly%2520smile%2C%2520holding%2520a%2520glowing%2520book%2C%25203d%2520render%2520style%2C%2520soft%2520colors%3Fwidth%3D512%26height%3D512%26seed%3D2024"
                            alt="Noor Character"
                            width={192}
                            height={192}
                            unoptimized
                            className="relative z-10 object-contain"
                         />
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {activeTab === 'adeia' ? (
            filteredAdhkar.slice(0, visibleCount).map((item) => (
              <DuaCard 
                key={item.id}
                item={item}
                isMastered={masteredItems.includes(`huge-${item.id}`)}
                onToggleMaster={() => toggleMastered(`huge-${item.id}`)}
                onReadAloud={readAloud}
              />
            ))
          ) : (
            filteredHadith.slice(0, visibleCount).map((item) => (
              <HadithCard 
                key={'hadithnumber' in item ? item.hadithnumber : item.id}
                item={item}
                isMastered={masteredItems.includes(`huge-hadith-${'hadithnumber' in item ? item.hadithnumber : item.id}`)}
                onToggleMaster={() => toggleMastered(`huge-hadith-${'hadithnumber' in item ? item.hadithnumber : item.id}`)}
                onReadAloud={readAloud}
              />
            ))
          )}
        </div>

        {((activeTab === 'adeia' ? filteredAdhkar.length : filteredHadith.length) > visibleCount) && (
            <div className="flex justify-center pt-4">
                <button 
                    onClick={() => setVisibleCount(prev => prev + 24)}
                    className="px-8 py-3 bg-[#0F0F11] border border-white/10 rounded-xl text-[#00F5D4] font-black uppercase tracking-widest text-[10px] hover:bg-[#00F5D4] hover:text-black transition-all active:scale-95 flex items-center gap-3"
                >
                    <RefreshCw className="w-3 h-3" /> تحميل المزيد
                </button>
            </div>
        )}
      </main>
    </div>
  );
}

function DuaCard({ item, isMastered, onToggleMaster, onReadAloud }: { item: any, isMastered: boolean, onToggleMaster: () => void, onReadAloud: (text: string) => void }) {
    const isCurated = !!item.isCurated;
    
    return (
        <div className={`group relative rounded-[2.5rem] bg-[#0F0F11] border transition-all duration-500 overflow-hidden flex flex-col ${
            isMastered ? 'border-[#00F5D4]/30 bg-[#00F5D4]/5' : 'border-white/5 hover:border-white/10'
        }`}>
            {isCurated && item.image && (
                <div className="relative h-40 w-full overflow-hidden">
                    <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F11] via-transparent to-black/20" />
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[8px] font-black text-[#00F5D4] uppercase tracking-widest">
                            {item.title}
                        </span>
                    </div>
                </div>
            )}
            
            <div className="p-6 flex-1 flex flex-col">
                {!isCurated && (
                     <div className="mb-4 text-[8px] font-black text-[#8E8E93] uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full w-fit">
                        {item.category}
                    </div>
                )}
                
                <p className="text-right text-base md:text-lg font-bold leading-relaxed mb-4" dir="rtl">
                    {item.textAr || item.text}
                </p>
                
                {isCurated && (
                    <div className="mt-auto space-y-3">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 text-[#8E8E93] text-[9px] font-black uppercase tracking-widest mb-1">
                                <Info className="w-3 h-3" /> متى يقال؟
                            </div>
                            <p className="text-[11px] text-[#F3F3F4] font-medium leading-tight">
                                {item.whenToSay}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-white/5">
                    <div className="flex gap-2">
                        <button onClick={() => onReadAloud(item.textAr || item.text)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#00F5D4] transition-all active:scale-90"><Volume2 className="w-4 h-4" /></button>
                        <button onClick={onToggleMaster} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isMastered ? 'bg-[#00F5D4] text-black shadow-[0_0_20px_rgba(0,245,212,0.3)]' : 'bg-white/5 text-[#8E8E93] hover:text-white'}`}><CheckCircle className="w-4 h-4" /></button>
                    </div>
                    {isMastered && <Star className="w-4 h-4 text-[#FFB703] fill-[#FFB703] animate-bounce" />}
                </div>
            </div>
        </div>
    );
}

function HadithCard({ item, isMastered, onToggleMaster, onReadAloud }: { item: any, isMastered: boolean, onToggleMaster: () => void, onReadAloud: (text: string) => void }) {
    const isCurated = !!item.isCurated;

    return (
        <div className={`group relative rounded-[2.5rem] bg-[#0F0F11] border transition-all duration-500 overflow-hidden flex flex-col ${
            isMastered ? 'border-[#FF0055]/30 bg-[#FF0055]/5' : 'border-white/5 hover:border-white/10'
        }`}>
            {isCurated && item.image && (
                <div className="relative h-40 w-full overflow-hidden">
                    <Image 
                        src={item.image} 
                        alt={item.topic} 
                        fill 
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F11] via-transparent to-black/20" />
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[8px] font-black text-[#FF0055] uppercase tracking-widest">
                            {item.topic}
                        </span>
                    </div>
                </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    {!item.image && (
                         <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-[#FF0055] uppercase tracking-widest">
                            {isCurated ? item.topic : `حديث ${item.hadithnumber}`}
                        </div>
                    )}
                    {isCurated && (
                        <div className="p-2 rounded-xl bg-[#FF0055]/10 text-[#FF0055] ml-auto">
                            <BookOpen className="w-3 h-3" />
                        </div>
                    )}
                </div>
                
                <p className="text-right text-base md:text-lg font-bold leading-relaxed mb-6" dir="rtl">
                    {item.textAr || item.text}
                </p>
                
                {isCurated && (
                    <div className="mt-auto space-y-4">
                        <div className="space-y-2">
                             <h4 className="text-[10px] font-black text-[#FF0055] uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> الفائدة
                             </h4>
                             <p className="text-xs text-[#8E8E93] leading-relaxed font-medium">
                                {item.explanation}
                             </p>
                        </div>
                        <div className="p-4 rounded-[1.5rem] bg-[#FF0055]/5 border border-[#FF0055]/10">
                             <p className="text-[11px] text-[#F3F3F4] font-bold leading-tight italic">
                                "{item.lesson}"
                             </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-white/5">
                    <div className="flex gap-2">
                        <button onClick={() => onReadAloud(item.textAr || item.text)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#FF0055] transition-all active:scale-90"><Volume2 className="w-4 h-4" /></button>
                        <button onClick={onToggleMaster} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isMastered ? 'bg-[#FF0055] text-white shadow-[0_0_20px_rgba(255,0,85,0.3)]' : 'bg-white/5 text-[#8E8E93] hover:text-white'}`}><CheckCircle className="w-4 h-4" /></button>
                    </div>
                    {isMastered && <Star className="w-4 h-4 text-[#FFB703] fill-[#FFB703] animate-pulse" />}
                </div>
            </div>
        </div>
    );
}
