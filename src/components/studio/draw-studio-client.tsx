"use client";

import dynamic from 'next/dynamic';
import { useDrawingStore } from '@/lib/store/use-drawing-store';
import { 
  Pencil, 
  Eraser, 
  Undo2, 
  Redo2, 
  Trash2, 
  Save, 
  ArrowLeft,
  Square,
  Circle as CircleIcon,
  X,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  ImageOff,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToS3 } from '@/lib/upload-utils';
import { useTranslations } from 'next-intl';

import { DRAWING_LESSONS } from '@/lib/data/drawing-lessons';
import { Tool } from '@/types/studio';

// Dynamically import Konva components to avoid SSR issues
const DrawingCanvas = dynamic(() => import('@/components/studio/drawing-canvas'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl shadow-inner font-black text-gray-200">LOADING CANVAS...</div>
});

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#A78BFA', // Purple
  '#34D399', // Green
  '#3B82F6', // Blue
  '#F472B6', // Pink
  '#000000', // Black
];

const STROKE_WIDTHS = [2, 5, 10, 20];

export default function DrawingStudioClient({ remixId }: { remixId?: string | null }) {
  const t = useTranslations('Studio');
  const tc = useTranslations('Common');

  const { 
    lines, addLine,
    tool, setTool, 
    color, setColor, 
    strokeWidth, setStrokeWidth,
    undo, redo, clear 
  } = useDrawingStore();

  const [mounted, setMounted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [sparkImage, setSparkImage] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAiDrawing, setIsAiDrawing] = useState(false);
  const [audioStatus, setAudioStatus] = useState("");
  
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aiDrawIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => {
        clearTimeout(timer);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        if (aiDrawIntervalRef.current) clearInterval(aiDrawIntervalRef.current);
    };
  }, []);

  const handleSpark = async () => {
    if (isPromptLoading) return;
    
    setIsPromptLoading(true);
    setIsImageLoading(true);
    setSparkImage(null);
    setShowReference(false);
    setImageError(false);
    setIsAiDrawing(false);

    // Safety timeout
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
        setIsImageLoading(prev => {
            if (prev) setImageError(true);
            return false;
        });
    }, 15000);

    try {
        const res = await fetch("/api/sparks?type=drawing");
        if (!res.ok) throw new Error("Failed to fetch spark");
        
        const data = await res.json();
        setPrompt(data.prompt);
        setSparkImage(data.imageUrl);
        setShowReference(true);
    } catch (e) {
        console.error("Spark error", e);
        setImageError(true);
        setIsImageLoading(false);
    } finally {
        setIsPromptLoading(false);
    }
  };

  const startAIDraw = () => {
      if (isAiDrawing) return;
      
      const lesson = DRAWING_LESSONS.find(l => 
        prompt?.toLowerCase().includes(l.id)
      ) || DRAWING_LESSONS[0];

      setIsAiDrawing(true);
      clear();
      setShowReference(false);
      setAudioStatus(`AI is drawing a ${lesson.name}... 🎨`);

      let stepIndex = 0;
      if (aiDrawIntervalRef.current) clearInterval(aiDrawIntervalRef.current);

      aiDrawIntervalRef.current = setInterval(() => {
          if (stepIndex >= lesson.steps.length) {
              if (aiDrawIntervalRef.current) clearInterval(aiDrawIntervalRef.current);
              setIsAiDrawing(false);
              setAudioStatus("AI Finished! Now your turn to paint! ✨");
              setTimeout(() => setAudioStatus(""), 4000);
              return;
          }

          const step = lesson.steps[stepIndex];
          addLine({
              tool: step.tool as Tool,
              points: step.points,
              color: step.color,
              strokeWidth: step.strokeWidth
          });

          stepIndex++;
      }, 1000);
  };

  const handleImageLoad = () => {
      setIsImageLoading(false);
      setImageError(false);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
  };

  const handleImageError = () => {
      setIsImageLoading(false);
      setImageError(true);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
  };

  const handleSave = async () => {
    if (!title) return;
    setIsSaving(true);

    try {
      // 1. Upload JSON content to S3
      const contentUrl = await uploadToS3(
        JSON.stringify(lines),
        "application/json",
        "json"
      );

      // 2. Save creation record with S3 URL
      const res = await fetch("/api/creations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type: "drawing",
          contentUrl,
          thumbnailUrl: null, // Still null for now, can be updated later
          parentCreationId: remixId,
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
    <div className="flex flex-col h-screen bg-[#F1F5F9] overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-[#475569]" />
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-[#475569] tracking-tight uppercase italic flex items-center gap-2">
            <span className="text-2xl">🌙</span> {tc('title')}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={handleSpark}
            disabled={isPromptLoading}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFE66D] to-[#FF6B6B] text-white font-black rounded-full hover:scale-105 transition-all shadow-md active:scale-95 disabled:opacity-50`}
          >
            <Sparkles className={`w-5 h-5 ${isPromptLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline text-xs uppercase tracking-tighter">{t('surpriseMe')}</span>
          </button>
          
          {sparkImage && (
              <button 
                onClick={() => setShowReference(!showReference)}
                className={`p-2 rounded-lg transition-colors ${showReference ? 'bg-[#FF6B6B] text-white shadow-inner' : 'bg-gray-100 text-[#475569] hover:bg-gray-200'}`}
              >
                {showReference ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
          )}

          <div className="h-8 w-[1px] bg-gray-100 mx-1 hidden md:block" />

          <button onClick={undo} className="p-2 hover:bg-gray-100 rounded-lg text-[#475569] transition-colors"><Undo2 className="w-5 h-5" /></button>
          <button onClick={redo} className="p-2 hover:bg-gray-100 rounded-lg text-[#475569] transition-colors"><Redo2 className="w-5 h-5" /></button>
          <button onClick={clear} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
          
          <button 
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#FF6B6B] text-white font-black rounded-full hover:bg-[#ff5252] transition-colors shadow-lg active:scale-95 text-xs uppercase tracking-widest"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* Prompt Banner */}
      {prompt && (
          <div className="bg-gradient-to-r from-[#A78BFA] to-[#FF6B6B] px-4 py-3 text-white font-bold text-center flex items-center justify-center gap-4 relative animate-in slide-in-from-top duration-500 shadow-lg z-[5]">
              <div className="bg-white/20 p-1.5 rounded-lg"><Sparkles className="w-4 h-4 fill-white" /></div>
              <p className="text-sm md:text-base uppercase tracking-tight italic">Mission: {prompt}</p>
              
              {sparkImage && !isImageLoading && !isAiDrawing && (
                  <button 
                    onClick={startAIDraw}
                    className="ml-4 px-4 py-1 bg-white text-[#FF6B6B] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-md"
                  >
                      <GraduationCap className="w-3 h-3" />
                      Teach Me!
                  </button>
              )}

              {audioStatus && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white text-[#475569] px-4 py-1.5 rounded-full shadow-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest animate-bounce z-50">
                      {audioStatus}
                  </div>
              )}

              <button onClick={() => {setPrompt(null); setSparkImage(null);}} className="p-1 hover:bg-white/20 rounded-full transition-colors ml-auto">
                  <X className="w-4 h-4" />
              </button>
          </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 border-t-8 border-[#FF6B6B]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-[#475569] uppercase tracking-tighter">Share Masterpiece!</h2>
                    <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-[#475569]" /></button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-[#94a3b8] mb-2 uppercase tracking-[0.2em]">Artwork Title</label>
                        <input 
                            type="text" 
                            placeholder="What&apos;s its name?"
                            className="w-full px-5 py-4 bg-gray-50 border-4 border-transparent rounded-2xl focus:bg-white focus:border-[#FF6B6B] outline-none transition-all font-black text-[#475569] placeholder:text-gray-300"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-[#94a3b8] mb-2 uppercase tracking-[0.2em]">Story Time</label>
                        <textarea 
                            placeholder="Tell us about your art..."
                            className="w-full px-5 py-4 bg-gray-50 border-4 border-transparent rounded-2xl focus:bg-white focus:border-[#FF6B6B] outline-none transition-all h-32 resize-none font-bold text-[#475569] placeholder:text-gray-300"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || !title}
                        className="w-full py-5 bg-gradient-to-r from-[#FF6B6B] to-[#ff5252] text-white font-black rounded-[1.5rem] shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 text-lg uppercase tracking-widest"
                    >
                        {isSaving ? "Saving..." : "Publish! 🚀"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Studio Area */}
      <main className="flex-1 relative flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">
        {/* Sidebar Tools - Desktop */}
        <aside className="hidden md:flex flex-col gap-4 p-4 bg-white rounded-[2rem] shadow-xl w-24 items-center border border-gray-100">
          <ToolButton active={tool === 'brush'} onClick={() => setTool('brush')} icon={<Pencil className="w-6 h-6" />} label="Draw" />
          <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<Eraser className="w-6 h-6" />} label="Eraser" />
          <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} icon={<Square className="w-6 h-6" />} label="Box" />
          <ToolButton active={tool === 'circle'} onClick={() => setTool('circle')} icon={<CircleIcon className="w-6 h-6" />} label="Circle" />
        </aside>

        {/* Canvas Container */}
        <div className="flex-1 bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-inner relative overflow-hidden border-[6px] md:border-[12px] border-white ring-1 ring-gray-100">
          <DrawingCanvas />

          {/* AI Reference Image Overlay */}
          {showReference && (sparkImage || isImageLoading) && (
              <div className="absolute top-2 right-2 md:top-4 md:right-4 w-32 h-32 md:w-72 md:h-72 bg-white p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border-2 md:border-4 border-[#FF6B6B] animate-in zoom-in duration-300 group z-20 overflow-hidden flex items-center justify-center">
                  {isImageLoading && (
                      <div className="flex flex-col items-center gap-2 md:gap-4">
                          <div className="relative">
                            <Sparkles className="w-6 h-6 md:w-10 md:h-10 text-[#FFE66D] animate-spin" />
                            <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-[#FF6B6B] absolute -top-1 -right-1 md:-top-2 md:-right-2 animate-pulse" />
                          </div>
                          <p className="text-[8px] md:text-[10px] font-black text-[#475569] uppercase tracking-widest text-center animate-pulse">Magical Art...</p>
                      </div>
                  )}
                  
                  {imageError && !isImageLoading ? (
                      <div className="flex flex-col items-center gap-2 md:gap-4 p-2 md:p-4 text-center">
                          <ImageOff className="w-6 h-6 md:w-10 md:h-10 text-gray-200" />
                          <p className="text-[8px] md:text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-tight">Oops!</p>
                          <div className="flex flex-col gap-1 md:gap-2 w-full">
                            <button onClick={handleSpark} className="flex items-center justify-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2.5 bg-[#FF6B6B] text-white rounded-lg md:rounded-xl hover:bg-[#ff5252] transition-colors text-[8px] md:text-[10px] font-black uppercase">
                                <RefreshCw className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                Try
                            </button>
                          </div>
                      </div>
                  ) : sparkImage && (
                    <div className={`w-full h-full relative transition-opacity duration-700 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}>
                        <Image 
                            key={sparkImage}
                            src={sparkImage} 
                            alt="AI Inspiration" 
                            fill
                            unoptimized
                            className="object-cover rounded-[1rem] md:rounded-[1.5rem]"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 md:pb-4 rounded-[1rem] md:rounded-[1.5rem] pointer-events-none">
                            <p className="text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest">Inspiration</p>
                        </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setShowReference(false)}
                    className="absolute top-2 left-2 bg-white text-[#475569] p-1.5 rounded-full shadow-lg border-2 border-gray-50 hover:scale-110 transition-transform active:scale-95"
                  >
                      <X className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
              </div>
          )}
        </div>

        {/* Bottom Toolbar - Responsive Mobile */}
        <div className="flex flex-col md:w-80 gap-2 md:gap-4 shrink-0 overflow-y-auto max-h-[40vh] md:max-h-none">
          <div className="flex md:hidden justify-around p-2 bg-white rounded-xl shadow-lg border border-gray-100 shrink-0">
             <ToolButton active={tool === 'brush'} onClick={() => setTool('brush')} icon={<Pencil className="w-5 h-5" />} />
             <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<Eraser className="w-5 h-5" />} />
             <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} icon={<Square className="w-5 h-5" />} />
             <ToolButton active={tool === 'circle'} onClick={() => setTool('circle')} icon={<CircleIcon className="w-5 h-5" />} />
          </div>

          <div className="p-3 md:p-6 bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-gray-50">
            <h3 className="text-[8px] md:text-[10px] font-black text-[#94a3b8] mb-3 md:mb-5 uppercase tracking-[0.25em] text-center">Power Palette</h3>
            <div className="grid grid-cols-4 md:grid-cols-2 gap-2 md:gap-4">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded-[0.75rem] md:rounded-[1.25rem] border-[4px] md:border-[6px] transition-all hover:scale-110 shadow-sm relative group ${
                    color === c ? 'border-[#475569] scale-110 ring-4 md:ring-8 ring-gray-50' : 'border-white'
                  }`}
                  style={{ backgroundColor: c }}
                >
                    {color === c && <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-ping" /></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 md:p-6 bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border border-gray-100">
            <h3 className="text-[8px] md:text-[10px] font-black text-[#94a3b8] mb-3 md:mb-5 uppercase tracking-[0.25em] text-center">Brush Size</h3>
            <div className="flex justify-between items-center gap-2 md:gap-3">
              {STROKE_WIDTHS.map((size) => (
                <button
                  key={size}
                  onClick={() => setStrokeWidth(size)}
                  className={`flex-1 flex items-center justify-center aspect-square rounded-xl md:rounded-2xl transition-all ${
                    strokeWidth === size ? 'bg-[#F1F5F9] shadow-inner ring-2 md:ring-4 ring-[#FF6B6B]/10' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div 
                    className="rounded-full bg-[#475569] transition-transform duration-300" 
                    style={{ 
                        width: `${Math.min(size + (size < 10 ? 2 : 0), 24)}px`, 
                        height: `${Math.min(size + (size < 10 ? 2 : 0), 24)}px`, 
                        transform: strokeWidth === size ? 'scale(1.2)' : 'scale(1)' 
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-4 rounded-2xl transition-all w-full group ${
        active 
          ? 'bg-[#FF6B6B] text-white shadow-xl scale-105 active:scale-95' 
          : 'bg-white text-[#475569] hover:bg-gray-50 border border-transparent active:scale-95'
      }`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
      {label && <span className="text-[10px] font-black uppercase tracking-widest mt-1.5">{label}</span>}
    </button>
  );
}
