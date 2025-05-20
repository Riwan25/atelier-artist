import { faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    Badge,
    Box,
    Button,
    ClickAwayListener,
    Divider,
    Grow,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Popper,
    Typography,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartItem, useCart } from '../context/CartContext';

export const CartDropdown: React.FC = () => {
    const { cart, removeFromCart, totalItems, getTotal } = useCart();
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };
    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }
        setOpen(false);
    };

    const { user } = useAuth();
    const { clearCart } = useCart();

    const handleCheckout = async () => {
        try {
            if (!user) {
                alert('Please log in to checkout');
                return;
            }

            // Prepare order data
            const orderData = {
                user_id: user.id,
                items: cart,
                total_amount: getTotal(),
            };

            // Call the API to create an order
            const response = await fetch(
                'http://localhost/atelier/atelier-artist/api/order/create.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                }
            );

            const data = await response.json();

            if (response.ok) {
                // Show success message and clear the cart
                alert(`Order created successfully! Order ID: ${data.order_id}`);
                clearCart();
            } else {
                alert(`Checkout failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout. Please try again.');
        }

        setOpen(false);
    };

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    return (
        <>
            <IconButton
                ref={anchorRef}
                aria-controls={open ? 'cart-menu' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                color="inherit"
                sx={{ mr: 1 }}
            >
                <Badge badgeContent={totalItems} color="error">
                    <FontAwesomeIcon icon={faShoppingCart} />
                </Badge>
            </IconButton>

            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-end"
                transition
                disablePortal
                style={{ zIndex: 1300 }}
            >
                {({ TransitionProps }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: 'right top',
                        }}
                    >
                        <Paper
                            sx={{
                                width: 320,
                                maxHeight: 500,
                                overflow: 'auto',
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Shopping Cart
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    {cart.length === 0 ? (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ py: 2 }}
                                        >
                                            Your cart is empty
                                        </Typography>
                                    ) : (
                                        <>
                                            <List sx={{ mb: 2 }}>
                                                {cart.map((item: CartItem) => (
                                                    <ListItem
                                                        key={item.id}
                                                        secondaryAction={
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="remove"
                                                                onClick={() =>
                                                                    removeFromCart(
                                                                        item.id
                                                                    )
                                                                }
                                                                size="small"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faTrash
                                                                    }
                                                                />
                                                            </IconButton>
                                                        }
                                                        sx={{
                                                            py: 1,
                                                            borderBottom:
                                                                '1px solid rgba(0, 0, 0, 0.12)',
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Link
                                                                    to={`/album/${item.id}`}
                                                                    style={{
                                                                        textDecoration:
                                                                            'none',
                                                                        color: 'inherit',
                                                                    }}
                                                                    onClick={() =>
                                                                        setOpen(
                                                                            false
                                                                        )
                                                                    }
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                            }
                                                            secondary={
                                                                <>
                                                                    <Typography
                                                                        variant="body2"
                                                                        component="span"
                                                                    >
                                                                        {
                                                                            item.artist_name
                                                                        }
                                                                    </Typography>
                                                                    <Box
                                                                        sx={{
                                                                            display:
                                                                                'flex',
                                                                            justifyContent:
                                                                                'space-between',
                                                                            mt: 0.5,
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="body2"
                                                                            component="span"
                                                                        >
                                                                            Qty:{' '}
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            component="span"
                                                                        >
                                                                            {formatPrice(
                                                                                (item.cost ||
                                                                                    0) *
                                                                                    item.quantity
                                                                            )}
                                                                        </Typography>
                                                                    </Box>
                                                                </>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    mb: 2,
                                                }}
                                            >
                                                <Typography variant="subtitle1">
                                                    Total:
                                                </Typography>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                >
                                                    {formatPrice(getTotal())}
                                                </Typography>
                                            </Box>

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                onClick={handleCheckout}
                                            >
                                                Checkout
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};
