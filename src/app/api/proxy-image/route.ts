import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing URL", { status: 400 });
    }

    // SSRF Protection: Validate the URL domain
    try {
        const parsedUrl = new URL(url);
        const allowedDomains = ["image.pollinations.ai", "gen.pollinations.ai", "ui-avatars.com"];
        if (!allowedDomains.includes(parsedUrl.hostname)) {
            return new NextResponse("Forbidden: Untrusted domain", { status: 403 });
        }
    } catch {
        return new NextResponse("Invalid URL format", { status: 400 });
    }

    const prompt = searchParams.get("prompt") || "Creative Inspiration";
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(prompt)}&background=random&color=fff&size=512&bold=true&length=50&font-size=0.33`;

    try {
        const fetchWithRetry = async (attempt = 1): Promise<Response> => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per attempt

            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    },
                });

                clearTimeout(timeoutId);

                // If busy and we have attempts left, wait and retry
                if (response.status === 429 && attempt < 2) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return fetchWithRetry(attempt + 1);
                }

                return response;
            } catch (err) {
                clearTimeout(timeoutId);
                if (err instanceof Error && err.name === 'AbortError' || attempt >= 2) {
                    // If we timeout or reach max attempts, return a fake response to trigger fallback
                    return new Response("Timeout", { status: 408 });
                }
                throw err;
            }
        };

        let response = await fetchWithRetry();

        // FALLBACK: If AI is busy, timed out, or failed
        if (!response.ok || response.status === 429 || response.status === 408) {
            console.log("AI Unavailable (Status:", response.status, "), using fallback");
            response = await fetch(fallbackUrl);
        }

        const contentType = response.headers.get("content-type") || "image/png";
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("Proxy critical failure, forcing final fallback:", error);
        // Absolute final fallback to ensure a valid image is ALWAYS returned
        const finalFallback = await fetch(fallbackUrl);
        const buffer = await finalFallback.arrayBuffer();
        return new NextResponse(buffer, { headers: { "Content-Type": "image/png" } });
    }
}
