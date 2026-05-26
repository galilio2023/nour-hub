"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Play, Pause, X, BookOpen, Sparkles } from 'lucide-react';

interface Word {
    id: number;
    position: number;
    text_uthmani: string;
    translation?: { text: string };
}

interface Verse {
    id: number;
    verse_key: string;
    verse_number: number;
    words: Word[];
    translations: { text: string }[];
}

interface AudioFile {
    verse_key: string;
    url: string;
    segments: number[][]; // [index, word_pos, start, end]
}

interface Chapter {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export default function QuranStudioClient({ initialChapters }: { initialChapters: Chapter[] }) {
    const [search, setSearch] = useState("");
    const [selectedSurah, setSelectedSurah] = useState<Chapter | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [verses, setVerses] = useState<Verse[]>([]);
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [currentWordPosition, setCurrentWordPosition] = useState(-1);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    // Load Surah Content (Words + Audio Segments)
    useEffect(() => {
        if (selectedSurah) {
            const timer = setTimeout(() => {
                setIsLoadingData(true);
                setIsPlaying(false);
                setCurrentVerseIndex(0);
                setCurrentWordPosition(-1);
            }, 0);
            
            if (audioRef.current) audioRef.current.pause();

            const loadData = async () => {
                try {
                    // Fetch words and translations
                    const vRes = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${selectedSurah.id}?words=true&translations=131&word_fields=text_uthmani&per_page=300`);
                    const vData = await vRes.json();
                    
                    // Fetch audio segments
                    const aRes = await fetch(`https://api.quran.com/api/v4/recitations/7/by_chapter/${selectedSurah.id}?fields=segments&per_page=300`);
                    const aData = await aRes.json();

                    setVerses(vData.verses);
                    setAudioFiles(aData.audio_files);
                    setIsLoadingData(false);
                } catch (err) {
                    console.error("Failed to load Surah data", err);
                    setIsLoadingData(false);
                }
            };
            loadData();
            return () => clearTimeout(timer);
        }
    }, [selectedSurah]);

    const playVerse = (index: number) => {
        if (!audioFiles[index]) {
            console.warn(`No audio found for verse index ${index}`);
            setIsPlaying(false);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
            let directUrl = audioFiles[index].url;
            if (!directUrl.startsWith('http')) {
                if (directUrl.startsWith('//')) {
                    directUrl = `https:${directUrl}`;
                } else {
                    directUrl = `https://verses.quran.com/${directUrl}`;
                }
            }
            audioRef.current.src = `/api/proxy-audio?url=${encodeURIComponent(directUrl)}`;
            audioRef.current.load();
            
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Playback failed", e);
                    setIsPlaying(false);
                });
            }
            
            setIsPlaying(true);
            setCurrentVerseIndex(index);

