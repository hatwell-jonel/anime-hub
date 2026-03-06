"use client";

import { useMemo, use, useCallback, useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  isHLSProvider,
  type MediaProviderAdapter,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { orpc } from "@/lib/query/orpc";
import { getProxyUrl } from "@/lib/proxy";
import { Spinner } from "@/components/ui/spinner";
interface PageProps {
  params: Promise<{ id: string; episode: string }>;
}

const animeServers = [
  "hd-1",
  "hd-2",
  "megacloud",
  "streamsb",
  "streamtape",
] as const;
type AnimeServer = (typeof animeServers)[number];

export default function WatchPage() {
  const id = "one-piece-100";
  const episode = '1';
  const currentEpisode = parseInt(episode);
  const playerRef = useRef<MediaPlayerInstance>(null);
  const hasRestoredRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  const animeInfoRef = useRef<{ poster?: string; name?: string }>({});
  const hasTriggeredAutoNextRef = useRef(false);
  const hasAutoSkippedIntroRef = useRef(false);
  const hasAutoSkippedOutroRef = useRef(false);
  const sourcesDataRef = useRef<{
    intro?: { start: number; end: number } | null;
    outro?: { start: number; end: number } | null;
  }>({});

  // const onProviderChange = useCallback(
  //   (provider: MediaProviderAdapter | null) => {
  //     if (isHLSProvider(provider)) {
  //       provider.config = {
  //         xhrSetup(xhr) {
  //           xhr.withCredentials = false;
  //         },
  //       };
  //     }
  //   },
  //   [],
  // );

  // Reset restored flag when episode changes
  useEffect(() => {
    hasRestoredRef.current = false;
    lastSaveTimeRef.current = 0;
    hasTriggeredAutoNextRef.current = false;
    hasAutoSkippedIntroRef.current = false;
    hasAutoSkippedOutroRef.current = false;
  }, [id, currentEpisode]);

  // Derive whether to show countdown (only show for current episode)
  const { data: animeData, isLoading: infoLoading } = useQuery(
    orpc.anime.getAboutInfo.queryOptions({ input: { id } }),
  );

  const { data: episodesData, isLoading: episodesLoading } = useQuery({
    ...orpc.anime.getEpisodes.queryOptions({ input: { id } }),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const allEpisodes = useMemo(
    () => episodesData?.episodes ?? [],
    [episodesData?.episodes],
  );
  const currentEpisodeData = allEpisodes.find(
    (ep) => ep.number === currentEpisode,
  );
  const episodeId = currentEpisodeData?.episodeId;

  const { data: serversData } = useQuery({
    ...orpc.anime.getEpisodeServers.queryOptions({
      input: { episodeId: episodeId ?? "" },
    }),
    enabled: !!episodeId,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    ...orpc.anime.getEpisodeSources.queryOptions({
      input: {
        episodeId: episodeId ?? "",
        server: 'hd-2',
        category: 'sub',
      },
    }),
    enabled: !!episodeId,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const anime = animeData?.anime;

  // Keep anime info ref in sync for progress saving
  useEffect(() => {
    if (anime?.info) {
      animeInfoRef.current = {
        poster: anime.info.poster ?? undefined,
        name: anime.info.name ?? undefined,
      };
    }
  }, [anime?.info]);

  // Keep sources data ref in sync for auto-skip
  useEffect(() => {
    sourcesDataRef.current = {
      intro: sourcesData?.intro ?? null,
      outro:
        (sourcesData as { outro?: { start: number; end: number } })?.outro ??
        null,
    };
  }, [sourcesData]);


  if (infoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-10 text-foreground/20" />
      </div>
    );
  }

  if (!anime) {
    notFound();
  }

  const info = anime.info;

  if (!info.poster || !info.name) {
    notFound();
  }

  const subServers = serversData?.sub ?? [];
  const dubServers = serversData?.dub ?? [];
  const streamingSources = sourcesData?.sources ?? [];
  const allTracks =
    (sourcesData as { tracks?: { url: string; lang: string }[] })?.tracks ?? [];
  const thumbnailTrack = allTracks.find(
    (t) => t.lang.toLowerCase() === "thumbnails",
  );
  const subtitles = allTracks.filter(
    (t) => t.lang.toLowerCase() !== "thumbnails",
  );
  const intro = sourcesData?.intro ?? null;
  const outro =
    (sourcesData as { outro?: { start: number; end: number } })?.outro ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-150 h-150 rounded-full opacity-3"
          style={{
            background:
              "radial-gradient(circle, oklch(0.98 0 0) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      {/* Header Breadcrumb */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] md:pt-[calc(env(safe-area-inset-top,0px)+1rem)] pb-3 md:pb-4 px-4 md:px-6 bg-linear-to-b from-background/90 to-transparent">
        <div className="flex justify-center">
          <nav className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm w-full max-w-[1300px]">
            <Link
              href="/"
              className="font-semibold tracking-tight text-foreground/90 hover:text-foreground transition-colors shrink-0"
            >
              anirohi
            </Link>
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-foreground/30 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href={`/anime/${id}`}
              className="text-foreground/50 hover:text-foreground transition-colors truncate max-w-30 md:max-w-75"
            >
              {info.name}
            </Link>
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-foreground/30 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-foreground/70 shrink-0">
              EP {currentEpisode}
            </span>
          </nav>
        </div>
      </header>

      {/* Main Layout */}
      <div className="min-h-screen pt-14 md:pt-16 pb-6 md:pb-8 px-4 md:px-6 flex justify-center">
        <div className="flex flex-col xl:flex-row gap-0 xl:gap-6 w-full max-w-[1300px]">
          {/* Video Area */}
          <main className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col w-full">
              {/* Video Player */}
              <div className="relative rounded-lg md:rounded-2xl overflow-hidden">
                <div className="aspect-video relative">
                  {sourcesLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <div className="flex flex-col items-center gap-4">
                        <Spinner className="size-8 text-foreground/30" />
                        <p className="text-sm text-foreground/40">
                          Loading stream...
                        </p>
                      </div>
                    </div>
                  ) : streamingSources.length > 0 ? (
                    <MediaPlayer
                      ref={playerRef}
                      key={`${episodeId}}`}
                      src={{
                        src: getProxyUrl(streamingSources[0]?.url),
                        type: "application/x-mpegurl",
                      }}
                      viewType="video"
                      streamType="on-demand"
                      playsInline
                      crossOrigin="anonymous"
                      className="w-full h-full"
                    >
                      <MediaProvider>
                        <Poster
                          className="vds-poster object-cover object-center"
                          src={getProxyUrl(info.poster)}
                          alt={`${info.name} Episode ${currentEpisode}`}
                        />
                      </MediaProvider>
                      {subtitles.map((subtitle, index) => {
                        return (
                          <Track
                            key={`${subtitle.lang}-${index}`}
                            src={getProxyUrl(subtitle.url)}
                            kind="subtitles"
                            label={subtitle.lang}
                            language={subtitle.lang.toLowerCase().slice(0, 2)}
                            default={true}
                          />
                        );
                      })}
                      <DefaultVideoLayout
                        icons={defaultLayoutIcons}
                        thumbnails={
                          thumbnailTrack
                            ? getProxyUrl(thumbnailTrack.url)
                            : undefined
                        }
                      />
                    </MediaPlayer>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-6 h-6 text-foreground/30"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          </div>
                          <p className="text-foreground/60 text-sm mb-1">
                            Video unavailable
                          </p>
                          <p className="text-foreground/30 text-xs">
                            Try selecting a different server
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>

        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: oklch(0.98 0 0 / 10%);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: oklch(0.98 0 0 / 20%);
        }
      `}</style>
    </div>
  );
}
