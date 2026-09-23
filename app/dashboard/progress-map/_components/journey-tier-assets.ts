const JOURNEY_TIER_IMAGES = [
    "/images/journey/tier-01-foundation.webp",
    "/images/journey/tier-02-stability.webp",
    "/images/journey/tier-03-exploration.webp",
    "/images/journey/tier-04-reflection.webp",
    "/images/journey/tier-05-resilience.webp",
    "/images/journey/tier-06-maturity.webp",
    "/images/journey/tier-07-guidance.webp",
    "/images/journey/tier-08-mastery.webp",
    "/images/journey/tier-09-deep-calm.webp",
    "/images/journey/tier-10-completion.webp",
] as const;

const JOURNEY_TIER_IMAGES_BY_KEY: Record<string, string> = {
    gerbang_awal: JOURNEY_TIER_IMAGES[0],
    taman_ketenangan: JOURNEY_TIER_IMAGES[1],
    perpustakaan_bijak: JOURNEY_TIER_IMAGES[2],
    lembah_refleksi: JOURNEY_TIER_IMAGES[3],
    alun_komunitas: JOURNEY_TIER_IMAGES[4],
    puncak_harmoni: JOURNEY_TIER_IMAGES[5],
    hutan_kebijaksanaan: JOURNEY_TIER_IMAGES[6],
    danau_kedamaian: JOURNEY_TIER_IMAGES[7],
    menara_guardian: JOURNEY_TIER_IMAGES[8],
    nirwana: JOURNEY_TIER_IMAGES[9],
};

export function getJourneyTierImage(regionKey: string, regionIndex = 0): string {
    return JOURNEY_TIER_IMAGES_BY_KEY[regionKey] ?? JOURNEY_TIER_IMAGES[regionIndex % JOURNEY_TIER_IMAGES.length];
}
