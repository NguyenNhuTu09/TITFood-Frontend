import apiClient from './apiClient';

export const getReviewsByRestaurant = async (restaurantId) => {
  try {
    const response = await apiClient.get(`/reviews/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for restaurant ${restaurantId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  // reviewData should be like: { restaurantId: number, rating: number, comment?: string }
  try {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error.response?.data || error.message);
    throw error;
  }
};