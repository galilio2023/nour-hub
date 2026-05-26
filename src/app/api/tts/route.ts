import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const gender = searchParams.get("gender") || "female";

    if (!text) {
        return new NextResponse("Missing text", { status: 400 });
    }

    try {
        // Google Translate TTS safe limit is around 200 chars.
        // For full stories, the client-side should ideally split text into chunks.
        const safeText = text.substring(0, 200);
        
        // Google Translate often uses a female voice for Egyptian (ar-eg) 
        // and a male voice for Saudi (ar-sa) or generic (ar).
        const lang = gender === 'female' ? 'ar-eg' : 'ar-sa';
        
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(safeText)}&tl=${lang}&client=tw-ob`;
        
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://translate.google.com/",
            },
        });

        if (!response.ok) {
            console.error(`TTS Engine Error: ${response.status} ${response.statusText}`);
            return new NextResponse(`TTS Engine Error: ${response.status}`, { status: response.status });
        }

        const buffer = await response.arrayBuffer();

        if (buffer.byteLength < 100) {
            throw new Error("Received empty or invalid audio buffer");
        }

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("TTS Proxy Error:", error);
        return new NextResponse("Failed to generate audio", { status: 500 });
    }
}
