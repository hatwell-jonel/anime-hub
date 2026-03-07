import type { HiAnime } from "aniwatch";

export const animeServers = [
    "hd-1",
    "hd-2",
    "megacloud",
    "streamsb",
    "streamtape",
] as const;
export type TAnimeServer = (typeof animeServers)[number];


export const animeAudioTypes = [
    "dub",
    "sub",
] as const;
export type TAnimeAudio = (typeof animeAudioTypes)[number];

// Re-export aniwatch types for use in components
export type ScrapedHomePage = HiAnime.ScrapedHomePage;
export type ScrapedAnimeAboutInfo = HiAnime.ScrapedAnimeAboutInfo;
export type ScrapedAnimeEpisodes = HiAnime.ScrapedAnimeEpisodes;
export type ScrapedEpisodeServers = HiAnime.ScrapedEpisodeServers;
export type ScrapedAnimeSearchResult = HiAnime.ScrapedAnimeSearchResult;
export type ScrapedAnimeEpisodesSources = HiAnime.ScrapedAnimeEpisodesSources & {
    anilistID: number | null;
    malID: number | null;
};

export type SpotlightAnime = HiAnime.SpotlightAnime;
export type TrendingAnime = HiAnime.TrendingAnime;
export type LatestEpisodeAnime = HiAnime.LatestEpisodeAnime;
export type TopAiringAnime = HiAnime.TopAiringAnime;
export type AnimeEpisode = HiAnime.AnimeEpisode;
export type RecommendedAnime = HiAnime.RecommendedAnime;
export type RelatedAnime = HiAnime.RelatedAnime;
export type SubEpisode = HiAnime.SubEpisode;
export type Anime = HiAnime.Anime;
