import {
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, CardContent, Typography } from '@mui/material';
import Slider from 'react-slick';
import { Spotify } from 'react-spotify-embed';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { Album } from '../types';

interface CarouselProps {
    albums: Album[] | undefined;
}

function SampleNextArrow(props: any) {
    const { className, style, onClick } = props;
    return (
        <FontAwesomeIcon
            icon={faChevronRight}
            onClick={onClick}
            className={className}
            style={{ ...style, display: 'block', color: 'black', right: '0px' }}
        />
    );
}

function SamplePrevArrow(props: any) {
    const { className, style, onClick } = props;
    return (
        <FontAwesomeIcon
            icon={faChevronLeft}
            onClick={onClick}
            className={className}
            style={{
                ...style,
                display: 'block',
                color: 'black',
                left: '0px',
                zIndex: 1,
            }}
        />
    );
}

const CarouselItem = ({ album }: { album: Album }) => {
    return (
        <Box
            sx={{
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                height: '100%',
                pl: 7,
                pr: 7,
            }}
        >
            <Box>
                {album.spotify_id && (
                    <Spotify
                        link={`https://open.spotify.com/album/${album.spotify_id}`}
                        width="100%"
                    />
                )}
            </Box>
            <Box>
                <CardContent
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        width: '100%',
                    }}
                >
                    <Typography variant="h4" sx={{ mb: 2 }}>
                        {album.name}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        {album.type} - {album.track_count} tracks
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {album.description}
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 2 }}>
                        Sortie le {album.release_date}
                    </Typography>
                    <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={() => {
                            window.location.href = `/album/${album.id}`;
                        }}
                    >
                        Voir les détails
                    </Button>
                </CardContent>
            </Box>
        </Box>
    );
};

export const Carousel = ({ albums }: CarouselProps) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
    };
    return (
        <Slider {...settings}>
            {albums?.map((album) => (
                <Box key={album.id} sx={{ height: '100%' }}>
                    <CarouselItem album={album} />
                </Box>
            ))}
        </Slider>
    );
};
