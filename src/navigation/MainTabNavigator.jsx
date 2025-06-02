import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Home/HomeScreen';
import RestaurantDetailScreen from '../screens/Home/RestaurantDetailScreen';
import CartScreen from '../screens/Cart/CartScreen';
import OrderHistoryScreen from '../screens/Order/OrderHistoryScreen';
import OrderDetailScreen from '../screens/Order/OrderDetailScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const OrderStack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Trang Chủ' }} />
      <HomeStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: 'Chi Tiết Nhà Hàng' }}/>
    </HomeStack.Navigator>
  );
}
function OrderStackNavigator() {
    return (
        <OrderStack.Navigator>
            <OrderStack.Screen name="OrderHistoryMain" component={OrderHistoryScreen} options={{ title: 'Lịch Sử Đơn Hàng' }} />
            <OrderStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Chi Tiết Đơn Hàng' }} />
        </OrderStack.Navigator>
    );
}


const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, 
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Trang Chủ' }}/>
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ Hàng' }}/>
      <Tab.Screen name="Orders" component={OrderStackNavigator} options={{ title: 'Đơn Hàng' }}/>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài Khoản' }}/>
    </Tab.Navigator>
  );
};
export default MainTabNavigator;
