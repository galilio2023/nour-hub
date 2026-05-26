"use client";

import React, { useMemo } from 'react';
import { Story } from '@/lib/data/stories';
import { Lock, Check, Play, ChevronRight } from 'lucide-react';

interface ProphetMapProps {
    stories: Story[];
    completedIds: string[];
    onSelectStory: (story: Story) => void;
}

export function ProphetMap({ stories, completedIds, onSelectStory }: ProphetMapProps) {
    // Group stories by their main subject (Prophet) to create "Islands" or "Zones"
    const zones = useMemo(() => {
        const groups: { [key: string]: Story[] } = {};
        stories.forEach(s => {
            const prophetName = s.title.split(':')[0]; // e.g. "Prophet Adam"
            if (!groups[prophetName]) groups[prophetName] = [];
            groups[prophetName].push(s);
        });
        return Object.entries(groups);
    }, [stories]);

    return (
        <div className="relative w-full max-w-4xl mx-auto py-20 px-4">
            {/* The Winding Path SVG Background */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-full border-l-8 border-dashed border-[#FFE66D] ml-1/2 rounded-full" />
            </div>

            <div className="flex flex-col items-center space-y-32">
                {zones.map(([name, zoneStories], zIdx) => {
                    const isZoneUnlocked = zIdx === 0 || zoneStories.some(s => completedIds.includes(s.id)) || 
                                          zones[zIdx-1][1].some(s => completedIds.includes(s.id));

                    return (
                        <div key={name} className="relative w-full flex flex-col items-center">
                            {/* Zone Header / Landmark */}
                            <div className={`mb-12 p-6 rounded-[2rem] bg-white shadow-xl border-b-8 border-[#FFE66D] text-center transform transition-all ${isZoneUnlocked ? 'scale-100' : 'scale-90 opacity-50 gray-scale'}`}>
                                <h3 className="text-xl md:text-2xl font-black text-[#475569] uppercase tracking-tighter italic">{name}</h3>
                                <p className="text-[10px] font-black text-[#FFE66D] uppercase tracking-widest mt-1">{zoneStories.length} Chapters</p>
                            </div>

                            {/* Episode Nodes - Zig Zag Layout */}
                            <div className="grid grid-cols-1 gap-12 w-full max-w-md">
                                {zoneStories.map((story, sIdx) => {
                                    const isCompleted = completedIds.includes(story.id);
                                    const isNextToPlay = !isCompleted && (sIdx === 0 ? isZoneUnlocked : completedIds.includes(zoneStories[sIdx-1].id));
                                    const isLocked = !isCompleted && !isNextToPlay;

                                    const alignmentClass = sIdx % 2 === 0 ? 'self-start translate-x-[-20%]' : 'self-end translate-x-[20%]';

                                    return (
                                        <div 
                                            key={story.id} 
                                            className={`relative flex items-center gap-4 ${alignmentClass} group`}
                                        >
                                            <button
                                                disabled={isLocked}
                                                onClick={() => onSelectStory(story)}
                                                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 ${
                                                    isCompleted ? 'bg-gradient-to-br from-[#4ECDC4] to-[#45bba0] border-4 border-white' :
                                                    isNextToPlay ? 'bg-gradient-to-br from-[#FFE66D] to-[#FFD93D] border-4 border-white animate-bounce-slow shadow-[0_0_30px_rgba(255,230,109,0.5)]' :
                                                    'bg-gray-200 border-4 border-white opacity-60'
                                                }`}
                                            >
                                                {isLocked ? <Lock className="text-gray-400" /> : 
                                                 isCompleted ? <Check className="text-white w-8 h-8" /> : 
                                                 <Play className="text-[#475569] fill-[#475569] w-8 h-8 translate-x-1" />}
                                                
                                                {/* Tooltip on Hover */}
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                                    <p className="text-[10px] font-black text-[#475569] uppercase tracking-tighter">{story.title.split('-')[1] || "Start Chapter"}</p>
                                                </div>
                                            </button>

                                            {/* Path Connection Line (Mobile Friendly) */}
                                            {sIdx < zoneStories.length - 1 && (
                                                <div className={`absolute top-full h-12 w-1 bg-dashed border-l-4 border-dotted ${isCompleted ? 'border-[#4ECDC4]' : 'border-gray-300'} left-1/2 -translate-x-1/2`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bridge to Next Zone */}
                            {zIdx < zones.length - 1 && (
                                <div className="mt-20 flex flex-col items-center">
                                    <div className="w-1 h-32 border-l-4 border-dashed border-[#FFE66D]/30" />
                                    <ChevronRight className="rotate-90 text-[#FFE66D] animate-pulse" size={40} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .gray-scale {
                    filter: grayscale(1);
                }
            `}</style>
        </div>
    );
}
