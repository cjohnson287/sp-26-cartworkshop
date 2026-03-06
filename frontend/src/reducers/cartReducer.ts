import type { CartState, CartAction } from '../types/cart';

export const initialCartState: CartState = {
  items: [],
  isOpen: false,
};

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { id, name, price, imageUrl } = action.payload;
      const existingItem = state.items.find(item => item.productId === id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, { productId: id, productName: name, price, quantity: 1, imageUrl }],
        };
      }
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload.productId),
      };
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity < 1) {
        return {
          ...state,
          items: state.items.filter(item => item.productId !== productId),
        };
      } else {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        };
      }
    }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
  }
};