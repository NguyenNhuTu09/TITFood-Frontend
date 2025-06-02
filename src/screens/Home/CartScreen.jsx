import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native'; // Thêm Image
import { AuthContext } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import * as CartService from '../../services/cartService'; // Sử dụng cartService

const CartItemDisplay = ({ item, onUpdateQuantity, onRemoveItem }) => (
  <View style={cartStyles.cartItem}>
    {item.dishImageUrl && <Image source={{uri: item.dishImageUrl}} style={cartStyles.dishImage} />}
    <View style={cartStyles.itemInfo}>
      <Text style={cartStyles.itemName}>{item.dishName}</Text>
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
         <Ionicons name="trash-outline" size={20} color="tomato" />
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
        //setError("Vui lòng đăng nhập để xem giỏ hàng."); // Không cần thiết vì AppNavigator sẽ xử lý
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await CartService.getMyCart();
      setCart(data);
    } catch (e) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [userToken, currentUser]);

  useFocusEffect(useCallback(() => { fetchCart(); }, [fetchCart]));

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
        handleRemoveItem(cartItemId);
        return;
    }
    setIsLoading(true);
    try {
        await CartService.updateCartItemQuantity(cartItemId, newQuantity);
        fetchCart(); 
    } catch (e) {
        Alert.alert('Lỗi', 'Không thể cập nhật số lượng sản phẩm.');
        setIsLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa sản phẩm này?",
        [{ text: "Hủy" }, { text: "Xóa", style: "destructive", onPress: async () => {
            setIsLoading(true);
            try {
                await CartService.removeItemFromCart(cartItemId);
                fetchCart(); 
            } catch (e) {
                Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
                setIsLoading(false);
            }
        }}]
    );
  };
  
  const handleClearCart = async () => {
     Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?",
        [{ text: "Hủy" }, { text: "Xóa hết", style: "destructive", onPress: async () => {
            setIsLoading(true);
            try {
                await CartService.clearMyCart();
                fetchCart(); 
            } catch (e) {
                Alert.alert('Lỗi', 'Không thể làm trống giỏ hàng.');
                setIsLoading(false);
            }
        }}]
    );
  };

  const handleCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
        Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống.");
        return;
    }
   
    navigation.navigate('Checkout', { cartId: cart.id, totalPrice: cart.totalPrice });
  };

  if (isLoading && !cart) { // Chỉ hiển thị loading toàn màn hình khi chưa có dữ liệu cart
    return ( <View style={cartStyles.centered}><ActivityIndicator size="large" color="tomato" /><Text>Đang tải giỏ hàng...</Text></View> );
  }
  if (error) {
    return ( <View style={cartStyles.centered}><Text style={cartStyles.errorText}>{error}</Text><TouchableOpacity onPress={fetchCart} style={cartStyles.retryButton}><Text style={cartStyles.retryButtonText}>Thử lại</Text></TouchableOpacity></View> );
  }
  if (!cart || !cart.items || cart.items.length === 0) {
    return ( <View style={cartStyles.centered}><Text style={cartStyles.emptyCartText}>Giỏ hàng của bạn đang trống.</Text><TouchableOpacity onPress={() => navigation.navigate('Home')} style={cartStyles.shopButton}><Text style={cartStyles.shopButtonText}>Mua sắm ngay</Text></TouchableOpacity></View> );
  }

  return (
    <View style={cartStyles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => ( <CartItemDisplay item={item} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} /> )}
        ListHeaderComponent={() => ( <View style={cartStyles.headerContainer}><Text style={cartStyles.headerTitle}>Giỏ Hàng Của Bạn</Text>{cart.items.length > 0 && ( <TouchableOpacity onPress={handleClearCart} style={cartStyles.clearCartButton}><Text style={cartStyles.clearCartButtonText}>Xóa hết</Text></TouchableOpacity> )}</View> )}
        ListFooterComponent={() => ( <View style={cartStyles.footer}><Text style={cartStyles.totalPriceText}>Tổng cộng: {cart.totalPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text><TouchableOpacity style={cartStyles.checkoutButton} onPress={handleCheckout}><Text style={cartStyles.checkoutButtonText}>Tiến Hành Đặt Hàng</Text></TouchableOpacity></View> )}
      />
      {isLoading && <ActivityIndicator size="small" color="tomato" style={cartStyles.listLoadingIndicator} />}
    </View>
  );
};

const cartStyles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  clearCartButton: { backgroundColor: '#ff3b30', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 5 },
  clearCartButtonText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  cartItem: { backgroundColor: 'white', padding: 10, marginVertical: 8, marginHorizontal: 10, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, flexDirection: 'row', alignItems: 'center' },
  dishImage: { width: 60, height: 60, borderRadius: 5, marginRight: 10 },
  itemInfo: { flex: 1, marginRight: 10 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#444' },
  itemPrice: { fontSize: 13, color: 'gray', marginTop: 4 },
  itemActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 3 },
  actionText: { fontSize: 16, color: '#333' },
  quantityText: { fontSize: 16, marginHorizontal: 8, fontWeight: '500' },
  removeButton: { borderColor: 'transparent' }, // Để icon tự căn chỉnh
  itemTotalPrice: { fontSize: 14, fontWeight: 'bold', color: 'green', position: 'absolute', bottom: 10, right: 10 },
  footer: { padding: 15, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: 'white' },
  totalPriceText: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginBottom: 15, color: '#333' },
  checkoutButton: { backgroundColor: 'tomato', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  checkoutButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  emptyCartText: { fontSize: 18, color: 'gray', marginBottom: 20, textAlign: 'center' },
  shopButton: { backgroundColor: 'tomato', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8},
  shopButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold'},
  errorText: { fontSize: 16, color: 'red', marginBottom: 15, textAlign: 'center' },
  retryButton: { backgroundColor: 'tomato', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8},
  retryButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold'},
  listLoadingIndicator: { marginVertical: 20 },
});

export default CartScreen;