import { create } from 'zustand';

export interface MusicSequence {
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    clap: boolean[];
}

interface MusicState {
    sequence: MusicSequence;
    bpm: number;
    isPlaying: boolean;
    currentStep: number;
    
    setBpm: (bpm: number) => void;
    toggleStep: (instrument: keyof MusicSequence, step: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setCurrentStep: (step: number) => void;
    setSequence: (sequence: MusicSequence) => void;
    clear: () => void;
}

const INITIAL_SEQUENCE: MusicSequence = {
    kick: Array(16).fill(false),
    snare: Array(16).fill(false),
    hihat: Array(16).fill(false),
    clap: Array(16).fill(false),
};

export const useMusicStore = create<MusicState>((set) => ({
    sequence: { ...INITIAL_SEQUENCE },
    bpm: 120,
    isPlaying: false,
    currentStep: -1,

    setBpm: (bpm) => set({ bpm }),
    
    toggleStep: (instrument, step) => set((state) => ({
        sequence: {
            ...state.sequence,
            [instrument]: state.sequence[instrument].map((v, i) => i === step ? !v : v)
        }
    })),

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    
    setCurrentStep: (currentStep) => set({ currentStep }),

    setSequence: (sequence) => set({ sequence }),

    clear: () => set({ 
        sequence: {
            kick: Array(16).fill(false),
            snare: Array(16).fill(false),
            hihat: Array(16).fill(false),
            clap: Array(16).fill(false),
        },
        currentStep: -1 
    }),
}));
