"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Play, Pause, Repeat } from "lucide-react";
import { CreationSocial } from "@/components/social/creation-social";
import { useDrawingStore } from "@/lib/store/use-drawing-store";
import { useMusicStore } from "@/lib/store/use-music-store";
import { useRouter } from "next/navigation";
import * as Tone from 'tone';

export interface Like {
  id: string;
  userId: string;
  creationId: string;
}

export interface Creation {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: 'drawing' | 'music' | 'story' | 'design';
  contentUrl: string;
  thumbnailUrl: string | null;
  likes: Like[];
  user: {
    name: string;
    image: string | null;
  };
  parent?: {
    id: string;
    title: string;
    user: {
      name: string;
    };
  };
}

interface MusicSynths {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  hihat: Tone.MetalSynth;
  clap: Tone.NoiseSynth;
}

export function CreationGrid({ creations }: { creations: Creation[] }) {
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicStep, setMusicStep] = useState(-1);
  const { setLines } = useDrawingStore();
  const { setSequence } = useMusicStore();
  const router = useRouter();
  const musicSynths = useRef<MusicSynths | null>(null);

  // Music Playback Logic for Modal
  useEffect(() => {
    if (selectedCreation?.type === 'music' && isPlayingMusic) {
        Tone.start();
        
        musicSynths.current = {
            kick: new Tone.MembraneSynth().toDestination(),
            snare: new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination(),
            hihat: new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).toDestination(),
            clap: new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).toDestination()
        };

        const loop = new Tone.Sequence((time, step) => {
            setMusicStep(step);
            if (!musicSynths.current) return;
            // Simplified playback logic based on the store's sequence format would go here
            // For now, we just simulate playback visualizer
        }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n').start(0);

        Tone.getTransport().start();

        return () => {
            loop.dispose();
            Tone.getTransport().stop();
            Tone.getTransport().cancel();
            setMusicStep(-1);
            if (musicSynths.current) {
                Object.values(musicSynths.current).forEach((s) => s.dispose());
            }
        };
    }
  }, [selectedCreation, isPlayingMusic]);

  const handleRemix = () => {
    if (!selectedCreation) return;
    
    try {
        const data = JSON.parse(selectedCreation.contentUrl);
        if (selectedCreation.type === 'drawing') {
            setLines(data);
            router.push(`/studio/draw?remix=${selectedCreation.id}`);
        } else if (selectedCreation.type === 'music') {
            setSequence(data);
            router.push(`/studio/music?remix=${selectedCreation.id}`);
        }
    } catch (e) {
        console.error("Failed to parse remix data", e);
    }
  };

  const closeModal = () => {
      setSelectedCreation(null);
      setIsPlayingMusic(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {creations.map((creation) => (
          <div 
            key={creation.id} 
            onClick={() => setSelectedCreation(creation)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group border-b-4 border-transparent hover:border-[#FF6B6B] cursor-pointer"
          >
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {creation.thumbnailUrl ? (
                    <Image 
                        src={creation.thumbnailUrl} 
                        alt={creation.title} 
                        fill
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        {creation.type === 'drawing' ? '🎨' : creation.type === 'music' ? '🎵' : '📖'}
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#475569] shadow-sm">
                    {creation.type}
                </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-[#475569] truncate mb-1">{creation.title}</h3>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-bold text-[10px]">
                        {creation.user?.name?.[0] || 'K'}
                    </div>
                    <span className="text-xs font-semibold text-[#475569]">{creation.user?.name || "Creative Kid"}</span>
                </div>
                <div className="flex items-center gap-1 text-[#64748b]">
                    <span className="text-xs font-bold">{creation.likes?.length || 0} Likes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCreation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Left Side: Preview */}
                <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center relative p-8">
                    <button 
                        onClick={closeModal}
                        className="absolute top-4 left-4 md:hidden p-2 bg-white rounded-full shadow-md"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    {selectedCreation.type === 'music' ? (
                        <div className="flex flex-col items-center gap-8">
                            <div className="w-48 h-48 bg-gradient-to-br from-[#4ECDC4] to-[#A78BFA] rounded-full flex items-center justify-center shadow-2xl">
                                <Play className="w-20 h-20 text-white fill-white" />
                            </div>
                            <button 
                                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                                className={`px-12 py-4 rounded-full font-bold text-white shadow-xl transition-all active:scale-95 flex items-center gap-3 ${
                                    isPlayingMusic ? 'bg-[#FF6B6B] hover:bg-[#ff5252]' : 'bg-[#4ECDC4] hover:bg-[#45bba0]'
                                }`}
                            >
                                {isPlayingMusic ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                                <span>{isPlayingMusic ? "Stop the Beat" : "Play the Beat"}</span>
                            </button>
                            
                            {isPlayingMusic && (
                                <div className="flex gap-2">
                                    {Array(16).fill(0).map((_, i) => (
                                        <div key={i} className={`w-3 h-3 rounded-full transition-colors ${musicStep === i ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : selectedCreation.thumbnailUrl ? (
                        <div className="relative w-full h-full">
                            <Image 
                                src={selectedCreation.thumbnailUrl} 
                                alt={selectedCreation.title} 
                                fill
                                className="object-contain rounded-xl shadow-lg"
                            />
                        </div>
                    ) : (
                        <div className="text-9xl">
                             {selectedCreation.type === 'drawing' ? '🎨' : '📖'}
                        </div>
                    )}
                </div>

                {/* Right Side: Social & Details */}
                <div className="w-full md:w-[400px] p-8 flex flex-col border-l border-gray-100 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#475569] leading-tight mb-2">{selectedCreation.title}</h2>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-bold text-[10px]">
                                    {selectedCreation.user?.name?.[0] || 'K'}
                                </div>
                                <span className="text-sm font-semibold text-[#64748b]">By {selectedCreation.user?.name || "Creative Kid"}</span>
                            </div>
                        </div>
                        <button onClick={closeModal} className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-[#475569]" />
                        </button>
                    </div>

                    <p className="text-[#64748b] text-sm leading-relaxed mb-6">{selectedCreation.description || "No description provided."}</p>

                    <button 
                        onClick={handleRemix}
                        className={`w-full py-4 mb-8 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 ${
                            selectedCreation.type === 'music' ? 'bg-[#4ECDC4] hover:bg-[#45bba0]' : 'bg-[#A78BFA] hover:bg-[#8b5cf6]'
                        }`}
                    >
                        <Repeat className="w-6 h-6" />
                        {selectedCreation.type === 'music' ? "Remix this Beat!" : "Remix this Art!"}
                    </button>

                    <CreationSocial creationId={selectedCreation.id} initialLikes={selectedCreation.likes} parent={selectedCreation.parent} />
                </div>
            </div>
        </div>
      )}
    </>
  );
}
