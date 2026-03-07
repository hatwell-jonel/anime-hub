"use client";
import { useRef } from 'react'
import { Spinner } from '@/components/ui/spinner';
import { getProxyUrl } from '@/lib/proxy';
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  type MediaPlayerInstance,
} from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import useWatchAnime from './hooks/use-watch-anime';

function LandingPage() {
  
  const id = "one-piece-100";
  const episode = '1';
  const currentEpisode = parseInt(episode);
  const playerRef = useRef<MediaPlayerInstance>(null);


  const {
    currentAnime,
    streamingSources,
    subtitles,
    thumbnailTrack,
    currentAnimeEpisodeLoading,
    animeQtipInfo
  } = useWatchAnime({
    animeId: id,
    episodeId: currentEpisode,
    selectedCategory: 'sub',
    selectedServer: 'hd-2',
  });

    if (currentAnime.isLoading || animeQtipInfo.isLoading ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8 text-red-500" />
      </div>
    );
  }

  if (!currentAnime.data?.anime?.info || !animeQtipInfo.data?.anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">Anime info not found.</p>
      </div>
    );
  }

  const { info } = currentAnime.data.anime;

  // const { data: animeData, isLoading: infoLoading } = useQuery(
  //   orpc.anime.getAboutInfo.queryOptions({ 
  //     input: { id } 
  //   }),
  // );

  // const { data: episodesData, isLoading: episodesLoading } = useQuery({
  //   ...orpc.anime.getEpisodes.queryOptions({ input: { id } }),
  //   refetchOnWindowFocus: false,
  //   placeholderData: keepPreviousData,
  // });

  // const allEpisodes = useMemo(
  //   () => episodesData?.episodes ?? [],
  //   [episodesData?.episodes],
  // );
  // const currentEpisodeData = allEpisodes.find(
  //   (ep) => ep.number === currentEpisode,
  // );
  // const episodeId = currentEpisodeData?.episodeId;

  // const { data: serversData } = useQuery({
  //   ...orpc.anime.getEpisodeServers.queryOptions({
  //     input: { episodeId: episodeId ?? "" },
  //   }),
  //   enabled: !!episodeId,
  //   refetchOnWindowFocus: false,
  //   placeholderData: keepPreviousData,
  // });

  
  // const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
  //   ...orpc.anime.getEpisodeSources.queryOptions({
  //     input: {
  //       episodeId: episodeId ?? "",
  //       server: 'hd-2',
  //       category: 'sub',
  //     },
  //   }),
  //   enabled: !!episodeId,
  //   refetchOnWindowFocus: false,
  //   placeholderData: keepPreviousData,
  // });

  // const anime = animeData?.anime;

  
  // if (infoLoading) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <Spinner className="size-10 text-foreground/20" />
  //     </div>
  //   );
  // }

  // if (!anime) {
  //   notFound();
  // }

  // const info = anime.info;
  
  // if (!info.poster || !info.name) {
  //   notFound();
  // }

  // const streamingSources = sourcesData?.sources ?? [];
  //   const allTracks =
  //   (sourcesData as { tracks?: { url: string; lang: string }[] })?.tracks ?? [];
  // const thumbnailTrack = allTracks.find(
  //   (t) => t.lang.toLowerCase() === "thumbnails",
  // );
  // const subtitles = allTracks.filter(
  //   (t) => t.lang.toLowerCase() !== "thumbnails",
  // );

  return (
              <div className="relative rounded-lg md:rounded-2xl overflow-hidden">
                <div className="aspect-video relative">
                  {currentAnimeEpisodeLoading ? (
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
                      key={`${episode}`}
                      src={{
                        src: getProxyUrl(streamingSources[0]?.url),
                        type: "application/x-mpegurl",
                      }}
                      viewType="video"
                      streamType="on-demand"
                      playsInline
                      className="w-full h-full"
                    >
                      <MediaProvider>
                        <Poster
                          className="vds-poster object-cover object-center"
                          src={getProxyUrl(String(info?.poster))}
                          alt={info?.name ?? "Poster"}
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
                      {/* <Image
                        src={info.poster}
                        alt={`${info.name} Episode ${currentEpisode}`}
                        fill
                        className="object-cover opacity-30 blur-sm"
                      /> */}
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
  )
}

export default LandingPage