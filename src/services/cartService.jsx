import apiClient from './apiClient';

export const getMyCart = async () => {
  try {
    const response = await apiClient.get('/carts/my-cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error.response?.data || error.message);
    throw error;
  }
};

export const addItemToCart = async (dishId, quantity) => {
  try {
    const response = await apiClient.post('/carts/items', { dishId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error.response?.data || error.message);
    throw error;
  }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    const response = await apiClient.put(`/carts/items/${cartItemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error.response?.data || error.message);
    throw error;
  }
};

export const removeItemFromCart = async (cartItemId) => {
  try {
    const response = await apiClient.delete(`/carts/items/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing item from cart:', error.response?.data || error.message);
    throw error;
  }
};

export const clearMyCart = async () => {
  try {
    const response = await apiClient.delete('/carts/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error.response?.data || error.message);
    throw error;
  }
};