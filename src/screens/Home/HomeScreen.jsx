import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios'; // Giả sử bạn dùng axios
import { API_BASE_URL } from '../../utils/apiConfig';
import { getToken } from '../../utils/storageHelper'; // Để lấy token nếu API yêu cầu
// import RestaurantCard from '../../components/restaurant/RestaurantCard'; // Bạn sẽ tạo component này

// Placeholder cho RestaurantCard
const RestaurantCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    {/* <Image source={{ uri: item.imageUrl || 'default_image_url_placeholder' }} style={styles.cardImage} /> */}
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription}>{item.description?.substring(0,60)}...</Text>
      <Text style={styles.cardRating}>Đánh giá: {item.rating?.toFixed(1)}/5.0</Text>
      <Text style={styles.cardAddress}>{item.address}</Text>
    </View>
  </TouchableOpacity>
);


const HomeScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRestaurants = useCallback(async (term = '') => {
    setIsLoading(true);
    setError(null);
    try {
      // const token = await getToken(); // Lấy token nếu API yêu cầu xác thực
      // const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_BASE_URL}/restaurants`, {
        // headers,
        params: { searchTerm: term } // Gửi searchTerm nếu API hỗ trợ
      });
      setRestaurants(response.data);
    } catch (e) {
      console.error("Failed to fetch restaurants", e.response?.data || e.message);
      setError('Không thể tải danh sách nhà hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSearch = () => {
    fetchRestaurants(searchTerm);
  };


  if (isLoading && !restaurants.length) { // Chỉ hiển thị loading toàn màn hình khi chưa có dữ liệu
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="tomato" />
        <Text>Đang tải nhà hàng...</Text>
      </View>
    );
  }

  if (error && !restaurants.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Thử lại" onPress={() => fetchRestaurants(searchTerm)} color="tomato"/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhà hàng..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch} // Tìm kiếm khi nhấn enter/submit
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>
      {isLoading && <ActivityIndicator size="small" color="tomato" style={{marginVertical: 10}}/>}
      {restaurants.length === 0 && !isLoading && (
        <View style={styles.centered}>
            <Text>Không tìm thấy nhà hàng nào.</Text>
        </View>
      )}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RestaurantCard
            item={item}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id, restaurantName: item.name })}
          />
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={() => fetchRestaurants(searchTerm)} // Pull to refresh
        refreshing={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: 'tomato',
    paddingHorizontal: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  // Styles for RestaurantCard (placeholder)
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  // cardImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 10 },
  cardContent: {},
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  cardRating: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
  },
  cardAddress: {
    fontSize: 13,
    color: 'darkorange',
  }
});

export default HomeScreen;