import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import * as CartService from '../../services/cartService';
import * as OrderService from '../../services/orderService';
// import CartItemDisplay from '../../components/cart/CartItemDisplay'; // Nếu muốn hiển thị lại cart items

const CheckoutScreen = ({ route, navigation }) => {
  const { cartId, totalPrice } = route.params; // Nhận cartId và totalPrice từ CartScreen
  const { userToken, currentUser, refreshUserInfo } = useContext(AuthContext); // refreshUserInfo để cập nhật địa chỉ nếu user sửa
  
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cartDetails, setCartDetails] = useState(null); // Để lưu chi tiết giỏ hàng nếu cần hiển thị
  const [isFetchingCart, setIsFetchingCart] = useState(true);

  // Fetch cart details to get items and determine restaurantId
  useEffect(() => {
    const fetchCartDetails = async () => {
      if (!cartId) {
          Alert.alert("Lỗi", "Không tìm thấy thông tin giỏ hàng.");
          navigation.goBack();
          setIsFetchingCart(false);
          return;
      }
      setIsFetchingCart(true);
      try {
        const cartData = await CartService.getMyCart(); // API này đã có token interceptor
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          Alert.alert("Lỗi", "Giỏ hàng trống hoặc không hợp lệ.");
          navigation.goBack();
          return;
        }
        setCartDetails(cartData);
        // Lấy địa chỉ mặc định từ user nếu có và chưa được set
        if (!shippingAddress && currentUser?.address) {
            setShippingAddress(currentUser.address);
        }

      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải thông tin giỏ hàng để thanh toán.");
        console.error("Error fetching cart for checkout:", error);
        navigation.goBack();
      } finally {
        setIsFetchingCart(false);
      }
    };
    fetchCartDetails();
  }, [cartId, navigation, currentUser]);


  const handlePlaceOrder = async () => {
    if (!cartDetails || !cartDetails.items || cartDetails.items.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng của bạn trống.');
      return;
    }
    if (!shippingAddress.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng.');
        return;
    }

    
    
    let restaurantIdToOrder;
    if (cartDetails.items[0]?.dishId) { // Cần cách lấy restaurantId từ dishId
        
        Alert.alert("Lưu ý", "Chức năng xác định nhà hàng tự động chưa hoàn thiện. Vui lòng đảm bảo giỏ hàng chỉ có sản phẩm từ 1 nhà hàng.");
        
        const assumedRestaurantId = cartDetails.items[0]?.dish?.restaurantId; // Sẽ là undefined nếu backend không gửi
        if (!assumedRestaurantId && cartDetails.items.length > 0) {
             
             Alert.alert("Lỗi nghiêm trọng", "Không thể xác định nhà hàng cho đơn hàng. Vui lòng liên hệ hỗ trợ.");
             
             console.warn("Không thể tự động xác định restaurantId từ giỏ hàng. Cần cập nhật backend CartItemDto hoặc luồng checkout.");
             
             Alert.alert("Lỗi", "Không thể xác định nhà hàng cho đơn hàng. Chức năng này cần backend hỗ trợ thêm thông tin nhà hàng trong giỏ hàng.");
             return;
        }
       
        const restaurantIdForOrder = route.params?.restaurantId || cartDetails.items[0]?.dish?.restaurant?.id; // Cần backend gửi thông tin này
        if (!restaurantIdForOrder) {
            Alert.alert("Lỗi", "Không thể xác định nhà hàng. Vui lòng chọn lại sản phẩm hoặc liên hệ hỗ trợ.");
            return;
        }


        const orderData = {
            restaurantId: restaurantIdForOrder, // Cần một cách đáng tin cậy để lấy restaurantId
            shippingAddress,
            notes,
            orderItems: cartDetails.items.map(item => ({
                dishId: item.dishId,
                quantity: item.quantity,
            })),
        };

        setIsLoading(true);
        try {
            const createdOrder = await OrderService.createOrder(orderData);
            Alert.alert('Thành công', `Đơn hàng #${createdOrder.id} đã được đặt thành công!`);
            // Sau khi đặt hàng thành công, có thể xóa giỏ hàng (backend OrderService đã làm)
            // Hoặc fetch lại giỏ hàng (sẽ thấy trống)
            // CartService.clearMyCart(); // Không cần thiết nếu backend đã xóa
            navigation.popToTop(); // Quay về màn hình gốc của tab (ví dụ: CartMain)
            navigation.navigate('Orders', { screen: 'OrderDetail', params: { orderId: createdOrder.id } });
        } catch (error) {
            Alert.alert('Đặt hàng thất bại', error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
            console.error('Place order failed:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    } else {
        Alert.alert("Lỗi", "Không tìm thấy thông tin món ăn để đặt hàng.");
    }
  };
  
  if (isFetchingCart || !cartDetails) {
    return (
      <View style={checkoutStyles.centered}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Đang tải thông tin thanh toán...</Text>
      </View>
    );
  }


  return (
    <ScrollView style={checkoutStyles.container}>
      <Text style={checkoutStyles.title}>Xác Nhận Đơn Hàng</Text>

      <View style={checkoutStyles.section}>
        <Text style={checkoutStyles.sectionTitle}>Thông tin giao hàng</Text>
        <TextInput
          style={checkoutStyles.input}
          placeholder="Địa chỉ giao hàng"
          value={shippingAddress}
          onChangeText={setShippingAddress}
          multiline
        />
        <TouchableOpacity onPress={() => { /* Logic chọn địa chỉ đã lưu */ Alert.alert("Thông báo", "Chức năng chọn địa chỉ đang phát triển."); }}>
            <Text style={checkoutStyles.linkText}>Sử dụng địa chỉ đã lưu</Text>
        </TouchableOpacity>
      </View>

      <View style={checkoutStyles.section}>
        <Text style={checkoutStyles.sectionTitle}>Ghi chú cho đơn hàng</Text>
        <TextInput
          style={[checkoutStyles.input, { height: 80 }]}
          placeholder="Ví dụ: Giao hàng giờ hành chính, ít đường..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>
      
      {/* Optionale: Hiển thị lại tóm tắt giỏ hàng */}
      <View style={checkoutStyles.section}>
        <Text style={checkoutStyles.sectionTitle}>Tóm tắt đơn hàng</Text>
        {cartDetails.items.map(item => (
            <View key={item.id} style={checkoutStyles.summaryItem}>
                <Text style={checkoutStyles.summaryItemName}>{item.dishName} (x{item.quantity})</Text>
                <Text style={checkoutStyles.summaryItemPrice}>{(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ</Text>
            </View>
        ))}
        <View style={checkoutStyles.summaryTotal}>
            <Text style={checkoutStyles.summaryTotalText}>Tổng cộng:</Text>
            <Text style={checkoutStyles.summaryTotalPriceValue}>{totalPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
        </View>
      </View>


      {isLoading ? (
        <ActivityIndicator size="large" color="tomato" style={{ marginTop: 20 }}/>
      ) : (
        <TouchableOpacity style={checkoutStyles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={checkoutStyles.placeOrderButtonText}>Hoàn Tất Đặt Hàng</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const checkoutStyles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: 'tomato',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  linkText: {
    color: '#007bff',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 5,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryItemName: {
    fontSize: 15,
    color: '#444',
  },
  summaryItemPrice: {
    fontSize: 15,
    color: '#444',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryTotalText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalPriceValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'green',
  },
  placeOrderButton: {
    backgroundColor: 'tomato',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;