            const element = document.getElementById(`verse-${index}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    useEffect(() => {
        if (isPlaying) {
            progressInterval.current = setInterval(() => {
                if (!audioRef.current || !audioFiles[currentVerseIndex]) return;
                
                const currentTimeMs = (audioRef.current.currentTime * 1000) + 50;
                const segments = audioFiles[currentVerseIndex].segments;
                
                const activeSegment = segments.find(seg => 
                    currentTimeMs >= seg[2] && currentTimeMs <= seg[3]
                );

                if (activeSegment) {
                    setCurrentWordPosition(activeSegment[1]);
                }
            }, 30);
        } else {
            if (progressInterval.current) clearInterval(progressInterval.current);
        }
        return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
    }, [isPlaying, currentVerseIndex, audioFiles]);

    const handleAudioEnded = () => {
        if (currentVerseIndex < audioFiles.length - 1) {
            setTimeout(() => {
                playVerse(currentVerseIndex + 1);
            }, 300);
        } else {
            setIsPlaying(false);
            setCurrentWordPosition(-1);
        }
    };

    const toggleMainPlay = () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            playVerse(currentVerseIndex);
        }
    };

    const filteredChapters = initialChapters.filter((c) => 
        c.name_simple.toLowerCase().includes(search.toLowerCase()) || 
        c.translated_name.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
            <audio ref={audioRef} onEnded={handleAudioEnded} />
            
            <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b-4 border-[#A78BFA] z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-[#475569]" />
                    </Link>
                    <h1 className="text-xl md:text-2xl font-black text-[#475569] uppercase tracking-tighter italic">QURAN EXPLORER</h1>
                </div>

                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search Surah..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#A78BFA] outline-none transition-all font-bold text-[#475569]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="w-10 h-10 rounded-full bg-[#A78BFA] flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredChapters.map((surah) => (
                            <div 
                                key={surah.id} 
                                className="bg-white p-6 rounded-[2rem] shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-[#A78BFA] cursor-pointer group flex flex-col active:scale-95"
                                onClick={() => setSelectedSurah(surah)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-[#A78BFA] group-hover:bg-[#A78BFA] group-hover:text-white transition-colors">
                                        {surah.id}
                                    </div>
                                    <span className="font-amiri text-xl font-bold text-[#475569]">{surah.name_arabic}</span>
                                </div>
                                <h2 className="text-lg font-black text-[#475569] group-hover:text-[#A78BFA] transition-colors">{surah.name_simple}</h2>
                                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mt-1">{surah.translated_name.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {selectedSurah && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-50 flex items-center justify-center p-2 md:p-4">
                    <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] max-w-5xl w-full h-[95vh] md:h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300 border-t-[8px] md:border-t-[12px] border-[#A78BFA]">
                        <div className="px-6 md:px-10 py-4 md:py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3 md:gap-6">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#A78BFA] rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center shadow-lg shrink-0">
                                    <Play className={`w-6 h-6 md:w-8 md:h-8 text-white fill-white transition-transform ${isPlaying ? 'scale-0' : 'scale-100'}`} />
                                    <Pause className={`w-6 h-6 md:w-8 md:h-8 text-white fill-white absolute transition-transform ${isPlaying ? 'scale-100' : 'scale-0'}`} />
                                </div>
                                <h2 className="text-xl md:text-3xl font-black text-[#475569] uppercase tracking-tighter italic leading-none truncate flex items-center gap-3">
                                    QURAN
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <button 
                                    onClick={toggleMainPlay}
                                    className={`px-4 md:px-10 py-3 md:py-5 rounded-full font-black text-white shadow-xl transition-all active:scale-95 flex items-center gap-2 md:gap-3 uppercase tracking-widest text-[10px] md:text-sm ${isPlaying ? 'bg-[#FF6B6B] hover:bg-[#ff5252]' : 'bg-[#A78BFA] hover:bg-[#8b5cf6]'}`}
                                >
                                    {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 fill-white" /> : <Play className="w-4 h-4 md:w-5 md:h-5 fill-white" />}
                                    <span className="hidden sm:inline">{isPlaying ? "Stop" : "Listen & Follow"}</span>
                                    <span className="sm:hidden">{isPlaying ? "Stop" : "Play"}</span>
                                </button>
                                <button onClick={() => setSelectedSurah(null)} className="p-2 md:p-4 hover:bg-gray-100 rounded-full shrink-0"><X className="w-6 h-6 md:w-7 md:h-7 text-[#475569]" /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-16 custom-scrollbar bg-white">
                            {isLoadingData ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-4">
                                    <Sparkles className="w-10 h-10 text-[#A78BFA] animate-spin" />
                                    <p className="font-black text-[#94a3b8] uppercase tracking-widest text-xs animate-pulse">Syncing Masterpiece...</p>
                                </div>
                            ) : (
                                <>
                                    {selectedSurah.id !== 1 && selectedSurah.id !== 9 && (
                                        <div className="text-center py-4 md:py-8">
                                            <p className="text-2xl md:text-4xl font-amiri font-bold text-[#475569]">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
                                        </div>
                                    )}

                                    {verses.map((verse, idx) => (
                                        <div 
                                            key={verse.id} 
                                            id={`verse-${idx}`}
                                            className={`p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 border-2 ${currentVerseIndex === idx ? 'bg-[#F0FDFA] border-[#4ECDC4] shadow-lg' : 'bg-white border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <div className="flex flex-col gap-6 md:gap-10">
                                                <div className="flex flex-wrap flex-row-reverse gap-x-3 md:gap-x-4 gap-y-6 md:gap-y-8 leading-[2.5] md:leading-[3.5] justify-start">
                                                    {verse.words.map((word) => (
                                                        <span 
                                                            key={word.id} 
                                                            className={`font-amiri text-3xl md:text-5xl font-bold transition-all duration-300 px-1 rounded-xl ${currentVerseIndex === idx && currentWordPosition === word.position ? 'bg-[#FFE66D] text-[#475569] scale-110 md:scale-125 shadow-sm' : 'text-[#475569]'}`}
                                                        >
                                                            {word.text_uthmani}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="pl-4 border-l-4 border-[#A78BFA]/20">
                                                    <p className="text-base md:text-xl text-[#64748b] font-medium leading-relaxed italic">
                                                        {verse.translations?.[0]?.text.replace(/<\/?[^>]+(>|$)/g, "")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
