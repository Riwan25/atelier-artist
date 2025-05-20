import {
    Box,
    CardMedia,
    Container,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Carousel } from '../components/Carousel';
import { Artist } from '../types';

export const Home = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [artist, setArtist] = useState<Artist | null>(null);

    // Fetch albums from API
    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await fetch(
                    'http://localhost/atelier/atelier-artist/api/album/index.php?artist=Luther'
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch albums');
                }
                const data = await response.json();
                setArtist(data || null);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching albums:', err);
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Unknown error occurred'
                );
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);
    console.log(artist);
    return (
        <Container sx={{ py: 4 }}>
            {/* Artist Introduction Section */}
            <Paper elevation={3} sx={{ mb: 6, p: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Box sx={{ width: { xs: '100%', md: '30%' } }}>
                        <CardMedia
                            component="img"
                            src={'/assets/luther-bio.jpg'}
                            alt={artist?.name}
                            sx={{
                                height: 300,
                                borderRadius: 2,
                                objectFit: 'cover',
                            }}
                        />
                    </Box>
                    <Box sx={{ width: { xs: '100%', md: '70%' } }}>
                        <Typography variant="h2" component="h1" gutterBottom>
                            {artist?.name}
                        </Typography>
                        <Typography variant="body1">
                            {artist?.description}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Album Carousel */}
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom>
                    Discographie
                </Typography>

                {loading ? (
                    <Typography>Loading albums...</Typography>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : artist && artist.albums && artist.albums.length > 0 ? (
                    <Box>
                        <Carousel albums={artist.albums} />
                    </Box>
                ) : (
                    <Typography>Aucun album trouvé</Typography>
                )}
            </Box>
        </Container>
    );
};
