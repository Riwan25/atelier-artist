export interface Album {
    id: number;
    artist_id: number;
    artist_name: string;
    name: string;
    description: string;
    type: string;
    release_date: string;
    spotify_id?: string;
    tracks?: Track[];
    track_count?: number;
    award_id?: number;
    award_number?: number;
    isSelling?: number;
    cost?: number;
}

export interface Track {
    id: number;
    artist_id: number;
    artister_name: string;
    album_id?: number;
    album_name: string;
    name: string;
    description?: string;
    release_date?: string;
    feat?: string[];
    spotify_id?: string;
    award_id?: number;
    award_number?: number;
}

export interface Artist {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    albums?: Album[];
}
