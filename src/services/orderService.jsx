import apiClient from './apiClient';

export const createOrder = async (orderData) => {
// orderData should be like: { restaurantId: number, shippingAddress?: string, notes?: string, orderItems: [{ dishId: number, quantity: number }] }
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

export const getMyOrders = async () => {
  try {
    const response = await apiClient.get('/orders/my-orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching my orders:', error.response?.data || error.message);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order details for ${orderId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const cancelOrder = async (orderId) => { // Giả sử chỉ cho phép hủy đơn Pending
    try {
        const response = await apiClient.put(`/orders/${orderId}/status`, { status: 'Cancelled' }); // 'Cancelled' là giá trị enum từ backend
        return response.data;
    } catch (error) {
        console.error(`Error cancelling order ${orderId}:`, error.response?.data || error.message);
        throw error;
    }
};