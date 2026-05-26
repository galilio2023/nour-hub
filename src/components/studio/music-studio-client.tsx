"use client";

import dynamic from 'next/dynamic';
import { useMusicStore } from '@/lib/store/use-music-store';
import { 
  Play, 
  Pause, 
  Trash2, 
  Save, 
  ArrowLeft,
  X,
  Volume2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToS3 } from '@/lib/upload-utils';

// Dynamically import MusicStudio to avoid SSR issues
const MusicStudio = dynamic(() => import('@/components/studio/music-studio'), { 
  ssr: false,
  loading: () => <div className="w-full h-80 flex items-center justify-center bg-white rounded-3xl shadow-inner">Loading Studio...</div>
});

export default function MusicStudioClient() {
  const { 
    sequence, setSequence, bpm, setBpm, 
    isPlaying, setIsPlaying, 
    clear 
  } = useMusicStore();

  const [mounted, setMounted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSparkLoading, setIsSparkLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => {
        clearTimeout(timer);
        setIsPlaying(false);
    };
  }, [setIsPlaying]);

  const handleSpark = async () => {
    setIsSparkLoading(true);
    try {
        const res = await fetch("/api/sparks?type=music");
        const data = await res.json();
        setSequence(data.sequence);
    } catch (e) {
        console.error("Spark error", e);
    } finally {
        setIsSparkLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title) return;
    setIsSaving(true);

    try {
      const contentUrl = await uploadToS3(
        JSON.stringify(sequence),
        "application/json",
        "json"
      );

      const res = await fetch("/api/creations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type: "music",
          contentUrl,
          thumbnailUrl: null,
        }),
      });

      if (res.ok) {
        router.push("/gallery");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
      setShowSaveModal(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen bg-[#F1F5F9] overflow-hidden">
      <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 md:py-4 bg-white shadow-sm z-10 gap-3">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#475569]" />
            </Link>
            <h1 className="text-lg md:text-2xl font-black text-[#475569] tracking-tight uppercase italic truncate flex items-center gap-2">
              <span className="text-2xl">🌙</span> QAMAR MUSIC
            </h1>
          </div>
          
          <button 
            onClick={clear}
            className="md:hidden p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
            title="Clear Beat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4 overflow-x-auto pb-1 md:pb-0">
          <button 
            onClick={handleSpark}
            disabled={isSparkLoading}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[#4ECDC4] to-[#A78BFA] text-white font-bold rounded-full hover:scale-105 transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0 text-xs md:text-sm`}
          >
            <Sparkles className={`w-4 h-4 md:w-5 md:h-5 ${isSparkLoading ? 'animate-spin' : ''}`} />
            <span>Smart Start</span>
          </button>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 shrink-0 text-xs md:text-sm ${
                isPlaying 
                    ? 'bg-[#4ECDC4] text-white hover:bg-[#45bba0]' 
                    : 'bg-[#FF6B6B] text-white hover:bg-[#ff5252]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 fill-white" /> : <Play className="w-4 h-4 md:w-5 md:h-5 fill-white" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
          
          <button 
            onClick={clear}
            className="hidden md:block p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
            title="Clear Beat"
          >
            <Trash2 className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#A78BFA] text-white font-bold rounded-full hover:bg-[#8b5cf6] transition-colors shadow-md shrink-0 text-xs md:text-sm"
          >
            <Save className="w-4 h-4 md:w-5 md:h-5" />
            <span>Save</span>
          </button>
        </div>
      </header>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-[#475569]">Share Your Beat! 🎵</h2>
                    <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6 text-[#475569]" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] md:text-sm font-bold text-[#64748b] mb-1 uppercase tracking-wider">Title</label>
                        <input 
                            type="text" 
                            placeholder="Name your song!"
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#4ECDC4] outline-none transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] md:text-sm font-bold text-[#64748b] mb-1 uppercase tracking-wider">About your beat</label>
                        <textarea 
                            placeholder="How should people dance to this?"
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#4ECDC4] outline-none transition-colors h-24 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !title}
                        className="w-full py-4 bg-[#4ECDC4] text-white font-black rounded-2xl shadow-lg hover:bg-[#45bba0] transition-all disabled:opacity-50 active:scale-95 uppercase tracking-widest"
                    >
                        {isSaving ? "Saving..." : "Publish! 🚀"}
                    </button>
                </div>
            </div>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-start md:justify-center gap-4 md:gap-8 overflow-y-auto">
        <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-3xl shadow-lg">
            <div className="flex items-center gap-4 flex-1">
                <div className="p-2 md:p-3 bg-[#FFE66D] rounded-xl md:rounded-2xl shrink-0">
                    <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-[#475569]" />
                </div>
                <div>
                    <h2 className="font-bold text-[#475569] text-sm md:text-base">Tempo</h2>
                    <p className="text-[10px] md:text-xs text-[#64748b]">Fast or slow?</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <input 
                    type="range" 
                    min="60" 
                    max="180" 
                    value={bpm} 
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="flex-1 md:w-48 h-1.5 md:h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#FF6B6B]"
                />
                <span className="w-12 md:w-16 text-center font-bold text-base md:text-lg text-[#FF6B6B] shrink-0">{bpm} <span className="text-[8px] md:text-[10px] text-gray-400 block uppercase">BPM</span></span>
            </div>
        </div>

        <MusicStudio />

        <div className="max-w-xl text-center pb-8 md:pb-0">
            <h3 className="text-[#64748b] font-medium leading-relaxed text-xs md:text-sm">
                Click the squares to add sounds! Each row is a different instrument. 
                Press <span className="text-[#FF6B6B] font-bold">Play</span> to hear your masterpiece!
            </h3>
        </div>
      </main>
    </div>
  );
}
