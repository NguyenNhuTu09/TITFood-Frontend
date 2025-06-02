import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'user_token';
const USER_INFO_KEY = 'user_info';

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save the token to storage', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to fetch the token from storage', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove the token from storage', e);
  }
};

export const storeUserInfo = async (userInfo) => {
  try {
    const jsonValue = JSON.stringify(userInfo);
    await AsyncStorage.setItem(USER_INFO_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save user info to storage', e);
  }
};

export const getUserInfo = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_INFO_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to fetch user info from storage', e);
    return null;
  }
};

export const removeUserInfo = async () => {
  try {
    await AsyncStorage.removeItem(USER_INFO_KEY);
  } catch (e) {
    console.error('Failed to remove user info from storage', e);
  }
};