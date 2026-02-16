
export const SEASONAL_CONFIG = {
    enabled: true,
    themeName: 'christmas',

    assets: {
        logo: '/hugme-christmas.png',
        homeAvatar: '/polic-christmas.png',
    },

    effects: {
        snowCount: 20,
        wind: [-0.2, 1.0] as [number, number],
        lowPower: {
            snowCount: 10,
            imageCount: 5,
            standardSnowCount: 20
        }
    }
};

export function isSeasonalActive(): boolean {
    return SEASONAL_CONFIG.enabled;
}