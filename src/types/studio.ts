export type Tool = 'brush' | 'eraser' | 'rect' | 'circle';

export interface DrawLine {
  tool: Tool;
  points: number[];
  color: string;
  strokeWidth: number;
}

export interface MusicSequence {
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    clap: boolean[];
}
