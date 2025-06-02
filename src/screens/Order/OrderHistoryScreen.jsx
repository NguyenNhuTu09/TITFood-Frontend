import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as OrderService from '../../services/orderService';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await OrderService.getMyOrders();
      setOrders(data);
    } catch (e) {
      setError('Không thể tải lịch sử đơn hàng.');
      console.error("Fetch orders failed:", e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { color: '#ffc107', fontWeight: 'bold' }; // Vàng
      case 'Processing': return { color: '#17a2b8', fontWeight: 'bold' }; // Xanh dương
      case 'OutForDelivery': return { color: '#fd7e14', fontWeight: 'bold' }; // Cam
      case 'Delivered': return { color: '#28a745', fontWeight: 'bold' }; // Xanh lá
      case 'Cancelled': return { color: '#dc3545', fontWeight: 'bold' }; // Đỏ
      case 'Failed': return { color: '#6c757d', fontWeight: 'bold' }; // Xám
      default: return { color: '#333' };
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
        style={orderHistoryStyles.orderItem} 
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={orderHistoryStyles.orderHeader}>
        <Text style={orderHistoryStyles.orderId}>Đơn hàng #{item.id}</Text>
        <Text style={[orderHistoryStyles.orderStatus, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>
      <Text style={orderHistoryStyles.restaurantName}>Nhà hàng: {item.restaurant?.name || 'Không rõ'}</Text>
      <Text style={orderHistoryStyles.orderDate}>Ngày đặt: {new Date(item.orderDate).toLocaleDateString('vi-VN')}</Text>
      <Text style={orderHistoryStyles.orderTotal}>Tổng tiền: {item.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
      <View style={orderHistoryStyles.viewDetailsContainer}>
        <Text style={orderHistoryStyles.viewDetailsText}>Xem chi tiết</Text>
        <Ionicons name="chevron-forward-outline" size={18} color="tomato" />
      </View>
    </TouchableOpacity>
  );

  if (isLoading && orders.length === 0) {
    return ( <View style={orderHistoryStyles.centered}><ActivityIndicator size="large" color="tomato" /><Text>Đang tải đơn hàng...</Text></View> );
  }
  if (error && orders.length === 0) {
    return ( <View style={orderHistoryStyles.centered}><Text style={orderHistoryStyles.errorText}>{error}</Text><TouchableOpacity onPress={fetchOrders} style={orderHistoryStyles.retryButton}><Text style={orderHistoryStyles.retryButtonText}>Thử lại</Text></TouchableOpacity></View> );
  }
  if (!isLoading && orders.length === 0) {
    return ( <View style={orderHistoryStyles.centered}><Text style={orderHistoryStyles.emptyText}>Bạn chưa có đơn hàng nào.</Text><TouchableOpacity onPress={() => navigation.navigate('Home')} style={orderHistoryStyles.shopButton}><Text style={orderHistoryStyles.shopButtonText}>Đặt hàng ngay</Text></TouchableOpacity></View> );
  }

  return (
    <FlatList
      data={orders}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.id.toString()}
      style={orderHistoryStyles.container}
      contentContainerStyle={{paddingBottom: 10}}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["tomato"]}/>}
      ListHeaderComponent={<Text style={orderHistoryStyles.listHeader}>Lịch sử đơn hàng của bạn</Text>}
    />
  );
};

const orderHistoryStyles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listHeader: { fontSize: 20, fontWeight: 'bold', padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee', textAlign: 'center', color: '#333' },
  orderItem: {
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
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  orderStatus: { fontSize: 15 },
  restaurantName: { fontSize: 15, color: '#555', marginBottom: 4 },
  orderDate: { fontSize: 14, color: 'gray', marginBottom: 4 },
  orderTotal: { fontSize: 16, fontWeight: 'bold', color: 'green', marginBottom: 8 },
  viewDetailsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5 },
  viewDetailsText: { color: 'tomato', marginRight: 5, fontSize: 14, fontWeight: '500' },
  errorText: { fontSize: 16, color: 'red', marginBottom: 15, textAlign: 'center' },
  emptyText: { fontSize: 18, color: 'gray', marginBottom: 20, textAlign: 'center' },
  retryButton: { backgroundColor: 'tomato', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8},
  retryButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold'},
  shopButton: { backgroundColor: 'tomato', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8},
  shopButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold'},
});

export default OrderHistoryScreen;