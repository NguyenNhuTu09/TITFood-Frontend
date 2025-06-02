import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For star icons

const ReviewItem = ({ review }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color="#FFD700" // Gold color for stars
        />
      );
    }
    return stars;
  };

  return (
    <View style={reviewItemStyles.container}>
      <View style={reviewItemStyles.header}>
        <Text style={reviewItemStyles.userName}>{review.user?.fullName || review.user?.username || 'Ẩn danh'}</Text>
        <View style={reviewItemStyles.starsContainer}>
            {renderStars(review.rating)}
        </View>
      </View>
      <Text style={reviewItemStyles.comment}>{review.comment || 'Không có bình luận.'}</Text>
      <Text style={reviewItemStyles.date}>{new Date(review.reviewDate).toLocaleDateString('vi-VN')}</Text>
    </View>
  );
};

const reviewItemStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  comment: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
  },
});

export default ReviewItem;