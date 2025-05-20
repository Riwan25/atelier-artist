import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    GridLegacy as Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Album, Track } from '../types';
import { useApi } from '../utils/api';

interface Artist {
    id: number;
    name: string;
}

interface Award {
    id: number;
    name: string;
}

interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [awards, setAwards] = useState<Award[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    }); // Form states
    const [albumForm, setAlbumForm] = useState({
        id: 0,
        artist_id: 0,
        name: '',
        description: '',
        type: '',
        release_date: '',
        spotify_id: '',
        award_id: 0,
        award_number: 0,
        isSelling: 0,
        cost: 0,
    });

    const [trackForm, setTrackForm] = useState({
        id: 0,
        artist_id: 0,
        album_id: 0,
        name: '',
        description: '',
        release_date: '',
        feat: [] as string[],
        spotify_id: '',
        award_id: 0,
        award_number: 0,
    });

    // Edit mode
    const [editMode, setEditMode] = useState({
        album: false,
        track: false,
    });

    useEffect(() => {
        // Redirect if not authenticated or not admin
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/');
            return;
        }

        // Fetch data when component mounts
        fetchData();
    }, [isAuthenticated, user, navigate]);
    const api = useApi();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch artists
            const artistsData = await api.get('/artists/index.php');
            setArtists(artistsData.artists || []);

            // Fetch albums
            const albumsData = await api.get('/album/index.php');
            setAlbums(albumsData.albums || []);

            // Fetch tracks
            const tracksData = await api.get('/tracks/index.php');
            setTracks(tracksData.tracks || []);

            // Fetch awards
            const awardsData = await api.get('/awards/index.php');
            setAwards(awardsData.awards || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to fetch data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        setTabValue(newValue);
    };

    const handleAlbumFormChange = (
        e:
            | React.ChangeEvent<
                  HTMLInputElement | { name?: string; value: unknown }
              >
            | SelectChangeEvent<number>
    ) => {
        const { name, value } = e.target;
        setAlbumForm({
            ...albumForm,
            [name as string]: value,
        });
    };
    const handleTrackFormChange = (
        e:
            | React.ChangeEvent<
                  HTMLInputElement | { name?: string; value: unknown }
              >
            | SelectChangeEvent<number>
    ) => {
        const { name, value } = e.target;

        // Special handling for feat field to convert comma-separated string to array
        if (name === 'feat' && typeof value === 'string') {
            // Split by comma and trim whitespace
            const featArray = value
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item !== '');
            setTrackForm({
                ...trackForm,
                [name]: featArray,
            });
        } else {
            setTrackForm({
                ...trackForm,
                [name as string]: value,
            });
        }
    };
    const resetAlbumForm = () => {
        setAlbumForm({
            id: 0,
            artist_id: 0,
            name: '',
            description: '',
            type: '',
            release_date: '',
            spotify_id: '',
            award_id: 0,
            award_number: 0,
            isSelling: 0,
            cost: 0,
        });
        setEditMode({ ...editMode, album: false });
    };

    const resetTrackForm = () => {
        setTrackForm({
            id: 0,
            artist_id: 0,
            album_id: 0,
            name: '',
            description: '',
            release_date: '',
            feat: [],
            spotify_id: '',
            award_id: 0,
            award_number: 0,
        });
        setEditMode({ ...editMode, track: false });
    };

    const showNotification = (
        message: string,
        severity: 'success' | 'error'
    ) => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseNotification = () => {
        setNotification({
            ...notification,
            open: false,
        });
    };
    const handleSubmitAlbum = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (editMode.album) {
                // Update existing album
                await api.put(
                    `/album/update.php?id=${albumForm.id}`,
                    albumForm
                );
            } else {
                // Create new album
                await api.post('/album/create.php', albumForm);
            }

            showNotification(
                `Album ${editMode.album ? 'updated' : 'created'} successfully`,
                'success'
            );
            resetAlbumForm();
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error saving album:', error);
            showNotification(
                `Error ${editMode.album ? 'updating' : 'creating'} album`,
                'error'
            );
        }
    };
    const handleSubmitTrack = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (editMode.track) {
                // Update existing track
                await api.put(
                    `/tracks/update.php?id=${trackForm.id}`,
                    trackForm
                );
            } else {
                // Create new track
                await api.post('/tracks/create.php', trackForm);
            }

            showNotification(
                `Track ${editMode.track ? 'updated' : 'created'} successfully`,
                'success'
            );
            resetTrackForm();
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error saving track:', error);
            showNotification(
                `Error ${editMode.track ? 'updating' : 'creating'} track`,
                'error'
            );
        }
    };
    const handleEditAlbum = (album: Album) => {
        setAlbumForm({
            id: album.id,
            artist_id: album.artist_id,
            name: album.name,
            description: album.description || '',
            type: album.type || '',
            release_date: album.release_date || '',
            spotify_id: album.spotify_id || '',
            award_id: album.award_id || 0,
            award_number: album.award_number || 0,
            isSelling: album.isSelling || 0,
            cost: album.cost || 0,
        });
        setEditMode({ ...editMode, album: true });
        setTabValue(0);
    };

    const handleEditTrack = (track: Track) => {
        setTrackForm({
            id: track.id,
            artist_id: track.artist_id,
            album_id: track.album_id || 0,
            name: track.name,
            description: track.description || '',
            release_date: track.release_date || '',
            feat: track.feat || [],
            spotify_id: track.spotify_id || '',
            award_id: track.award_id || 0,
            award_number: track.award_number || 0,
        });
        setEditMode({ ...editMode, track: true });
        setTabValue(1);
    };
    const handleDeleteAlbum = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this album?')) {
            try {
                await api.delete(`/album/delete.php?id=${id}`);

                showNotification('Album deleted successfully', 'success');
                fetchData(); // Refresh data
            } catch (error) {
                console.error('Error deleting album:', error);
                showNotification('Error deleting album', 'error');
            }
        }
    };

    const handleDeleteTrack = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this track?')) {
            try {
                await api.delete(`/tracks/delete.php?id=${id}`);

                showNotification('Track deleted successfully', 'success');
                fetchData(); // Refresh data
            } catch (error) {
                console.error('Error deleting track:', error);
                showNotification('Error deleting track', 'error');
            }
        }
    };

    if (isLoading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Typography>Loading...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
                Admin Dashboard
            </Typography>
            <Paper sx={{ p: 2, mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="admin tabs"
                >
                    <Tab label="Manage Albums" id="tab-0" />
                    <Tab label="Manage Tracks" id="tab-1" />
                </Tabs>

                {/* Album Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h5" gutterBottom>
                        {editMode.album ? 'Edit Album' : 'Create New Album'}
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmitAlbum}
                        noValidate
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="artist-label">
                                        Artist
                                    </InputLabel>
                                    <Select
                                        labelId="artist-label"
                                        id="artist_id"
                                        name="artist_id"
                                        value={albumForm.artist_id}
                                        onChange={handleAlbumFormChange}
                                        required
                                    >
                                        <MenuItem value={0}>
                                            Select Artist
                                        </MenuItem>
                                        {artists.map((artist) => (
                                            <MenuItem
                                                key={artist.id}
                                                value={artist.id}
                                            >
                                                {artist.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Album Name"
                                    name="name"
                                    value={albumForm.name}
                                    onChange={handleAlbumFormChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="description"
                                    label="Description"
                                    name="description"
                                    multiline
                                    rows={3}
                                    value={albumForm.description}
                                    onChange={handleAlbumFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="type"
                                    label="Type"
                                    name="type"
                                    value={albumForm.type}
                                    onChange={handleAlbumFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="release_date"
                                    label="Release Date"
                                    name="release_date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={albumForm.release_date}
                                    onChange={handleAlbumFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="spotify_id"
                                    label="Spotify ID"
                                    name="spotify_id"
                                    value={albumForm.spotify_id}
                                    onChange={handleAlbumFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="award-label">
                                        Award
                                    </InputLabel>
                                    <Select
                                        labelId="award-label"
                                        id="award_id"
                                        name="award_id"
                                        value={albumForm.award_id}
                                        onChange={handleAlbumFormChange}
                                    >
                                        <MenuItem value={0}>No Award</MenuItem>
                                        {awards.map((award) => (
                                            <MenuItem
                                                key={award.id}
                                                value={award.id}
                                            >
                                                {award.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>{' '}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="award_number"
                                    label="Award Number"
                                    name="award_number"
                                    type="number"
                                    value={albumForm.award_number}
                                    onChange={handleAlbumFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="isSelling-label">
                                        Selling Status
                                    </InputLabel>
                                    <Select
                                        labelId="isSelling-label"
                                        id="isSelling"
                                        name="isSelling"
                                        value={albumForm.isSelling}
                                        onChange={handleAlbumFormChange}
                                    >
                                        <MenuItem value={0}>
                                            Not for Sale
                                        </MenuItem>
                                        <MenuItem value={1}>For Sale</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="cost"
                                    label="Price"
                                    name="cost"
                                    type="number"
                                    InputProps={{
                                        startAdornment: <span>$</span>,
                                    }}
                                    value={albumForm.cost}
                                    onChange={handleAlbumFormChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        {editMode.album
                                            ? 'Update Album'
                                            : 'Create Album'}
                                    </Button>
                                    {editMode.album && (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={resetAlbumForm}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                        Album List
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                {' '}
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Artist</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Release Date</TableCell>
                                    <TableCell>For Sale</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {albums.length > 0 ? (
                                    albums.map((album) => (
                                        <TableRow key={album.id}>
                                            <TableCell>{album.id}</TableCell>
                                            <TableCell>{album.name}</TableCell>
                                            <TableCell>
                                                {album.artist_name}
                                            </TableCell>{' '}
                                            <TableCell>{album.type}</TableCell>
                                            <TableCell>
                                                {album.release_date}
                                            </TableCell>
                                            <TableCell>
                                                {album.isSelling ? 'Yes' : 'No'}
                                            </TableCell>
                                            <TableCell>
                                                {album.cost
                                                    ? `$${album.cost}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            handleEditAlbum(
                                                                album
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() =>
                                                            handleDeleteAlbum(
                                                                album.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No albums found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Track Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h5" gutterBottom>
                        {editMode.track ? 'Edit Track' : 'Create New Track'}
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmitTrack}
                        noValidate
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="track-artist-label">
                                        Artist
                                    </InputLabel>
                                    <Select
                                        labelId="track-artist-label"
                                        id="artist_id"
                                        name="artist_id"
                                        value={trackForm.artist_id}
                                        onChange={handleTrackFormChange}
                                        required
                                    >
                                        <MenuItem value={0}>
                                            Select Artist
                                        </MenuItem>
                                        {artists.map((artist) => (
                                            <MenuItem
                                                key={artist.id}
                                                value={artist.id}
                                            >
                                                {artist.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="album-label">
                                        Album
                                    </InputLabel>
                                    <Select
                                        labelId="album-label"
                                        id="album_id"
                                        name="album_id"
                                        value={trackForm.album_id}
                                        onChange={handleTrackFormChange}
                                    >
                                        <MenuItem value={0}>No Album</MenuItem>
                                        {albums
                                            .filter(
                                                (album) =>
                                                    trackForm.artist_id === 0 ||
                                                    album.artist_id ===
                                                        trackForm.artist_id
                                            )
                                            .map((album) => (
                                                <MenuItem
                                                    key={album.id}
                                                    value={album.id}
                                                >
                                                    {album.name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Track Name"
                                    name="name"
                                    value={trackForm.name}
                                    onChange={handleTrackFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="release_date"
                                    label="Release Date"
                                    name="release_date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={trackForm.release_date}
                                    onChange={handleTrackFormChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="description"
                                    label="Description"
                                    name="description"
                                    multiline
                                    rows={3}
                                    value={trackForm.description}
                                    onChange={handleTrackFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                {' '}
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="feat"
                                    label="Featuring Artists (comma separated)"
                                    name="feat"
                                    value={
                                        Array.isArray(trackForm.feat)
                                            ? trackForm.feat.join(', ')
                                            : ''
                                    }
                                    onChange={handleTrackFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="spotify_id"
                                    label="Spotify ID"
                                    name="spotify_id"
                                    value={trackForm.spotify_id}
                                    onChange={handleTrackFormChange}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="track-award-label">
                                        Award
                                    </InputLabel>
                                    <Select
                                        labelId="track-award-label"
                                        id="award_id"
                                        name="award_id"
                                        value={trackForm.award_id}
                                        onChange={handleTrackFormChange}
                                    >
                                        <MenuItem value={0}>No Award</MenuItem>
                                        {awards.map((award) => (
                                            <MenuItem
                                                key={award.id}
                                                value={award.id}
                                            >
                                                {award.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    id="award_number"
                                    label="Award Number"
                                    name="award_number"
                                    type="number"
                                    value={trackForm.award_number}
                                    onChange={handleTrackFormChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        {editMode.track
                                            ? 'Update Track'
                                            : 'Create Track'}
                                    </Button>
                                    {editMode.track && (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={resetTrackForm}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
                        Track List
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Album</TableCell>
                                    <TableCell>Artist</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tracks.length > 0 ? (
                                    tracks.map((track) => (
                                        <TableRow key={track.id}>
                                            <TableCell>{track.id}</TableCell>
                                            <TableCell>{track.name}</TableCell>
                                            <TableCell>
                                                {track.album_name}
                                            </TableCell>
                                            <TableCell>
                                                {track.artister_name}
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            handleEditTrack(
                                                                track
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() =>
                                                            handleDeleteTrack(
                                                                track.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No tracks found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Paper>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};
