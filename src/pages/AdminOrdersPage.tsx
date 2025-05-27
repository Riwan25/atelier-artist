import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
    id: number;
    album_id: number;
    album_name: string;
    artist_name: string;
    quantity: number;
    unit_price: number;
}

interface Order {
    id: number;
    user_id: number;
    user_email: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export const AdminOrdersPage = () => {
    const { isAuthenticated, user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState<
        number | null
    >(null);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
        null
    );
    const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<
        string | null
    >(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const authToken = localStorage.getItem('auth_token');
                const response = await fetch(
                    'http://localhost/atelier/atelier-artist/api/order/get_all.php',
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data.orders);
                setFilteredOrders(data.orders); // Initialize filteredOrders
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred'
                );
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'admin') {
            fetchOrders();
        }
    }, [isAuthenticated, user]);

    // Add a useEffect for filtering orders based on statusFilter
    useEffect(() => {
        if (orders.length > 0) {
            if (statusFilter === 'all') {
                setFilteredOrders(orders);
            } else {
                const filtered = orders.filter(
                    (order) => order.status === statusFilter
                );
                setFilteredOrders(filtered);
            }
        }
    }, [statusFilter, orders]);

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const handleOpenDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
    };

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            setStatusUpdateLoading(orderId);
            setStatusUpdateError(null);

            const authToken = localStorage.getItem('auth_token');
            const response = await fetch(
                'http://localhost/atelier/atelier-artist/api/order/update_status.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        id: orderId,
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to update order status'
                );
            }

            // Update the orders list with the updated order
            setOrders(
                orders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            // Update filtered orders if they are currently being viewed
            setFilteredOrders((prevFilteredOrders) =>
                prevFilteredOrders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            // Update selected order if it's the one being viewed in details
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }

            setStatusUpdateSuccess(
                `Order #${orderId} status updated to ${newStatus}`
            );

            // Clear success message after 3 seconds
            setTimeout(() => {
                setStatusUpdateSuccess(null);
            }, 3000);
        } catch (err) {
            setStatusUpdateError(
                err instanceof Error ? err.message : 'An unknown error occurred'
            );
        } finally {
            setStatusUpdateLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
    const formatCurrency = (amount: number | string) => {
        const numAmount =
            typeof amount === 'string' ? parseFloat(amount) : amount;
        return `$${Number(numAmount).toFixed(2)}`;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Order Management
            </Typography>
            {statusUpdateSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {statusUpdateSuccess}
                </Alert>
            )}
            {statusUpdateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {statusUpdateError}
                </Alert>
            )}{' '}
            <FormControl
                variant="outlined"
                size="small"
                sx={{ mb: 2, minWidth: 150 }}
            >
                <InputLabel id="status-filter-label">
                    Filter by Status
                </InputLabel>
                <Select
                    labelId="status-filter-label"
                    label="Filter by Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                >
                    <MenuItem value="all">
                        <em>All Orders</em>
                    </MenuItem>
                    <MenuItem value="pending">
                        <Chip
                            label="Pending"
                            color="warning"
                            size="small"
                            sx={{ width: '100%' }}
                        />
                    </MenuItem>
                    <MenuItem value="completed">
                        <Chip
                            label="Completed"
                            color="success"
                            size="small"
                            sx={{ width: '100%' }}
                        />
                    </MenuItem>
                    <MenuItem value="cancelled">
                        <Chip
                            label="Cancelled"
                            color="error"
                            size="small"
                            sx={{ width: '100%' }}
                        />
                    </MenuItem>
                </Select>
            </FormControl>
            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                </Alert>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mt: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>{order.id}</TableCell>{' '}
                                            <TableCell>
                                                {order.user_email}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    order.total_amount
                                                )}
                                            </TableCell>{' '}
                                            <TableCell>
                                                <FormControl size="small">
                                                    <Select
                                                        value={order.status}
                                                        size="small"
                                                        onChange={(e) =>
                                                            handleStatusUpdate(
                                                                order.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            statusUpdateLoading ===
                                                            order.id
                                                        }
                                                        sx={{ minWidth: 120 }}
                                                        renderValue={(
                                                            selected
                                                        ) => (
                                                            <Chip
                                                                label={selected}
                                                                color={
                                                                    getStatusColor(
                                                                        selected
                                                                    ) as any
                                                                }
                                                                size="small"
                                                            />
                                                        )}
                                                    >
                                                        <MenuItem value="pending">
                                                            <Chip
                                                                label="pending"
                                                                color="warning"
                                                                size="small"
                                                            />
                                                        </MenuItem>
                                                        <MenuItem value="completed">
                                                            <Chip
                                                                label="completed"
                                                                color="success"
                                                                size="small"
                                                            />
                                                        </MenuItem>
                                                        <MenuItem value="cancelled">
                                                            <Chip
                                                                label="cancelled"
                                                                color="error"
                                                                size="small"
                                                            />
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() =>
                                                        handleOpenDetails(order)
                                                    }
                                                >
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Order Details Dialog */}
                    <Dialog
                        open={detailsOpen}
                        onClose={handleCloseDetails}
                        maxWidth="md"
                        fullWidth
                    >
                        {selectedOrder && (
                            <>
                                <DialogTitle>
                                    Order #{selectedOrder.id} Details
                                </DialogTitle>
                                <DialogContent dividers>
                                    <Box mb={2}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                        >
                                            Order Information
                                        </Typography>
                                        <Typography>
                                            {' '}
                                            <strong>Customer:</strong>{' '}
                                            {selectedOrder.user_email}
                                        </Typography>
                                        <Typography>
                                            <strong>Date:</strong>{' '}
                                            {formatDate(
                                                selectedOrder.created_at
                                            )}
                                        </Typography>{' '}
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            mb={1}
                                        >
                                            <Typography sx={{ mr: 1 }}>
                                                <strong>Status:</strong>{' '}
                                            </Typography>
                                            <FormControl size="small">
                                                <Select
                                                    value={selectedOrder.status}
                                                    size="small"
                                                    onChange={(e) =>
                                                        handleStatusUpdate(
                                                            selectedOrder.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={
                                                        statusUpdateLoading ===
                                                        selectedOrder.id
                                                    }
                                                    sx={{ minWidth: 120 }}
                                                    renderValue={(selected) => (
                                                        <Chip
                                                            label={selected}
                                                            color={
                                                                getStatusColor(
                                                                    selected
                                                                ) as any
                                                            }
                                                            size="small"
                                                        />
                                                    )}
                                                >
                                                    <MenuItem value="pending">
                                                        <Chip
                                                            label="pending"
                                                            color="warning"
                                                            size="small"
                                                        />
                                                    </MenuItem>
                                                    <MenuItem value="completed">
                                                        <Chip
                                                            label="completed"
                                                            color="success"
                                                            size="small"
                                                        />
                                                    </MenuItem>
                                                    <MenuItem value="cancelled">
                                                        <Chip
                                                            label="cancelled"
                                                            color="error"
                                                            size="small"
                                                        />
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Typography>
                                            <strong>Total Amount:</strong>{' '}
                                            {formatCurrency(
                                                selectedOrder.total_amount
                                            )}
                                        </Typography>
                                    </Box>

                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                    >
                                        Order Items
                                    </Typography>
                                    <TableContainer
                                        component={Paper}
                                        variant="outlined"
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Album</TableCell>
                                                    <TableCell>
                                                        Artist
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        Quantity
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        Unit Price
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        Total
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedOrder.items.map(
                                                    (item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>
                                                                {
                                                                    item.album_name
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    item.artist_name
                                                                }
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {formatCurrency(
                                                                    item.unit_price
                                                                )}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {formatCurrency(
                                                                    item.quantity *
                                                                        item.unit_price
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleCloseDetails}>
                                        Close
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Dialog>
                </>
            )}
        </Container>
    );
};
