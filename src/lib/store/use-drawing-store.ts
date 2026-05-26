import { create } from 'zustand';

export type Tool = 'brush' | 'eraser' | 'rect' | 'circle';

export interface DrawLine {
  tool: Tool;
  points: number[];
  color: string;
  strokeWidth: number;
}

interface DrawingState {
  lines: DrawLine[];
  currentLine: DrawLine | null;
  tool: Tool;
  color: string;
  strokeWidth: number;
  undoStack: DrawLine[][];
  redoStack: DrawLine[][];

  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setLines: (lines: DrawLine[]) => void;
  addLine: (line: DrawLine) => void;
  updateCurrentLine: (points: number[]) => void;
  completeLine: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const MAX_UNDO_STEPS = 50;

export const useDrawingStore = create<DrawingState>((set) => ({
  lines: [],
  currentLine: null,
  tool: 'brush',
  color: '#FF6B6B',
  strokeWidth: 5,
  undoStack: [],
  redoStack: [],

  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setLines: (lines) => set({ 
    lines, 
    undoStack: [], 
    redoStack: [] 
  }),

  addLine: (line) => set((state) => {
    const newUndoStack = [...state.undoStack, state.lines];
    if (newUndoStack.length > MAX_UNDO_STEPS) newUndoStack.shift();
    return {
      lines: [...state.lines, line],
      undoStack: newUndoStack,
      redoStack: [],
    };
  }),

  updateCurrentLine: (points) => set((state) => ({
    currentLine: {
      tool: state.tool,
      color: state.tool === 'eraser' ? '#ffffff' : state.color,
      strokeWidth: state.strokeWidth,
      points: points,
    }
  })),

  completeLine: () => set((state) => {
    if (!state.currentLine) return state;
    const newUndoStack = [...state.undoStack, state.lines];
    if (newUndoStack.length > MAX_UNDO_STEPS) newUndoStack.shift();
    return {
      lines: [...state.lines, state.currentLine],
      currentLine: null,
      undoStack: newUndoStack,
      redoStack: [],
    };
  }),

  undo: () => set((state) => {
    if (state.undoStack.length === 0) return state;
    const previous = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);
    return {
      lines: previous,
      undoStack: newUndoStack,
      redoStack: [state.lines, ...state.redoStack].slice(0, MAX_UNDO_STEPS),
    };
  }),

  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state;
    const next = state.redoStack[0];
    const newRedoStack = state.redoStack.slice(1);
    const newUndoStack = [...state.undoStack, state.lines];
    if (newUndoStack.length > MAX_UNDO_STEPS) newUndoStack.shift();
    return {
      lines: next,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
    };
  }),

  clear: () => set((state) => {
    const newUndoStack = [...state.undoStack, state.lines];
    if (newUndoStack.length > MAX_UNDO_STEPS) newUndoStack.shift();
    return {
      lines: [],
      undoStack: newUndoStack,
      redoStack: [],
      currentLine: null,
    };
  }),
}));

