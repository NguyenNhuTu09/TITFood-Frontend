import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiConfig';
// import MenuSection from '../../components/restaurant/MenuSection'; // Bạn sẽ tạo component này
// import DishItem from '../../components/restaurant/DishItem'; // Bạn sẽ tạo component này

// Placeholder cho MenuSection và DishItem
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
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cập nhật title của header
  useEffect(() => {
    navigation.setOptions({ title: restaurantName || 'Chi Tiết Nhà Hàng' });
  }, [navigation, restaurantName]);


  const fetchRestaurantDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/${restaurantId}`);
      setRestaurant(response.data);
    } catch (e) {
      console.error("Failed to fetch restaurant details", e.response?.data || e.message);
      setError('Không thể tải thông tin nhà hàng.');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [fetchRestaurantDetails]);

  const handleAddToCart = (dish) => {
    // Logic thêm vào giỏ hàng sẽ ở đây
    // Ví dụ: gọi cartService.addItemToCart(dish.id, 1);
    console.log('Thêm vào giỏ hàng:', dish.name);
    // Có thể navigate đến CartScreen hoặc hiển thị thông báo
    // navigation.navigate('Cart');
    alert(`${dish.name} đã được thêm vào giỏ hàng! (Chức năng demo)`);
  };


  if (isLoading) {
    return (
      <View style={detailStyles.centered}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Đang tải chi tiết nhà hàng...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={detailStyles.centered}>
        <Text style={detailStyles.errorText}>{error || 'Không tìm thấy thông tin nhà hàng.'}</Text>
        <Button title="Thử lại" onPress={fetchRestaurantDetails} color="tomato"/>
      </View>
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
        <Text style={detailStyles.restaurantRating}>Đánh giá: {restaurant.rating?.toFixed(1)}/5.0</Text>
      </View>

      {restaurant.menus && restaurant.menus.length > 0 ? (
        restaurant.menus.map(menu => (
          <MenuSection key={menu.id.toString()} menu={menu} onAddToCart={handleAddToCart} />
        ))
      ) : (
        <Text style={detailStyles.noMenuText}>Nhà hàng này hiện chưa có thực đơn.</Text>
      )}
    </ScrollView>
  );
};

const detailStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantDescription: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  restaurantPhone: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  restaurantRating: {
    fontSize: 14,
    color: 'darkorange',
    fontWeight: 'bold',
  },
  menuSection: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  menuName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'tomato',
  },
  dishItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center', // Căn giữa các item theo chiều dọc
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  dishInfo: {
    flex: 1, // Cho phép text chiếm phần còn lại
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dishDescription: {
    fontSize: 13,
    color: 'gray',
    marginVertical: 2,
  },
  dishPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'green',
  },
  addToCartButton: {
    backgroundColor: 'tomato',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10, // Khoảng cách với phần thông tin món ăn
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noMenuText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default RestaurantDetailScreen;