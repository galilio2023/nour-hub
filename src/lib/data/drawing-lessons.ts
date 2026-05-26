export interface DrawingStep {
    tool: 'brush' | 'rect' | 'circle';
    points: number[];
    color: string;
    strokeWidth: number;
}

export interface DrawingLesson {
    id: string;
    name: string;
    description: string;
    steps: DrawingStep[];
}

export const DRAWING_LESSONS: DrawingLesson[] = [
    {
        id: 'cat',
        name: 'Magic Cat',
        description: 'Learn to draw a cute space cat!',
        steps: [
            // Head (Circle)
            { tool: 'circle', points: [400, 300, 400, 450], color: '#A78BFA', strokeWidth: 5 },
            // Left Ear
            { tool: 'brush', points: [300, 220, 330, 150, 380, 200], color: '#A78BFA', strokeWidth: 5 },
            // Right Ear
            { tool: 'brush', points: [420, 200, 470, 150, 500, 220], color: '#A78BFA', strokeWidth: 5 },
            // Left Eye
            { tool: 'circle', points: [350, 300, 350, 315], color: '#000000', strokeWidth: 2 },
            // Right Eye
            { tool: 'circle', points: [450, 300, 450, 315], color: '#000000', strokeWidth: 2 },
            // Nose/Mouth
            { tool: 'brush', points: [380, 350, 400, 370, 420, 350], color: '#FF6B6B', strokeWidth: 3 },
            // Whiskers Left
            { tool: 'brush', points: [320, 350, 250, 340], color: '#94A3B8', strokeWidth: 2 },
            { tool: 'brush', points: [320, 370, 250, 380], color: '#94A3B8', strokeWidth: 2 },
            // Whiskers Right
            { tool: 'brush', points: [480, 350, 550, 340], color: '#94A3B8', strokeWidth: 2 },
            { tool: 'brush', points: [480, 370, 550, 380], color: '#94A3B8', strokeWidth: 2 },
        ]
    },
    {
        id: 'moon',
        name: 'Glowing Moon',
        description: 'Draw a crescent moon in the night sky.',
        steps: [
            // Main Moon Shape
            { tool: 'circle', points: [400, 300, 400, 450], color: '#FFE66D', strokeWidth: 8 },
            // Inner cutout to make it a crescent (erased part)
            { tool: 'circle', points: [450, 280, 450, 430], color: '#ffffff', strokeWidth: 8 },
            // Little stars
            { tool: 'brush', points: [200, 150, 210, 160], color: '#A78BFA', strokeWidth: 5 },
            { tool: 'brush', points: [600, 100, 610, 110], color: '#FFE66D', strokeWidth: 5 },
            { tool: 'brush', points: [550, 450, 560, 460], color: '#FF6B6B', strokeWidth: 5 },
        ]
    },
    {
        id: 'rocket',
        name: 'Pizza Rocket',
        description: 'A rocket that looks like a slice of pizza!',
        steps: [
            // Rocket Body (Triangle-ish)
            { tool: 'brush', points: [400, 100, 300, 400, 500, 400, 400, 100], color: '#FF6B6B', strokeWidth: 10 },
            // Window
            { tool: 'circle', points: [400, 250, 400, 280], color: '#4ECDC4', strokeWidth: 5 },
            // Fire!
            { tool: 'brush', points: [350, 410, 330, 480, 400, 450, 470, 480, 450, 410], color: '#FFE66D', strokeWidth: 5 },
        ]
    },
    {
        id: 'sun',
        name: 'Happy Sun',
        description: 'Draw a bright, smiling sun!',
        steps: [
            // Sun Body
            { tool: 'circle', points: [400, 300, 400, 400], color: '#FFE66D', strokeWidth: 8 },
            // Rays
            { tool: 'brush', points: [400, 180, 400, 130], color: '#FFE66D', strokeWidth: 5 },
            { tool: 'brush', points: [400, 420, 400, 470], color: '#FFE66D', strokeWidth: 5 },
            { tool: 'brush', points: [280, 300, 230, 300], color: '#FFE66D', strokeWidth: 5 },
            { tool: 'brush', points: [520, 300, 570, 300], color: '#FFE66D', strokeWidth: 5 },
            { tool: 'brush', points: [320, 220, 280, 180], color: '#FFE66D', strokeWidth: 5 },
            { tool: 'brush', points: [480, 220, 520, 180], color: '#FFE66D', strokeWidth: 5 },
            // Smile
            { tool: 'brush', points: [360, 340, 400, 370, 440, 340], color: '#FF6B6B', strokeWidth: 4 },
        ]
    },
    {
        id: 'flower',
        name: 'Garden Flower',
        description: 'Grow a beautiful flower on your canvas.',
        steps: [
            // Stem
            { tool: 'brush', points: [400, 550, 400, 350], color: '#34D399', strokeWidth: 8 },
            // Leaf
            { tool: 'brush', points: [400, 480, 450, 450, 400, 450], color: '#34D399', strokeWidth: 5 },
            // Petals
            { tool: 'circle', points: [400, 270, 400, 310], color: '#F472B6', strokeWidth: 4 },
            { tool: 'circle', points: [400, 430, 400, 390], color: '#F472B6', strokeWidth: 4 },
            { tool: 'circle', points: [320, 350, 360, 350], color: '#F472B6', strokeWidth: 4 },
            { tool: 'circle', points: [480, 350, 440, 350], color: '#F472B6', strokeWidth: 4 },
            // Center
            { tool: 'circle', points: [400, 350, 400, 370], color: '#FFE66D', strokeWidth: 4 },
        ]
    },
    {
        id: 'house',
        name: 'Dream Home',
        description: 'Build a cozy little house.',
        steps: [
            // Main House
            { tool: 'rect', points: [300, 300, 500, 500], color: '#A78BFA', strokeWidth: 6 },
            // Roof
            { tool: 'brush', points: [300, 300, 400, 200, 500, 300, 300, 300], color: '#FF6B6B', strokeWidth: 8 },
            // Door
            { tool: 'rect', points: [375, 420, 425, 500], color: '#4ECDC4', strokeWidth: 4 },
            // Window
            { tool: 'rect', points: [330, 340, 370, 380], color: '#FFE66D', strokeWidth: 3 },
            { tool: 'rect', points: [430, 340, 470, 380], color: '#FFE66D', strokeWidth: 3 },
        ]
    },
    {
        id: 'fish',
        name: 'Little Fishy',
        description: 'A blue fish swimming in the sea.',
        steps: [
            // Body
            { tool: 'circle', points: [400, 300, 400, 380], color: '#3B82F6', strokeWidth: 6 },
            // Tail
            { tool: 'brush', points: [320, 300, 260, 240, 260, 360, 320, 300], color: '#3B82F6', strokeWidth: 6 },
            // Eye
            { tool: 'circle', points: [440, 285, 440, 290], color: '#000000', strokeWidth: 2 },
            // Bubbles
            { tool: 'circle', points: [520, 250, 520, 260], color: '#4ECDC4', strokeWidth: 2 },
            { tool: 'circle', points: [550, 200, 550, 208], color: '#4ECDC4', strokeWidth: 2 },
        ]
    }
];
