import { Suspense } from 'react';
import DrawingStudioClient from '@/components/studio/draw-studio-client';

export default async function DrawStudioPage({
    searchParams,
}: {
    searchParams: Promise<{ remix?: string }>;
}) {
    const { remix } = await searchParams;

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-black text-[#FF6B6B] animate-pulse tracking-widest uppercase">Magical Studio Loading...</div>}>
            <DrawingStudioClient remixId={remix} />
        </Suspense>
    );
}
