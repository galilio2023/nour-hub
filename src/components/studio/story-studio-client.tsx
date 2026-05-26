"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Volume2, X, Save, ExternalLink, AlertCircle, Map as MapIcon, PenLine } from 'lucide-react';
import { useRouter } from "next/navigation";
import { ProphetMap } from '@/components/studio/prophet-map';
import { Story } from '@/lib/data/stories';

interface StoryVerse {
    id: number;
    verse_key: string;
    text_uthmani: string;
    translations: { text: string }[];
}

export default function StoryStudioClient({ stories }: { stories: Story[] }) {
    const [view, setView] = useState<'library' | 'studio' | 'builder'>('library');
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [completedStories, setCompletedStories] = useState<string[]>([]);
    const [liveVerse, setLiveVerse] = useState<StoryVerse | null>(null);
    const [isVerseLoading, setIsVerseLoading] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const [customContent, setCustomContent] = useState("");
    const [isReading, setIsReading] = useState(false);
    const [audioStatus, setAudioStatus] = useState<string>("");
    const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
    
    const router = useRouter();

    // Load progress from local storage
    useEffect(() => {
        const stored = localStorage.getItem('qamar_completed_stories');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setTimeout(() => setCompletedStories(parsed), 0);
                }
            } catch (e) { console.error(e); }
        }
    }, []);

    // Fetch Quran Verse when story is selected
    useEffect(() => {
        if (selectedStory?.reference && selectedStory.reference.key.includes(':')) {
            const timer = setTimeout(() => {
                setIsVerseLoading(true);
                setLiveVerse(null);
            }, 0);

            fetch(`https://api.quran.com/api/v4/verses/by_key/${selectedStory.reference.key}?translations=131&fields=text_uthmani`)
                .then(res => res.json())
                .then(data => {
                    setLiveVerse(data.verse);
                    setIsVerseLoading(false);
                })
                .catch(err => {
                    console.error("Quran API Error:", err);
                    setIsVerseLoading(false);
                });
            return () => clearTimeout(timer);
        }
    }, [selectedStory]);

    const markAsCompleted = (id: string) => {
        if (!completedStories.includes(id)) {
            const newList = [...completedStories, id];
            setCompletedStories(newList);
            localStorage.setItem('qamar_completed_stories', JSON.stringify(newList));
            setAudioStatus("Success! +50 XP Earned! ✨");
            setTimeout(() => setAudioStatus(""), 3000);
        }
    };

    const playNativeAudio = (url: string) => {
        const windowAny = window as unknown as { currentAudio?: HTMLAudioElement };
        if (windowAny.currentAudio) {
            windowAny.currentAudio.pause();
        }
        
        setIsReading(true);
        setAudioStatus(`Playing (${voiceGender === 'female' ? 'High Pitch' : 'Original'})...`);
        const audio = new Audio(url);

        if (voiceGender === 'female') {
            audio.playbackRate = 1.15;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ea = audio as any;
            if ('preservesPitch' in ea) ea.preservesPitch = false;
            if ('mozPreservesPitch' in ea) ea.mozPreservesPitch = false;
            if ('webkitPreservesPitch' in ea) ea.webkitPreservesPitch = false;
        }
        
        audio.play().catch(e => {
            console.error("Native Audio Error:", e);
            setAudioStatus("Audio Blocked! Click again.");
            setIsReading(false);
        });

        audio.onended = () => {
            setIsReading(false);
            setAudioStatus("");
            if (selectedStory) markAsCompleted(selectedStory.id);
        };
        
        windowAny.currentAudio = audio;
    };

    const handleReadAloud = (text: string) => {
        if (!window.speechSynthesis) {
            setAudioStatus("Browser does not support audio.");
            return;
        }
        
        window.speechSynthesis.cancel();
        
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
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = finalVoice;
            utterance.rate = 0.85;
            utterance.pitch = voiceGender === 'female' ? 1.4 : 0.9;
            
            utterance.onstart = () => {
                setIsReading(true);
                setAudioStatus(`Reading (${voiceGender})...`);
            };
            utterance.onend = () => {
                setIsReading(false);
                setAudioStatus("");
                if (selectedStory) markAsCompleted(selectedStory.id);
            };
            utterance.onerror = (e) => {
                console.error("Speech Error:", e);
                playFallbackAudio(text);
            };
            
            // PREVENT GARBAGE COLLECTION CUT-OFF
            // This is a critical fix for long texts in many browsers
            (window as any).currentUtterance = utterance;

            window.speechSynthesis.speak(utterance);

            // CHROME BUG FIX: Resume speech every 10s to prevent silence
            const resumeInfinite = setInterval(() => {
                if (!(window as any).speechSynthesis.speaking) {
                    clearInterval(resumeInfinite);
                } else {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000);
        } else {
            setAudioStatus(`Using Cloud ${voiceGender} Voice...`);
            playFallbackAudio(text);
        }
    };

    const playFallbackAudio = (text: string) => {
        setIsReading(true);
        setAudioStatus(`Using Cloud ${voiceGender} Voice...`);

        // Split text into chunks of ~200 chars for Google TTS limit
        // We try to split by sentences or punctuation
        const chunks = text.match(/[^.!?،]+[.!?،]?/g) || [text];
        let currentChunkIndex = 0;

        const playNextChunk = () => {
            if (currentChunkIndex >= chunks.length) {
                setIsReading(false);
                setAudioStatus("");
                if (selectedStory) markAsCompleted(selectedStory.id);
                return;
            }

            const chunk = chunks[currentChunkIndex].trim();
            if (!chunk) {
                currentChunkIndex++;
                playNextChunk();
                return;
            }

            const url = `/api/tts?text=${encodeURIComponent(chunk)}&gender=${voiceGender}`;
            const audio = new Audio(url);
            
            if (voiceGender === 'female') {
                audio.playbackRate = 1.15;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ea = audio as any;
                if ('preservesPitch' in ea) {
                    ea.preservesPitch = false;
                } else if ('mozPreservesPitch' in ea) {
                    ea.mozPreservesPitch = false;
                } else if ('webkitPreservesPitch' in ea) {
                    ea.webkitPreservesPitch = false;
                }
            }
            
            audio.play().catch(e => {
                console.error("Fallback Audio Error:", e);
                setAudioStatus("Sound Blocked! Click button again.");
                setIsReading(false);
            });

            audio.onended = () => {
                currentChunkIndex++;
                playNextChunk();
            };
            
            const windowAny = window as unknown as { currentAudio?: HTMLAudioElement };
            windowAny.currentAudio = audio;
        };

        playNextChunk();
    };

    const stopReading = () => {
        window.speechSynthesis.cancel();
        const windowAny = window as unknown as { currentAudio?: HTMLAudioElement };
        if (windowAny.currentAudio) {
            windowAny.currentAudio.pause();
            windowAny.currentAudio.currentTime = 0;
        }
        setIsReading(false);
        setAudioStatus("");
    };

    const handleSave = async () => {
        if (!customTitle || !customContent) return;
        
        try {
            const res = await fetch("/api/creations", {
                method: "POST",
                body: JSON.stringify({
                    title: customTitle,
                    description: "A magical Islamic story created in the studio.",
                    type: "story",
                    contentUrl: customContent,
                    thumbnailUrl: null,
                }),
            });

            if (res.ok) {
                router.push("/gallery");
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFBEB] flex flex-col font-sans antialiased">
            <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white shadow-sm border-b-4 border-[#FFE66D] z-10 gap-4">
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-[#475569]" />
                        </Link>
                        <h1 className="text-xl md:text-2xl font-black text-[#475569] uppercase tracking-tighter italic">TALES OF LIGHT</h1>
                    </div>
                </div>

                <div className="flex bg-[#F1F5F9] p-1 rounded-2xl border border-gray-100 shadow-inner w-full md:w-auto">
                    <button 
                        onClick={() => setView('library')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black transition-all text-[10px] md:text-xs uppercase tracking-widest ${view === 'library' ? 'bg-white text-[#475569] shadow-sm' : 'text-[#94a3b8] hover:text-[#475569]'}`}
                    >
                        <MapIcon className="w-4 h-4" />
                        <span>Prophet Path</span>
                    </button>
                    <button 
                        onClick={() => setView('builder')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black transition-all text-[10px] md:text-xs uppercase tracking-widest ${view === 'builder' ? 'bg-white text-[#475569] shadow-sm' : 'text-[#94a3b8] hover:text-[#475569]'}`}
                    >
                        <PenLine className="w-4 h-4" />
                        <span>Story Builder</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7]">
                {view === 'library' ? (
                    <ProphetMap 
                        stories={stories} 
                        completedIds={completedStories} 
                        onSelectStory={(s) => setSelectedStory(s as Story)} 
                    />
                ) : (
                    <div className="max-w-4xl mx-auto py-12 px-4">
                        <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col border-b-[12px] md:border-b-[16px] border-[#A78BFA] ring-4 md:ring-8 ring-white/50">
                            <div className="bg-[#A78BFA] p-6 md:p-10 text-white relative">
                                <div className="absolute top-6 right-6 md:top-10 md:right-10 opacity-20"><PenLine className="w-16 h-16 md:w-24 md:h-24" /></div>
                                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic mb-1 md:mb-2 relative z-10">Story Builder</h2>
                                <p className="text-white/80 font-bold uppercase tracking-widest text-[8px] md:text-[10px] relative z-10">Write your own magical Islamic adventure</p>
                            </div>
                            <div className="p-6 md:p-12 space-y-6 md:space-y-10 flex-1 bg-gray-50/30">
                                <div className="space-y-2 md:space-y-3">
                                    <label className="block text-[8px] md:text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.3em] ml-2 md:ml-4">Masterpiece Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter Title..."
                                        className="w-full px-6 md:px-10 py-4 md:py-6 bg-white border-4 border-transparent rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm focus:border-[#A78BFA] outline-none transition-all font-black text-[#475569] text-xl md:text-2xl placeholder:text-gray-200"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 md:space-y-3 relative">
                                    <label className="block text-[8px] md:text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.3em] ml-2 md:ml-4">Arabic Text (Story)</label>
                                    <textarea 
                                        placeholder="اكتب قصتك الرائعة هنا..."
                                        dir="rtl"
                                        className="w-full px-6 md:px-10 py-6 md:py-10 bg-white border-4 border-transparent rounded-[2rem] md:rounded-[3rem] shadow-sm focus:border-[#A78BFA] outline-none transition-all h-64 md:h-80 resize-none font-amiri text-2xl md:text-3xl leading-[2] text-[#475569] placeholder:text-gray-100"
                                        value={customContent}
                                        onChange={(e) => setCustomContent(e.target.value)}
                                    />
                                    {customContent && (
                                        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col items-center gap-2 md:gap-3">
                                            {audioStatus && <span className="text-[8px] md:text-[10px] font-black text-[#475569] uppercase tracking-tighter bg-white px-2 py-1 rounded-full shadow-sm animate-bounce">{audioStatus}</span>}
                                            
                                            <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg border border-[#A78BFA]/20 mb-1">
                                                <button 
                                                    onClick={() => setVoiceGender('female')}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${voiceGender === 'female' ? 'bg-[#A78BFA] text-white' : 'text-[#A78BFA] hover:bg-gray-100'}`}
                                                    title="Female Voice"
                                                >
                                                    <span className="text-xs font-bold">👩</span>
                                                </button>
                                                <button 
                                                    onClick={() => setVoiceGender('male')}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${voiceGender === 'male' ? 'bg-[#A78BFA] text-white' : 'text-[#A78BFA] hover:bg-gray-100'}`}
                                                    title="Male Voice"
                                                >
                                                    <span className="text-xs font-bold">👨</span>
                                                </button>
                                            </div>

                                            <button 
                                                onClick={() => isReading ? stopReading() : handleReadAloud(customContent)}
                                                className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl transition-all active:scale-90 flex items-center justify-center ${isReading ? 'bg-[#FF6B6B] text-white animate-pulse scale-110' : 'bg-[#FFE66D] text-[#475569] hover:scale-110'}`}
                                            >
                                                <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-2 md:pt-4">
                                    <button 
                                        onClick={handleSave}
                                        className="flex-1 py-4 md:py-6 bg-[#4ECDC4] text-white font-black rounded-[1.5rem] md:rounded-[2rem] shadow-xl hover:bg-[#45bba0] transition-all active:scale-95 text-base md:text-lg uppercase tracking-widest flex items-center justify-center gap-3 md:gap-4 border-b-4 md:border-b-8 border-[#34b58b]"
                                    >
                                        <Save className="w-5 h-5 md:w-6 md:h-6" />
                                        Publish Story
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Story Reader Modal */}
            {selectedStory && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-50 flex items-center justify-center p-2 md:p-4">
                    <div className="bg-white rounded-[2rem] md:rounded-[4rem] max-w-6xl w-full h-[95vh] md:h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)] border-t-[8px] md:border-t-[12px] border-[#FFE66D] animate-in fade-in zoom-in duration-500">
                        <div className="h-[30vh] md:h-auto md:flex-1 bg-gray-50 relative p-4 md:p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                            <div className="relative group w-full h-full max-w-md md:max-w-none mx-auto">
                                <Image src={selectedStory.image} alt={selectedStory.title} fill unoptimized className="object-cover rounded-[1.5rem] md:rounded-[3rem] shadow-2xl" />
                            </div>
                            <button onClick={() => { stopReading(); setSelectedStory(null); }} className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur rounded-full shadow-2xl md:hidden active:scale-90 transition-transform z-20"><X className="w-5 h-5 text-[#475569]" /></button>
                        </div>

                        <div className="flex-1 w-full md:w-[500px] p-6 md:p-14 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-6 md:mb-10">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-2xl md:text-4xl font-black text-[#475569] tracking-tighter leading-tight mb-2 md:mb-4 uppercase italic truncate">{selectedStory.title}</h2>
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="h-0.5 md:h-1 w-4 md:w-8 bg-[#A78BFA] rounded-full" />
                                        <p className="text-lg md:text-2xl font-black text-[#A78BFA] font-amiri truncate" dir="rtl">{selectedStory.titleAr}</p>
                                    </div>
                                </div>
                                <button onClick={() => { stopReading(); setSelectedStory(null); }} className="hidden md:block p-3 md:p-4 hover:bg-gray-50 rounded-full transition-all hover:rotate-90 active:scale-75"><X className="w-6 md:w-7 md:h-7 text-[#475569]" /></button>
                            </div>

                            <div className="flex-1 space-y-8 md:space-y-12">
                                <div className="space-y-4 md:space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] md:text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.4em]">Arabic Original</span>
                                        {audioStatus && <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[9px] font-black text-[#FF6B6B] uppercase tracking-tighter animate-pulse"><AlertCircle className="w-3 h-3" />{audioStatus}</div>}
                                    </div>
                                    <p className="text-2xl md:text-3xl leading-[1.8] md:leading-[2] font-amiri text-[#475569] font-bold whitespace-pre-wrap" dir="rtl">{selectedStory.contentAr}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-center">
                                        <div className="flex bg-gray-100 p-1 rounded-full shadow-inner border border-gray-200">
                                            <button 
                                                onClick={() => setVoiceGender('female')}
                                                className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all ${voiceGender === 'female' ? 'bg-white text-[#475569] shadow-sm' : 'text-[#94a3b8] hover:text-[#475569]'}`}
                                            >
                                                <span className="text-sm">👩</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Female</span>
                                            </button>
                                            <button 
                                                onClick={() => setVoiceGender('male')}
                                                className={`px-4 py-1.5 rounded-full flex items-center gap-2 transition-all ${voiceGender === 'male' ? 'bg-white text-[#475569] shadow-sm' : 'text-[#94a3b8] hover:text-[#475569]'}`}
                                            >
                                                <span className="text-sm">👨</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Male</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (isReading) {
                                                stopReading();
                                            } else {
                                                if (voiceGender === 'female' || !selectedStory.nativeAudioUrl) {
                                                    handleReadAloud(selectedStory.contentAr);
                                                } else {
                                                    playNativeAudio(selectedStory.nativeAudioUrl);
                                                }
                                            }
                                        }}
                                        className={`w-full py-5 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-5 text-lg md:text-2xl group relative overflow-hidden ${isReading ? 'bg-gradient-to-r from-[#FF6B6B] to-[#ff5252] animate-pulse' : 'bg-[#FFE66D] text-[#475569] hover:shadow-[0_20px_50px_rgba(255,230,109,0.3)]'}`}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Volume2 className={`w-8 h-8 md:w-10 md:h-10 ${isReading ? 'animate-bounce' : 'group-hover:scale-125 transition-transform'}`} />
                                        <span className="relative z-10 uppercase tracking-tighter">{isReading ? "Reading..." : "Play Arabic Audio"}</span>
                                    </button>
                                </div>

                                <div className="space-y-4 md:space-y-6 pt-8 md:pt-10 border-t border-gray-100">
                                    <span className="text-[8px] md:text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.4em]">Full Translation</span>
                                    <p className="text-sm md:text-lg text-[#64748b] leading-relaxed italic font-medium bg-gray-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 whitespace-pre-wrap">{selectedStory.content}</p>
                                </div>

                                {selectedStory.reference && (
                                    <div className="pt-8 md:pt-10 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-4 md:mb-6">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#4ECDC4] rounded-full animate-pulse" />
                                            <span className="text-[8px] md:text-[10px] font-black text-[#4ECDC4] uppercase tracking-[0.4em]">Live Quranic Source</span>
                                        </div>
                                        
                                        {isVerseLoading ? (
                                            <div className="bg-[#F8FAFC] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] animate-pulse flex flex-col gap-3 md:gap-4">
                                                <div className="h-3 md:h-4 bg-gray-200 rounded-full w-3/4 self-end" />
                                                <div className="h-3 md:h-4 bg-gray-200 rounded-full w-full" />
                                            </div>
                                        ) : liveVerse ? (
                                            <div className="bg-gradient-to-br from-[#F0FDFA] to-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 border-[#4ECDC4]/20 shadow-sm">
                                                <p className="text-xl md:text-2xl leading-[1.8] md:leading-[2] font-amiri text-[#134E4A] mb-4 md:mb-6 text-right" dir="rtl">
                                                    {liveVerse.text_uthmani}
                                                </p>
                                                <p className="text-xs text-[#0F766E] leading-relaxed font-medium italic">
                                                    &quot;{liveVerse.translations?.[0]?.text.replace(/<\/?[^>]+(>|$)/g, "")}&quot;
                                                </p>
                                                <div className="mt-4 md:mt-6 flex justify-between items-center">
                                                    <span className="text-[8px] md:text-[9px] font-black text-[#4ECDC4] uppercase tracking-widest">{selectedStory.reference.label}</span>
                                                    <a 
                                                        href={`https://quran.com/${selectedStory.reference.key.includes(':') ? selectedStory.reference.key : '1'}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[8px] md:text-[9px] font-black text-[#94a3b8] hover:text-[#4ECDC4] transition-colors uppercase tracking-widest flex items-center gap-1"
                                                    >
                                                        Read on Quran.com <ExternalLink className="w-2 h-2" />
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                                                <p className="text-[8px] md:text-[10px] text-gray-400 italic">Reference: {selectedStory.reference.label}</p>
                                                <a 
                                                    href={`https://quran.com/${selectedStory.reference.key.includes(':') ? selectedStory.reference.key : '1'}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[8px] md:text-[9px] font-black text-[#94a3b8] hover:text-[#4ECDC4] transition-colors uppercase tracking-widest flex items-center gap-1"
                                                >
                                                    Read on Quran.com <ExternalLink className="w-2 h-2" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
