export interface Album {
    id: number;
    name: string;
    description: string;
    type: string;
    release_date: string;
    spotify_id?: string;
    tracks: Track[];
    track_count: number;
    award_id: string;
    award_number: number;
}

export interface Track {
    id: number;
    name: string;
    feat: string[];
    spotify_id?: string;
    description: string;
    award_id: number;
    award_number: number;
}