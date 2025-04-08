import { z } from 'zod';

export const ArtistSchema = z.object({
  name: z.string().min(1, "Artist name is required"),
  biography: z.string().min(10, "Biography must be at least 10 characters"),
  imageUrl: z.string().url("Must be a valid URL")
});

export const LatestReleaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  releaseDate: z.string().min(1, "Release date is required"),
  coverImageUrl: z.string().url("Must be a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters")
});

export type Artist = z.infer<typeof ArtistSchema>;
export type LatestRelease = z.infer<typeof LatestReleaseSchema>;