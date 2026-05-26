import { NextResponse } from "next/server";

const DRAWING_PROMPTS = [
    "A cat flying a pizza rocket to the moon",
    "A dinosaur wearing a pink tutu and dancing ballet",
    "A robot eating a giant bowl of colorful spaghetti",
    "A tree that grows lollipops instead of leaves",
    "An underwater party with an octopus DJ and dancing fish",
    "A superhero potato saving the grocery store",
    "A castle made of marshmallows and chocolate clouds",
    "A skateboarder alien doing tricks on Saturn rings",
    "A fluffy cloud that rains tiny rubber ducks",
    "A wizard mouse making a giant cheese mountain",
];

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "drawing") {
        const randomPrompt = DRAWING_PROMPTS[Math.floor(Math.random() * DRAWING_PROMPTS.length)];
        const seed = Math.floor(Math.random() * 1000000);
        
        const safePrompt = randomPrompt.toLowerCase().replace(/\s+/g, '_');
        const directUrl = `https://image.pollinations.ai/prompt/${safePrompt}?width=512&height=512&seed=${seed}&nologo=true`;
        // Pass the prompt to the proxy for a smart fallback
        const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(directUrl)}&prompt=${encodeURIComponent(randomPrompt)}`;
        
        return NextResponse.json({ 
            prompt: randomPrompt,
            imageUrl: proxiedUrl,
            directUrl: directUrl
        });
    }

    if (type === "music") {
        // Procedural Beat Generation (Smart Start)
        const sequence = {
            kick: Array(16).fill(false).map((_, i) => i % 4 === 0), // Basic 4/4 kick
            snare: Array(16).fill(false).map((_, i) => i % 8 === 4), // Simple snare on 2 and 4
            hihat: Array(16).fill(false).map(() => Math.random() > 0.6), // Randomized hats
            clap: Array(16).fill(false).map((_, i) => i === 12 && Math.random() > 0.5), // Occasional clap
        };
        return NextResponse.json({ sequence });
    }

    return new NextResponse("Invalid type", { status: 400 });
}
