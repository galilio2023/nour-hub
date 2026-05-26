import StoryStudioClient from '@/components/studio/story-studio-client';
import { PREMADE_STORIES } from '@/lib/data/stories';

export default async function IslamicStoryPage() {
    // Stories are currently static, so we just pass them from the data file.
    // In the future, this could be a DB fetch.
    return (
        <StoryStudioClient stories={PREMADE_STORIES} />
    );
}
