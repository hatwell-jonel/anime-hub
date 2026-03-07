import { 
    getHomePage, 
    getAZList,
    getQtipInfo,
    getAnimeAboutInfo,
    getAnimeSearchResults,
    getAnimeSearchSuggestion,
    getProducerAnimes,
    getGenreAnime,
    getAnimeCategory,
    getEstimatedSchedule,
    getNextEpisodeSchedule,
    getAnimeEpisodes,
    getEpisodeServers,
    getAnimeEpisodeSources,
} from "./procedures/anime";

export const animeRouter = {
    anime: {
        getHomePage,
        getAZList,
        getQtipInfo,
        getAnimeAboutInfo,
        getAnimeSearchResults,
        getAnimeSearchSuggestion,
        getProducerAnimes,
        getGenreAnime,
        getAnimeCategory,
        getEstimatedSchedule,
        getNextEpisodeSchedule,
        getAnimeEpisodes,
        getEpisodeServers,
        getAnimeEpisodeSources,
    }
}

export type TAnimeRouter = typeof animeRouter;