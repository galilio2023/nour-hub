"use client";

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useMusicStore } from '@/lib/store/use-music-store';
import { MusicSequence } from '@/types/studio';

export default function MusicStudio() {
    const { sequence, bpm, isPlaying, setCurrentStep, currentStep, toggleStep } = useMusicStore();
    const synths = useRef<{
        kick: Tone.MembraneSynth;
        snare: Tone.NoiseSynth;
        hihat: Tone.MetalSynth;
        clap: Tone.NoiseSynth;
    } | null>(null);

    useEffect(() => {
        // Initialize Synths
        synths.current = {
            kick: new Tone.MembraneSynth().toDestination(),
            snare: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
            }).toDestination(),
            hihat: new Tone.MetalSynth({
                envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
                modulationIndex: 20,
                resonance: 4000
            }).toDestination(),
            clap: new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
            }).toDestination()
        };

        return () => {
            if (synths.current) {
                Object.values(synths.current).forEach((s) => s.dispose());
            }
        };
    }, []);

    useEffect(() => {
        Tone.getTransport().bpm.value = bpm;
    }, [bpm]);

    useEffect(() => {
        if (isPlaying && synths.current) {
            Tone.start();
            
            const loop = new Tone.Sequence(
                (time, step) => {
                    setCurrentStep(step);
                    
                    if (synths.current) {
                        if (sequence.kick[step]) synths.current.kick.triggerAttackRelease('C1', '8n', time);
                        if (sequence.snare[step]) synths.current.snare.triggerAttackRelease('16n', time);
                        if (sequence.hihat[step]) synths.current.hihat.triggerAttackRelease('32n', time);
                        if (sequence.clap[step]) synths.current.clap.triggerAttackRelease('16n', time);
                    }
                },
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                '16n'
            ).start(0);

            Tone.getTransport().start();

            return () => {
                loop.dispose();
                Tone.getTransport().stop();
                Tone.getTransport().cancel();
                setCurrentStep(-1);
            };
        }
    }, [isPlaying, sequence, setCurrentStep]);

    const instruments: (keyof MusicSequence)[] = ['kick', 'snare', 'hihat', 'clap'];

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 gap-3 md:gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {instruments.map((inst) => (
                    <div key={inst} className="flex items-center gap-2 md:gap-4 min-w-[600px] md:min-w-0">
                        <div className="w-16 md:w-24 text-right shrink-0">
                            <span className="text-[10px] md:text-sm font-black text-[#475569] uppercase tracking-wider">{inst}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-16 gap-1 md:gap-2">
                            {sequence[inst].map((active, step) => (
                                <button
                                    key={step}
                                    onClick={() => toggleStep(inst, step)}
                                    className={`aspect-square rounded-md md:rounded-lg border md:border-2 transition-all transform active:scale-95 ${
                                        active 
                                            ? inst === 'kick' ? 'bg-[#FF6B6B] border-[#FF6B6B] shadow-md' :
                                              inst === 'snare' ? 'bg-[#4ECDC4] border-[#4ECDC4] shadow-md' :
                                              inst === 'hihat' ? 'bg-[#FFE66D] border-[#FFE66D] shadow-md' :
                                              'bg-[#A78BFA] border-[#A78BFA] shadow-md'
                                            : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                                    } ${
                                        currentStep === step ? 'ring-2 md:ring-4 ring-gray-200 scale-110 z-10' : ''
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 md:mt-8 flex justify-center gap-1 md:gap-2">
                {Array(16).fill(0).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${
                            currentStep === i ? 'bg-[#FF6B6B]' : 'bg-gray-200'
                        }`} 
                    />
                ))}
            </div>
        </div>
    );
}
