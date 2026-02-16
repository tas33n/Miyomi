export interface VoteItem {
    count: number;
    loved: boolean;
    timestamp?: number;
}

export type VoteRegistry = Record<string, VoteItem>;

const STORAGE_KEY = 'miyomi_vote_registry';
const CACHE_duration = 1000 * 60 * 5;

export const voteStorage = {
    get: (): VoteRegistry => {
        if (typeof window === 'undefined') return {};
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const parsed = data ? JSON.parse(data) : {};
            return parsed;
        } catch (e) {
            console.warn('Failed to parse vote cache', e);
            return {};
        }
    },

    set: (data: VoteRegistry) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save vote cache', e);
        }
    },

    getItem: (id: string): VoteItem | undefined => {
        const registry = voteStorage.get();
        return registry[id];
    },

    updateItem: (id: string, data: Partial<VoteItem>) => {
        const registry = voteStorage.get();
        const current = registry[id] || { count: 0, loved: false };

        registry[id] = { ...current, ...data };
        voteStorage.set(registry);
    }
};
