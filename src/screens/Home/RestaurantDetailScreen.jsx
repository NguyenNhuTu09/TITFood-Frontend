import React, { useState, useEffect, useCallback, useContext } from 'react'; // Thêm useContext
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, TouchableOpacity, Image, FlatList, Alert } from 'react-native'; // Thêm FlatList, Alert
import { useFocusEffect } from '@react-navigation/native'; // Để refresh khi quay lại màn hình
import { AuthContext } from '../../contexts/AuthContext'; // Thêm AuthContext
import apiClient from '../../services/apiClient'; // Sử dụng apiClient
import * as CartService from '../../services/cartService'; // Import cart service
import * as ReviewService from '../../services/reviewService'; // Import review service
import ReviewItem from '../../components/restaurant/ReviewItem'; // Import ReviewItem

const DishItem = ({ dish, onAddToCart }) => (
  <View style={detailStyles.dishItem}>
    {dish.imageUrl && <Image source={{ uri: dish.imageUrl }} style={detailStyles.dishImage} onError={() => console.log("Error loading image for dish: " + dish.name)}/>}
    <View style={detailStyles.dishInfo}>
        <Text style={detailStyles.dishName}>{dish.name}</Text>
        <Text style={detailStyles.dishDescription}>{dish.description}</Text>
        <Text style={detailStyles.dishPrice}>{dish.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
    </View>
    <TouchableOpacity style={detailStyles.addToCartButton} onPress={() => onAddToCart(dish)}>
        <Text style={detailStyles.addToCartButtonText}>Thêm</Text>
    </TouchableOpacity>
  </View>
);

const MenuSection = ({ menu, onAddToCart }) => (
  <View style={detailStyles.menuSection}>
    <Text style={detailStyles.menuName}>{menu.name}</Text>
    {menu.dishes && menu.dishes.map(dish => (
      <DishItem key={dish.id.toString()} dish={dish} onAddToCart={onAddToCart} />
    ))}
  </View>
);

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurantId, restaurantName } = route.params;
  const { userToken } = useContext(AuthContext); // Lấy userToken từ context
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: restaurantName || 'Chi Tiết Nhà Hàng' });
  }, [navigation, restaurantName]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const restaurantPromise = apiClient.get(`/restaurants/${restaurantId}`);
      const reviewsPromise = ReviewService.getReviewsByRestaurant(restaurantId);
      
      const [restaurantResponse, reviewsResponse] = await Promise.all([restaurantPromise, reviewsPromise]);
      
      setRestaurant(restaurantResponse.data);
      setReviews(reviewsResponse || []);

    } catch (e) {
      console.error("Failed to fetch restaurant details or reviews", e.response?.data || e.message);
      setError('Không thể tải thông tin nhà hàng hoặc đánh giá.');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useFocusEffect( // Fetch lại dữ liệu khi màn hình được focus (ví dụ sau khi tạo review)
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleAddToCart = async (dish) => {
    if (!userToken) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", [
        { text: "Đăng nhập", onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
        { text: "Hủy", style: "cancel" }
      ]);
      return;
    }
    setIsAddingToCart(true);
    try {
      await CartService.addItemToCart(dish.id, 1); // Mặc định thêm 1 sản phẩm
      Alert.alert('Thành công', `${dish.name} đã được thêm vào giỏ hàng!`);
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
      console.error("Add to cart failed:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const navigateToCreateReview = () => {
    if (!userToken) {
        Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để viết đánh giá.", [
            { text: "Đăng nhập", onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
            { text: "Hủy", style: "cancel" }
        ]);
        return;
    }
    navigation.navigate('CreateReview', { restaurantId: restaurantId, restaurantName: restaurant?.name });
  };

  if (isLoading && !restaurant) { // Chỉ hiển thị loading toàn màn hình khi chưa có dữ liệu nhà hàng
    return (
      <View style={detailStyles.centered}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Đang tải chi tiết nhà hàng...</Text>
      </View>
    );
  }

  if (error && !restaurant) {
    return (
      <View style={detailStyles.centered}>
        <Text style={detailStyles.errorText}>{error}</Text>
        <Button title="Thử lại" onPress={fetchData} color="tomato"/>
      </View>
    );
  }
  
  if (!restaurant) { // Trường hợp không có lỗi nhưng restaurant vẫn null (ít xảy ra nếu logic đúng)
      return (
          <View style={detailStyles.centered}><Text>Không tìm thấy thông tin nhà hàng.</Text></View>
      );
  }


  return (
    <ScrollView style={detailStyles.container}>
      {restaurant.imageUrl && <Image source={{uri: restaurant.imageUrl}} style={detailStyles.restaurantImage} onError={() => console.log("Error loading image for restaurant: " + restaurant.name)}/>}
      <View style={detailStyles.infoContainer}>
        <Text style={detailStyles.restaurantName}>{restaurant.name}</Text>
        <Text style={detailStyles.restaurantDescription}>{restaurant.description}</Text>
        <Text style={detailStyles.restaurantAddress}>Địa chỉ: {restaurant.address}</Text>
        <Text style={detailStyles.restaurantPhone}>Điện thoại: {restaurant.phoneNumber}</Text>
        <Text style={detailStyles.restaurantRating}>Đánh giá: {restaurant.rating?.toFixed(1)}/5.0 ({reviews.length} đánh giá)</Text>
      </View>

      {restaurant.menus && restaurant.menus.length > 0 ? (
        restaurant.menus.map(menu => (
          <MenuSection key={menu.id.toString()} menu={menu} onAddToCart={handleAddToCart} />
        ))
      ) : (
        <Text style={detailStyles.noMenuText}>Nhà hàng này hiện chưa có thực đơn.</Text>
      )}
      
      {isAddingToCart && <ActivityIndicator style={{marginTop: 10}} size="small" color="tomato" />}

      <View style={detailStyles.reviewsSection}>
        <View style={detailStyles.reviewsHeader}>
            <Text style={detailStyles.reviewsTitle}>Đánh giá từ khách hàng</Text>
            <TouchableOpacity style={detailStyles.writeReviewButton} onPress={navigateToCreateReview}>
                <Text style={detailStyles.writeReviewButtonText}>Viết đánh giá</Text>
            </TouchableOpacity>
        </View>
        {isLoading && reviews.length === 0 && <ActivityIndicator size="small" color="tomato" />}
        {!isLoading && reviews.length === 0 && <Text style={detailStyles.noReviewsText}>Chưa có đánh giá nào cho nhà hàng này.</Text>}
        {reviews.map(review => (
            <ReviewItem key={review.id.toString()} review={review} />
        ))}
      </View>
    </ScrollView>
  );
};

