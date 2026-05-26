import QuranStudioClient from '@/components/studio/quran-studio-client';

export default async function QuranExplorerPage() {
    // Fetch chapters directly on the server
    let chapters = [];
    try {
        const res = await fetch("https://api.quran.com/api/v4/chapters?language=en", {
            next: { revalidate: 86400 } // Cache for 24 hours
        });
        if (res.ok) {
            const data = await res.json();
            chapters = data.chapters;
        }
    } catch (err) {
        console.error("Quran Server Fetch Error:", err);
    }

    return (
        <QuranStudioClient initialChapters={chapters} />
    );
}
