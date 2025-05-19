import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Container,
    Divider,
    List,
    ListItem,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spotify } from 'react-spotify-embed';
import { Awards } from '../components/Awards';
import { Album as AlbumType } from '../types';

export const Album = () => {
    const { id } = useParams<{ id: string }>();
    const [album, setAlbum] = useState<AlbumType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch album details from API
    useEffect(() => {
        const fetchAlbumDetails = async () => {
            try {
                const response = await fetch(
                    `http://localhost/atelier/atelier-artist/api/album/index.php?album_id=${id}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch album details');
                }
                const data = await response.json();
                setAlbum(data.album || null);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching album details:', err);
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unknown error occurred'
                );
                setLoading(false);
            }
        };

        if (id) {
            fetchAlbumDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography>Loading album details...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    if (!album) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography>Album not found</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                    <Box sx={{ width: { xs: '100%', md: 300 } }}>
                        <Spotify
                            link={`https://open.spotify.com/album/${album.spotify_id}`}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h3" component="h1" gutterBottom>
                            {album.name} <Awards elem={album} size="xs" />
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            gutterBottom
                        >
                            {album.type} •{' '}
                            {new Date(album.release_date).getFullYear()}
                        </Typography>
                        <Typography variant="body1">
                            {album.description}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Tracks
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List>
                    {album.tracks.map((track, index) => (
                        <ListItem
                            key={track.id}
                            divider={index < album.tracks.length - 1}
                            sx={{ px: 2 }}
                        >
                            <Accordion sx={{ width: '100%' }}>
                                <AccordionSummary
                                    sx={{
                                        width: '100%',
                                    }}
                                    expandIcon={
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            size="lg"
                                        />
                                    }
                                >
                                    <Spotify
                                        wide
                                        link={`https://open.spotify.com/track/${track.spotify_id}`}
                                        style={{
                                            paddingRight: '10px',
                                        }}
                                    />
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="h6">
                                        {track.name} <Awards elem={track} />
                                    </Typography>
                                    {track.feat.length > 0 && (
                                        <Typography variant="subtitle1">
                                            Feat. {track.feat.join(', ')}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {track.description
                                            ? track.description
                                            : 'Aucune description disponible'}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </ListItem>
                    ))}
                </List>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                >
                    {album.track_count} tracks
                </Typography>
            </Box>
        </Container>
    );
};
