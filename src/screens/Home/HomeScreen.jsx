import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { TextInput, Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/apiConfig';
import { getToken } from '../../utils/storageHelper';

// Component hiển thị nhà hàng
const RestaurantCard = ({ item, onPress }) => (
  <Card style={styles.card} onPress={onPress}>
    {/* <Card.Cover source={{ uri: item.imageUrl || 'default_image_url_placeholder' }} /> */}
    <Card.Content>
      <Text variant="titleMedium" style={styles.cardTitle}>{item.name}</Text>
      <Text variant="bodyMedium" style={styles.cardDescription}>{item.description?.substring(0, 60)}...</Text>
      <Text variant="bodySmall" style={styles.cardRating}>Đánh giá: {item.rating?.toFixed(1)}/5.0</Text>
      <Text variant="bodySmall" style={styles.cardAddress}>{item.address}</Text>
    </Card.Content>
  </Card>
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
      // const token = await getToken();
      // const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_BASE_URL}/restaurants`, {
        // headers,
        params: { searchTerm: term }
      });
      setRestaurants(response.data);
    } catch (e) {
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

  if (isLoading && !restaurants.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" color="tomato" />
        <Text>Đang tải nhà hàng...</Text>
      </View>
    );
  }

  if (error && !restaurants.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => fetchRestaurants(searchTerm)} buttonColor="tomato">
          Thử lại
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Tìm kiếm nhà hàng..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
        <Button
          mode="contained"
          onPress={handleSearch}
          style={styles.searchButton}
          buttonColor="tomato"
        >
          Tìm
        </Button>
      </View>
      {isLoading && <ActivityIndicator animating={true} size="small" color="tomato" style={{ marginVertical: 10 }} />}
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
        onRefresh={() => fetchRestaurants(searchTerm)}
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
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'white',
  },
  searchButton: {
    borderRadius: 8,
    justifyContent: 'center',
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
  card: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 5,
    fontWeight: 'bold',
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
  },
});

export default HomeScreen;