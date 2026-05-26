import HadithStudioClient from '@/components/studio/hadith-studio-client';
import { HADITHS, ADHKAR } from '@/lib/data/hadith';

// Using Nawawi's 40 Hadith - Much smaller and more foundational for kids
const HADITH_ARA_URL = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.min.json";
const DUAS_API_URL = "https://raw.githubusercontent.com/rn0x/Adhkar-json/master/adhkar.json";

interface ApiHadith {
    hadithnumber: number;
    text: string;
}

interface ApiDua {
    id: string;
    category: string;
    text: string;
}

interface AdhkarCategory {
    id: string;
    category: string;
    array: { text: string }[];
}

export default async function HadithPage() {
    // Fetch data directly on the server
    const apiAdhkar: ApiDua[] = [];
    let apiHadiths: ApiHadith[] = [];

    try {
        const [adRes, araRes] = await Promise.all([
            fetch(DUAS_API_URL, { next: { revalidate: 3600 } }), // Cache for 1 hour
            fetch(HADITH_ARA_URL, { next: { revalidate: 3600 } })
        ]);

        if (adRes.ok) {
            const adData = await adRes.json();
            if (Array.isArray(adData)) {
                adData.forEach((cat: AdhkarCategory) => {
                    if (cat.array && Array.isArray(cat.array)) {
                        cat.array.forEach((item: { text: string }, idx: number) => {
                            apiAdhkar.push({
                                id: `dua-${cat.id}-${idx}`,
                                category: cat.category,
                                text: item.text
                            });
                        });
                    }
                });
            }
        }

        if (araRes.ok) {
            const araData = await araRes.json();
            apiHadiths = araData.hadiths || [];
        }
    } catch (err) {
        console.error("Library Server Fetch Error:", err);
    }

    return (
        <HadithStudioClient 
            initialAdhkar={apiAdhkar} 
            initialHadiths={apiHadiths}
            curatedAdhkar={ADHKAR}
            curatedHadiths={HADITHS}
        />
    );
}
