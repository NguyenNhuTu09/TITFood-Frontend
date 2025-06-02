import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native'; // Để fetch lại giỏ hàng khi màn hình được focus
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiConfig';
// import CartItem from '../../components/cart/CartItem'; 

// Placeholder cho CartItem
const CartItemDisplay = ({ item, onUpdateQuantity, onRemoveItem }) => (
  <View style={cartStyles.cartItem}>
    <View style={cartStyles.itemInfo}>
      <Text style={cartStyles.itemName}>{item.dishName} ({item.dishId})</Text>
      <Text style={cartStyles.itemPrice}>{item.unitPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} x {item.quantity}</Text>
    </View>
    <View style={cartStyles.itemActions}>
      <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} style={cartStyles.actionButton}>
        <Text style={cartStyles.actionText}>-</Text>
      </TouchableOpacity>
      <Text style={cartStyles.quantityText}>{item.quantity}</Text>
      <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity + 1)} style={cartStyles.actionButton}>
        <Text style={cartStyles.actionText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={[cartStyles.actionButton, cartStyles.removeButton]}>
        <Text style={cartStyles.actionText}>Xóa</Text>
      </TouchableOpacity>
    </View>
    <Text style={cartStyles.itemTotalPrice}>Tổng: {item.totalItemPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
  </View>
);


const CartScreen = ({ navigation }) => {
  const { userToken, currentUser } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!userToken || !currentUser) {
        setIsLoading(false);
        setError("Vui lòng đăng nhập để xem giỏ hàng.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/carts/my-cart`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setCart(response.data);
    } catch (e) {
      console.error("Failed to fetch cart", e.response?.data || e.message);
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
      if (e.response?.status === 401) {
        // Handle unauthorized access, maybe logout user
      }
    } finally {
      setIsLoading(false);
    }
  }, [userToken, currentUser]);

  // Sử dụng useFocusEffect để fetch lại giỏ hàng mỗi khi màn hình này được focus
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
        handleRemoveItem(cartItemId); // Nếu số lượng < 1 thì xóa luôn
        return;
    }
    try {
        setIsLoading(true);
        await axios.put(`${API_BASE_URL}/carts/items/${cartItemId}`,
         { quantity: newQuantity },
         { headers: { Authorization: `Bearer ${userToken}` } }
        );
        fetchCart(); // Tải lại giỏ hàng sau khi cập nhật
    } catch (e) {
        Alert.alert('Lỗi', 'Không thể cập nhật số lượng sản phẩm.');
        console.error("Update quantity failed", e.response?.data || e.message);
        setIsLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    Alert.alert(
        "Xác nhận xóa",
        "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?",
        [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa", style: "destructive", onPress: async () => {
                try {
                    setIsLoading(true);
                    await axios.delete(`${API_BASE_URL}/carts/items/${cartItemId}`, {
                        headers: { Authorization: `Bearer ${userToken}` },
                    });
                    fetchCart(); // Tải lại giỏ hàng
                } catch (e) {
                    Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
                    console.error("Remove item failed", e.response?.data || e.message);
                    setIsLoading(false);
                }
            }}
        ]
    );
  };
  
  const handleClearCart = async () => {
     Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?",
        [
            { text: "Hủy", style: "cancel" },
            { text: "Xóa hết", style: "destructive", onPress: async () => {
                try {
                    setIsLoading(true);
                    await axios.delete(`${API_BASE_URL}/carts/clear`, {
                        headers: { Authorization: `Bearer ${userToken}` },
                    });
                    fetchCart(); // Tải lại giỏ hàng
                } catch (e) {
                    Alert.alert('Lỗi', 'Không thể làm trống giỏ hàng.');
                    console.error("Clear cart failed", e.response?.data || e.message);
                    setIsLoading(false);
                }
            }}
        ]
    );
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
        Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống.");
        return;
    }
    const firstItemRestaurantId = cart.items[0]?.dish?.menu?.restaurantId; // Cần backend trả về thông tin này
    
    // Tạm thời, chúng ta sẽ giả định restaurantId cần được chọn hoặc đã biết
    // Ví dụ: navigation.navigate('CheckoutScreen', { cartItems: cart.items, totalPrice: cart.totalPrice, restaurantId: SOME_RESTAURANT_ID });
    Alert.alert("Thanh toán", "Chức năng thanh toán đang được phát triển!");
    console.log("Checkout:", cart);
  };

  if (isLoading) {
    return (
      <View style={cartStyles.centered}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={cartStyles.centered}>
        <Text style={cartStyles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchCart} style={cartStyles.retryButton}><Text style={cartStyles.retryButtonText}>Thử lại</Text></TouchableOpacity>
      </View>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <View style={cartStyles.centered}>
        <Text style={cartStyles.emptyCartText}>Giỏ hàng của bạn đang trống.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={cartStyles.shopButton}>
            <Text style={cartStyles.shopButtonText}>Mua sắm ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={cartStyles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
            <CartItemDisplay 
                item={item} 
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
            />
        )}
        ListHeaderComponent={() => (
            <View style={cartStyles.headerContainer}>
                <Text style={cartStyles.headerTitle}>Giỏ Hàng Của Bạn</Text>
                {cart.items.length > 0 && (
                     <TouchableOpacity onPress={handleClearCart} style={cartStyles.clearCartButton}>
                        <Text style={cartStyles.clearCartButtonText}>Xóa hết</Text>
                    </TouchableOpacity>
                )}
            </View>
        )}
        ListFooterComponent={() => (
          <View style={cartStyles.footer}>
            <Text style={cartStyles.totalPriceText}>
              Tổng cộng: {cart.totalPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Text>
            <TouchableOpacity style={cartStyles.checkoutButton} onPress={handleCheckout}>
              <Text style={cartStyles.checkoutButtonText}>Tiến Hành Đặt Hàng</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const cartStyles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  clearCartButton: {
    backgroundColor: '#ff3b30', // Màu đỏ cho nút xóa
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  clearCartButtonText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  cartItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: { marginBottom: 10 },
  itemName: { fontSize: 17, fontWeight: '600', color: '#444' },
  itemPrice: { fontSize: 14, color: 'gray', marginTop: 4 },
  itemActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
  },
  actionText: { fontSize: 16, color: '#333' },
  quantityText: { fontSize: 16, marginHorizontal: 10, fontWeight: '500' },
  removeButton: { borderColor: 'tomato' },
  itemTotalPrice: { fontSize: 15, fontWeight: 'bold', color: 'green', textAlign: 'right', marginTop: 5 },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 15,
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: 'tomato',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartText: { fontSize: 18, color: 'gray', marginBottom: 20, textAlign: 'center' },
  shopButton: { backgroundColor: 'tomato', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8},
  shopButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold'},
  errorText: { fontSize: 16, color: 'red', marginBottom: 15, textAlign: 'center' },
  retryButton: { backgroundColor: 'tomato', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8},
  retryButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold'},
});

export default CartScreen;
