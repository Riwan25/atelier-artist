import { z } from 'zod';

export const ArtistSchema = z.object({
    name: z.string().min(1, "Artist name is required"),
    biography: z.string().min(10, "Biography must be at least 10 characters"),
    imageUrl: z.string().url("Must be a valid URL")
});

export const TrackSchema = z.object({
    title: z.string().min(1, "Title is required"),
    releaseDate: z.string().min(1, "Release date is required"),
    coverImageUrl: z.string().url("Must be a valid URL").optional(),
    coverImagePath: z.string().optional(),
    description: z.string().min(10, "Description must be at least 10 characters")
});

export const AlbumSchema = z.object({
    title: z.string().min(1, "Title is required"),
    releaseDate: z.string().min(1, "Release date is required"),
    coverImageUrl: z.string().url("Must be a valid URL").optional(),
    coverImagePath: z.string().optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    isSelling: z.boolean().optional(),
    cost: z.number().min(0, "Cost must be a positive number").optional()    
});

export type Artist = z.infer<typeof ArtistSchema>;
export type Track = z.infer<typeof TrackSchema>;
export type Album = z.infer<typeof AlbumSchema>;