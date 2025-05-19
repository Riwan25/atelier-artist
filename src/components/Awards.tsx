import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Album, Track } from '../types';

interface AwardsProps {
    elem: Track | Album;
    size?: SizeProp;
}

export const Awards = ({ elem, size }: AwardsProps) => {
    return (
        <span>
            {elem.award_id &&
                (() => {
                    switch (elem.award_id) {
                        case 1:
                            return (
                                <span>
                                    {elem.award_number ? (
                                        Array.from(
                                            {
                                                length: elem.award_number,
                                            },
                                            (_, i) => (
                                                <FontAwesomeIcon
                                                    key={i}
                                                    icon={faCompactDisc}
                                                    style={{
                                                        marginLeft: '8px',
                                                        color: 'yellow',
                                                    }}
                                                    size={size}
                                                />
                                            )
                                        )
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faCompactDisc}
                                            style={{
                                                marginLeft: '8px',
                                                color: 'yellow',
                                            }}
                                            size={size}
                                        />
                                    )}
                                </span>
                            );
                        case 2:
                            return (
                                <span>
                                    {elem.award_number ? (
                                        Array.from(
                                            {
                                                length: elem.award_number,
                                            },
                                            (_, i) => (
                                                <FontAwesomeIcon
                                                    key={i}
                                                    icon={faCompactDisc}
                                                    style={{
                                                        marginLeft: '8px',
                                                        color: '#C0C0C0',
                                                    }}
                                                    size={size}
                                                />
                                            )
                                        )
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faCompactDisc}
                                            style={{
                                                marginLeft: '8px',
                                                color: '#C0C0C0',
                                            }}
                                            size={size}
                                        />
                                    )}
                                </span>
                            );
                        case 3:
                            return (
                                <span>
                                    {elem.award_number ? (
                                        Array.from(
                                            {
                                                length: elem.award_number,
                                            },
                                            (_, i) => (
                                                <FontAwesomeIcon
                                                    key={i}
                                                    icon={faCompactDisc}
                                                    style={{
                                                        marginLeft: '8px',
                                                        color: '#CD7F32',
                                                    }}
                                                    size={size}
                                                />
                                            )
                                        )
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faCompactDisc}
                                            style={{
                                                marginLeft: '8px',
                                                color: '#CD7F32',
                                            }}
                                            size={size}
                                        />
                                    )}
                                </span>
                            );
                        default:
                            return null;
                    }
                })()}
        </span>
    );
};
