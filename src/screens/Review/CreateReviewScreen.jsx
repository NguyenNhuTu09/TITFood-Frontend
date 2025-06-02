import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import * as ReviewService from '../../services/reviewService';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For star rating

const CreateReviewScreen = ({ route, navigation }) => {
  const { restaurantId, restaurantName } = route.params;
  const { userToken } = useContext(AuthContext);
  const [rating, setRating] = useState(0); // 0 means no rating selected yet
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao đánh giá.');
      return;
    }
    if (!userToken) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    setIsLoading(true);
    try {
      await ReviewService.createReview({
        restaurantId,
        rating,
        comment,
      });
      Alert.alert('Thành công', 'Cảm ơn bạn đã gửi đánh giá!');
      navigation.goBack(); // Quay lại màn hình chi tiết nhà hàng
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
      console.error('Submit review failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => handleRating(i)} style={reviewStyles.starButton}>
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={35}
            color={i <= rating ? "#FFD700" : "#ccc"}
          />
        </TouchableOpacity>
      );
    }
    return <View style={reviewStyles.starsContainer}>{stars}</View>;
  };


  return (
    <View style={reviewStyles.container}>
      <Text style={reviewStyles.title}>Đánh giá cho {restaurantName}</Text>
      
      <Text style={reviewStyles.label}>Chất lượng:</Text>
      {renderStarRating()}

      <Text style={reviewStyles.label}>Bình luận của bạn (tùy chọn):</Text>
      <TextInput
        style={reviewStyles.inputComment}
        placeholder="Chia sẻ cảm nhận của bạn..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="tomato" style={{marginTop: 20}}/>
      ) : (
        <TouchableOpacity style={reviewStyles.submitButton} onPress={handleSubmitReview}>
          <Text style={reviewStyles.submitButtonText}>Gửi Đánh Giá</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const reviewStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    marginTop: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Căn giữa các ngôi sao
    marginBottom: 20,
  },
  starButton: {
    paddingHorizontal: 5, // Thêm padding để dễ nhấn hơn
  },
  inputComment: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top', // For Android multiline
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: 'tomato',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateReviewScreen;