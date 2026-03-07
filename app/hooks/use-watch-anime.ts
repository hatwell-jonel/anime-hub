'use client';

import { orpc } from '@/lib/query/orpc';
import { TAnimeAudio, TAnimeServer } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface UseWatchAnimeProps {
    animeId : string;
    episodeId: number,
    selectedCategory: TAnimeAudio,
    selectedServer: TAnimeServer
}

const MINUTE =  60 * 1000; // 1 minute in milliseconds

function useWatchAnime(data : UseWatchAnimeProps) {
    const { 
        animeId,
        episodeId,
        selectedCategory,
        selectedServer,
    } = data;

    const currentAnime = useQuery({
        ...orpc.anime.getAnimeAboutInfo.queryOptions({
            input: { animeId },
        }),
        staleTime: 5 * MINUTE,
    });

    const animeQtipInfo = useQuery({
        ...orpc.anime.getQtipInfo.queryOptions({
            input: { animeId },
        }),
        staleTime: 5 * MINUTE,
    });

    const currentAnimeEpisode = useQuery({
        ...orpc.anime.getAnimeEpisodes.queryOptions({
            input: { animeId },
        }),
        staleTime: 5 * MINUTE,
    });

    const currentAnimeEpisodeLoading = currentAnimeEpisode.isLoading;
    const allEpisodes = currentAnimeEpisode.data?.episodes ?? [];
    const openedEpisode = allEpisodes.find((ep) => ep.number === Number(episodeId));
    
    const episodeServers = useQuery({
        ...orpc.anime.getEpisodeServers.queryOptions({
        input: { episodeId: String(openedEpisode?.episodeId) },
        }),
        enabled: !!openedEpisode?.episodeId,
        staleTime: 5 * MINUTE,
    });

    const episodeSources = useQuery({
        ...orpc.anime.getAnimeEpisodeSources.queryOptions({
            input: {
                episodeId: String(openedEpisode?.episodeId),
                category: selectedCategory,
                server: selectedServer,
            },
        }),
        enabled: 
            !!openedEpisode?.episodeId 
            && !!selectedCategory 
            && !!selectedServer,
        staleTime: 5 * MINUTE,
        placeholderData: (prev) => prev,
    });

    const { streamingSources, allTracks, thumbnailTrack, subtitles } = useMemo(() => {
        const sources = episodeSources.data?.sources ?? [];
        const tracks = episodeSources.data?.tracks ?? [];

        const thumbnail = tracks.find(
            (t) => t.lang.toLowerCase() === "thumbnails"
        );

        const subs = tracks.filter(
            (t) => t.lang.toLowerCase() !== "thumbnails"
        );

        return {
            streamingSources: sources,
            allTracks: tracks,
            thumbnailTrack: thumbnail,
            subtitles: subs,
        };
    }, [episodeSources.data]);

    return {
        animeQtipInfo,
        currentAnime,
        currentAnimeEpisode,
        currentAnimeEpisodeLoading,
        episodeServers,
        episodeSources,
        streamingSources,
        allTracks,
        thumbnailTrack,
        subtitles,
        allEpisodes
    }
}

export default useWatchAnime


/**
 * NOTES:
 * staleTime in React Query defines how long the data fetched by a query is considered fresh.
 */