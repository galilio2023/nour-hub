import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    let url = searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing URL", { status: 400 });
    }

    // Handle relative URLs
    if (!url.startsWith("http")) {
        if (url.startsWith("//")) {
            url = `https:${url}`;
        } else {
            // Assume quran.com audio if it's a relative path
            url = `https://verses.quran.com/${url}`;
        }
    }

    // SSRF Protection: Validate the URL domain
    try {
        const parsedUrl = new URL(url);
        const allowedDomains = ["verses.quran.com", "www.alsunna.org", "translate.google.com"];
        if (!allowedDomains.includes(parsedUrl.hostname)) {
            return new NextResponse("Forbidden: Untrusted domain", { status: 403 });
        }
    } catch {
        return new NextResponse("Invalid URL format", { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://quran.com/",
            },
        });

        if (!response.ok) {
            throw new Error(`Audio Fetch Failed: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type") || "audio/mpeg";
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("Audio Proxy Error:", error);
        return new NextResponse("Failed to proxy audio", { status: 500 });
    }
}
