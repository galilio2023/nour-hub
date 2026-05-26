"use client";

import React from 'react';
import { Moon, Sparkles, Star, ShieldCheck, Crown } from 'lucide-react';

interface AvatarState {
    color: string;
    accessory?: 'none' | 'crown' | 'shield' | 'stars';
}

interface NoorAvatarProps {
    level: number;
    state?: string | null; // Stringified JSON
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function NoorAvatar({ level, state, size = 'md' }: NoorAvatarProps) {
    let parsedState: AvatarState = { color: '#A78BFA' };
    
    try {
        if (state && typeof state === 'string' && state.trim() !== '') {
            parsedState = JSON.parse(state);
        } else if (state && typeof state === 'object') {
            parsedState = { ...parsedState, ...(state as unknown as AvatarState) };
        }
    } catch (e) {
        console.error("Failed to parse avatar state:", e);
    }
    
    // Scale properties based on level
    const glowIntensity = Math.min(0.2 + (level * 0.05), 0.8);
    const scale = 1 + Math.min((level - 1) * 0.02, 0.5);
    
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-20 h-20',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48'
    };

    const iconSizes = {
        sm: 24,
        md: 40,
        lg: 64,
        xl: 96
    };

    return (
        <div 
            className={`relative flex items-center justify-center ${sizeClasses[size]}`} 
            style={{ transform: `scale(${scale})` }}
        >
            {/* Ambient Glow */}
            <div 
                className="absolute inset-0 rounded-full blur-2xl animate-pulse"
                style={{ 
                    backgroundColor: parsedState.color, 
                    opacity: glowIntensity,
                    transform: 'scale(1.2)'
                }} 
            />
            
            {/* Base Avatar Shape (Moon) */}
            <div className="relative z-10 animate-bounce-slow">
                <Moon 
                    size={iconSizes[size]} 
                    fill={parsedState.color} 
                    className="text-white"
                    style={{ 
                        color: 'white',
                        filter: `drop-shadow(0 0 10px ${parsedState.color})`
                    }}
                />
                
                {/* Dynamic Accessories based on state */}
                {parsedState.accessory === 'crown' && (
                    <Crown 
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#FFE66D] fill-[#FFE66D] animate-pulse"
                        size={iconSizes[size] / 2}
                    />
                )}
                
                {parsedState.accessory === 'shield' && (
                    <ShieldCheck 
                        className="absolute -bottom-2 -right-2 text-[#4ECDC4] fill-[#4ECDC4]"
                        size={iconSizes[size] / 2}
                    />
                )}

                {parsedState.accessory === 'stars' && (
                    <>
                        <Star className="absolute -top-2 -left-2 text-[#FFE66D] animate-ping" size={iconSizes[size] / 4} />
                        <Star className="absolute top-4 -right-4 text-[#A78BFA] animate-bounce" size={iconSizes[size] / 5} />
                    </>
                )}
            </div>

            {/* Level Indicator Sparkles */}
            {level > 5 && (
                <div className="absolute inset-0 animate-spin-slow">
                    <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 text-white/40" size={iconSizes[size] / 3} />
                    <Sparkles className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white/40" size={iconSizes[size] / 3} />
                </div>
            )}
        </div>
    );
}

