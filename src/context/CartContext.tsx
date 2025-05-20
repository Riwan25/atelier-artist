import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Album } from '../types';

export interface CartItem extends Album {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (album: Album) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);

    // Load cart from localStorage on initial render
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCart(parsedCart);
                setTotalItems(
                    parsedCart.reduce(
                        (total: number, item: CartItem) =>
                            total + item.quantity,
                        0
                    )
                );
            } catch (e) {
                console.error('Failed to parse cart from localStorage', e);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        setTotalItems(cart.reduce((total, item) => total + item.quantity, 0));
    }, [cart]);

    const addToCart = (album: Album) => {
        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item.id === album.id
            );

            if (existingItem) {
                // If item exists, increase quantity
                return currentCart.map((item) =>
                    item.id === album.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // If item doesn't exist, add it with quantity 1
                return [...currentCart, { ...album, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id: number) => {
        setCart((currentCart) => {
            const existingItem = currentCart.find((item) => item.id === id);

            if (existingItem && existingItem.quantity > 1) {
                // If quantity > 1, decrease quantity
                return currentCart.map((item) =>
                    item.id === id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            } else {
                // If quantity is 1, remove item
                return currentCart.filter((item) => item.id !== id);
            }
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotal = () => {
        return cart.reduce((total, item) => {
            return total + (item.cost || 0) * item.quantity;
        }, 0);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotal,
        totalItems,
    };

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
};
