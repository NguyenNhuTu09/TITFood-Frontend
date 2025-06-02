import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as OrderService from '../../services/orderService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);


  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await OrderService.getOrderDetails(orderId);
      setOrder(data);
      navigation.setOptions({ title: `Chi tiết ĐH #${data.id}` });
    } catch (e) {
      setError('Không thể tải chi tiết đơn hàng.');
      console.error("Fetch order detail failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, navigation]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (order?.status !== 'Pending') {
        Alert.alert("Thông báo", "Chỉ có thể hủy đơn hàng khi ở trạng thái 'Đang chờ xử lý'.");
        return;
    }
    Alert.alert(
        "Xác nhận hủy",
        "Bạn có chắc chắn muốn hủy đơn hàng này?",
        [
            { text: "Không", style: "cancel" },
            { text: "Hủy đơn", style: "destructive", onPress: async () => {
                setIsCancelling(true);
                try {
                    await OrderService.cancelOrder(orderId);
                    Alert.alert("Thành công", "Đơn hàng đã được hủy.");
                    fetchOrderDetails(); // Tải lại chi tiết đơn hàng để cập nhật trạng thái
                } catch (error) {
                    Alert.alert("Lỗi", error.response?.data?.message || "Không thể hủy đơn hàng.");
                    console.error("Cancel order failed:", error);
                } finally {
                    setIsCancelling(false);
                }
            }}
        ]
    );
  };

  const getStatusStyle = (status) => { // Copy từ OrderHistoryScreen hoặc tạo common util
    switch (status) {
      case 'Pending': return { color: '#ffc107', fontWeight: 'bold' };
      case 'Processing': return { color: '#17a2b8', fontWeight: 'bold' };
      case 'OutForDelivery': return { color: '#fd7e14', fontWeight: 'bold' };
      case 'Delivered': return { color: '#28a745', fontWeight: 'bold' };
      case 'Cancelled': return { color: '#dc3545', fontWeight: 'bold' };
      case 'Failed': return { color: '#6c757d', fontWeight: 'bold' };
      default: return { color: '#333' };
    }
  };


  if (isLoading) {
    return ( <View style={orderDetailStyles.centered}><ActivityIndicator size="large" color="tomato" /><Text>Đang tải chi tiết...</Text></View> );
  }
  if (error) {
    return ( <View style={orderDetailStyles.centered}><Text style={orderDetailStyles.errorText}>{error}</Text><TouchableOpacity onPress={fetchOrderDetails} style={orderDetailStyles.retryButton}><Text style={orderDetailStyles.retryButtonText}>Thử lại</Text></TouchableOpacity></View> );
  }
  if (!order) {
    return ( <View style={orderDetailStyles.centered}><Text>Không tìm thấy thông tin đơn hàng.</Text></View> );
  }

  return (
    <ScrollView style={orderDetailStyles.container}>
      <View style={orderDetailStyles.section}>
        <Text style={orderDetailStyles.sectionTitle}>Thông tin đơn hàng</Text>
        <InfoRow label="Mã đơn hàng:" value={`#${order.id}`} />
        <InfoRow label="Nhà hàng:" value={order.restaurant?.name || 'N/A'} />
        <InfoRow label="Ngày đặt:" value={new Date(order.orderDate).toLocaleString('vi-VN')} />
        <InfoRow label="Trạng thái:" value={order.status} valueStyle={getStatusStyle(order.status)} />
        <InfoRow label="Tổng tiền:" value={order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} valueStyle={{fontWeight: 'bold', color: 'green'}}/>
      </View>

      <View style={orderDetailStyles.section}>
        <Text style={orderDetailStyles.sectionTitle}>Thông tin giao hàng</Text>
        <InfoRow label="Người nhận:" value={order.user?.fullName || order.user?.username || 'N/A'} />
        <InfoRow label="Địa chỉ:" value={order.shippingAddress || 'N/A'} />
        <InfoRow label="Số điện thoại:" value={order.user?.phoneNumber || 'N/A'} />
        {order.notes && <InfoRow label="Ghi chú:" value={order.notes} />}
      </View>

      <View style={orderDetailStyles.section}>
        <Text style={orderDetailStyles.sectionTitle}>Chi tiết sản phẩm</Text>
        {order.orderItems.map((item, index) => (
          <View key={index.toString()} style={orderDetailStyles.dishItem}>
            <Text style={orderDetailStyles.dishName}>{item.dish?.name || 'Sản phẩm không xác định'} (x{item.quantity})</Text>
            <Text style={orderDetailStyles.dishPrice}>
              {(item.unitPrice * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Text>
          </View>
        ))}
      </View>
      
      {order.status === 'Pending' && (
        <TouchableOpacity 
            style={[orderDetailStyles.actionButton, orderDetailStyles.cancelButton]} 
            onPress={handleCancelOrder}
            disabled={isCancelling}
        >
            {isCancelling ? <ActivityIndicator color="#fff" /> : <Text style={orderDetailStyles.actionButtonText}>Hủy Đơn Hàng</Text>}
        </TouchableOpacity>
      )}
      {/* Nút Đánh giá nhà hàng (nếu đơn hàng đã Delivered) */}
      {order.status === 'Delivered' && (
          <TouchableOpacity
              style={[orderDetailStyles.actionButton, orderDetailStyles.reviewButton]}
              onPress={() => navigation.navigate('Home', { screen: 'CreateReview', params: { restaurantId: order.restaurantId, restaurantName: order.restaurant?.name }})}
          >
              <Text style={orderDetailStyles.actionButtonText}>Đánh giá nhà hàng</Text>
          </TouchableOpacity>
      )}

    </ScrollView>
  );
};

const InfoRow = ({ label, value, valueStyle }) => (
  <View style={orderDetailStyles.infoRow}>
    <Text style={orderDetailStyles.label}>{label}</Text>
    <Text style={[orderDetailStyles.value, valueStyle]}>{value}</Text>
  </View>
);

const orderDetailStyles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginHorizontal:10, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: 'tomato' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingVertical: 3 },
  label: { fontSize: 15, color: '#555', flex: 2 },
  value: { fontSize: 15, color: '#333', flex: 3, textAlign: 'right' },
  dishItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dishName: { fontSize: 15, color: '#444', flex: 1 },
  dishPrice: { fontSize: 15, color: '#444', fontWeight: '500' },
  errorText: { fontSize: 16, color: 'red', marginBottom: 15, textAlign: 'center' },
  retryButton: { backgroundColor: 'tomato', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8},
  retryButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold'},
  actionButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 10, marginTop: 15 },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#dc3545' }, // Đỏ
  reviewButton: { backgroundColor: '#007bff' }, // Xanh dương
});

export default OrderDetailScreen;