import { getAniwatchScraper } from "@/lib/aniwatch/scaper";
import { os } from "@orpc/server";
import type { HiAnime } from "aniwatch";
import * as z from "zod";

// SCHEMAS
const animeIdSchema = z.object({
    animeId: z.string().min(1),
});

const episodeIdSchema = z.object({
    episodeId: z.string().min(1),
});

const azListLetters = [
  "all",
  "other",
  "0-9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
] as const;

const azListSchema = z.object({
  letter: z.enum(azListLetters),
  page: z.number().optional().default(1),
});

const searchSchema = z.object({
  query: z.string().min(1),
  page: z.number().optional().default(1),
  filters: z
    .object({
      type: z.string().optional(),
      status: z.string().optional(),
      rated: z.string().optional(),
      score: z.string().optional(),
      season: z.string().optional(),
      language: z.string().optional(),
      genres: z.string().optional(),
      sort: z.string().optional(),
    })
    .optional(),
});

const producerSchema = z.object({
  producer: z.string().min(1),
  page: z.number().optional().default(1),
});

const genreSchema = z.object({
  genre: z.string().min(1),
  page: z.number().optional().default(1),
});



const animeCategories = [
    "most-favorite",
    "most-popular",
    "subbed-anime",
    "dubbed-anime",
    "recently-updated",
    "recently-added",
    "top-upcoming",
    "top-airing",
    "movie",
    "special",
    "ova",
    "ona",
    "tv",
    "completed",
] as const;

const animeCategorySchema = z.object({
    category: z.enum(animeCategories),
    page: z.number().optional().default(1),
});

const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});


const animeServers = [
  "hd-1",
  "hd-2",
  "megacloud",
  "streamsb",
  "streamtape",
] as const;

const episodeSourcesSchema = z.object({
  episodeId: z.string().min(1),
  server: z.enum(animeServers).optional().default("hd-2"),
  category: z.enum(["sub", "dub", "raw"]).optional().default("sub"),
});
// =============================================================================

const hianime = getAniwatchScraper();

export const getHomePage = os.handler(async () : Promise<HiAnime.ScrapedHomePage> => {
    const data = await hianime.getHomePage();
    return data;
});

export const getAZList = os.input(azListSchema).handler(async ({ input }) : Promise<HiAnime.ScrapedAnimeAZList> => {
    const data = await hianime.getAZList(input.letter, input.page);
    return data;
});

export const getQtipInfo = os.input(animeIdSchema).handler(async ({input}) : Promise<HiAnime.ScrapedAnimeQtipInfo> => {
    const data = await hianime.getQtipInfo(input.animeId);
    return data;
});

export const getAnimeAboutInfo = os.input(animeIdSchema).handler(async ({input}) : Promise<HiAnime.ScrapedAnimeAboutInfo> => {
    const data = await hianime.getInfo(input.animeId);
    return data;
});

export const getAnimeSearchResults = os.input(searchSchema).handler(async ({input}) : Promise<HiAnime.ScrapedAnimeSearchResult> => {
    const data = await hianime.search(input.query, input.page, input.filters);
    return data;
});

export const getAnimeSearchSuggestion = os.input(searchSchema).handler(async ({input}) : Promise<HiAnime.ScrapedAnimeSearchSuggestion> => {
    const data = await hianime.searchSuggestions(input.query);
    return data;
});

export const getProducerAnimes = os.input(producerSchema).handler(async ({input}) : Promise<HiAnime.ScrapedProducerAnime> => {
    const data = await hianime.getProducerAnimes(input.producer, input.page);
    return data;
});

export const getGenreAnime = os.input(genreSchema).handler(async ({input}) : Promise<HiAnime.ScrapedGenreAnime> => {
    const data = await hianime.getGenreAnime(input.genre, input.page);
    return data;
});

export const getAnimeCategory = os.input(animeCategorySchema).handler(async ({input}) : Promise<HiAnime.ScrapedAnimeCategory> => {
    const data = await hianime.getCategoryAnime(input.category, input.page);
    return data;
});

export const getEstimatedSchedule = os.input(scheduleSchema).handler(async ({input}) : Promise<HiAnime.ScrapedEstimatedSchedule> => {
    const data = await hianime.getEstimatedSchedule(input.date);
    return data;
});

export const getNextEpisodeSchedule = os.input(animeIdSchema).handler(async ({input}) : Promise<HiAnime.ScrapedNextEpisodeSchedule> => {
    const data = await hianime.getNextEpisodeSchedule(input.animeId);
    return data;
});

export const getAnimeEpisodes = os.input(animeIdSchema).handler(async ({input}) : Promise<HiAnime.ScrapedAnimeEpisodes> => {
    const data = await hianime.getEpisodes(input.animeId);
    return data;
});

export const getEpisodeServers = os.input(episodeIdSchema).handler(async ({input}) : Promise<HiAnime.ScrapedEpisodeServers> => {
    const data = await hianime.getEpisodeServers(input.episodeId);
    return data;
});

type ExtendedEpisodeSources = HiAnime.ScrapedAnimeEpisodesSources & {
    intro?: { start: number; end: number } | null;
    outro?: { start: number; end: number } | null;
    tracks?: { url: string; lang: string }[];
};

export const getAnimeEpisodeSources = os.input(episodeSourcesSchema).handler(async ({input}) : Promise<ExtendedEpisodeSources> => {
    const data = await hianime.getEpisodeSources(input.episodeId);
    return data;
});