const detailStyles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { flex: 1, backgroundColor: '#fff' },
  restaurantImage: { width: '100%', height: 200, resizeMode: 'cover' },
  infoContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  restaurantName: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  restaurantDescription: { fontSize: 16, color: 'gray', marginBottom: 10 },
  restaurantAddress: { fontSize: 14, color: '#333', marginBottom: 3 },
  restaurantPhone: { fontSize: 14, color: '#333', marginBottom: 3 },
  restaurantRating: { fontSize: 14, color: 'darkorange', fontWeight: 'bold' },
  menuSection: { marginTop: 15, paddingHorizontal: 15 },
  menuName: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: 'tomato' },
  dishItem: { flexDirection: 'row', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  dishImage: { width: 60, height: 60, borderRadius: 5, marginRight: 10 },
  dishInfo: { flex: 1 },
  dishName: { fontSize: 16, fontWeight: '600' },
  dishDescription: { fontSize: 13, color: 'gray', marginVertical: 2 },
  dishPrice: { fontSize: 15, fontWeight: 'bold', color: 'green' },
  addToCartButton: { backgroundColor: 'tomato', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 5, marginLeft: 10 },
  addToCartButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  noMenuText: { textAlign: 'center', marginVertical: 20, fontSize: 16, color: 'gray' },
  reviewsSection: { marginTop: 20, paddingHorizontal: 15, paddingBottom: 20 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewsTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  writeReviewButton: { backgroundColor: '#007bff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  writeReviewButtonText: { color: 'white', fontWeight: '500' },
  noReviewsText: { textAlign: 'center', marginTop: 10, fontSize: 15, color: 'gray' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
});

export default RestaurantDetailScreen;