import React, { createContext, useState, useEffect, useMemo } from 'react';
import { getToken, storeToken, removeToken, storeUserInfo, getUserInfo, removeUserInfo } from '../utils/storageHelper';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const authContextValue = useMemo(() => ({
    login: async (loginIdentifier, password) => {
      setIsLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          loginIdentifier,
          password,
        });
        const { token, userId, username, email, roles } = response.data;
        if (token) {
          await storeToken(token);
          const userInfo = { userId, username, email, roles };
          await storeUserInfo(userInfo);
          setUserToken(token);
          setCurrentUser(userInfo);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
         setIsLoading(false);
        return response.data; // Trả về toàn bộ response để xử lý thêm nếu cần
      } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
        setIsLoading(false);
        throw error; // Ném lỗi để màn hình Login có thể xử lý
      }
    },
    register: async (username, email, password, fullName, phoneNumber) => {
      setIsLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          username,
          email,
          password,
          fullName,
          phoneNumber,
        });
        setIsLoading(false);
        return response.data; // Trả về response để xử lý (ví dụ: tự động login sau khi đăng ký)
      } catch (error) {
        console.error('Registration failed:', error.response ? error.response.data : error.message);
        setIsLoading(false);
        throw error;
      }
    },
    logout: async () => {
      setIsLoading(true);
      await removeToken();
      await removeUserInfo();
      setUserToken(null);
      setCurrentUser(null);
      delete axios.defaults.headers.common['Authorization']; // Xóa token khỏi axios defaults
      setIsLoading(false);
    },
    userToken,
    currentUser,
    isLoading,
  }), [userToken, currentUser, isLoading]);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token;
      let userInfo;
      try {
        token = await getToken();
        userInfo = await getUserInfo();
      } catch (e) {
        // Restoring token failed
        console.error('Restoring token failed', e);
      }
      if (token && userInfo) {
        setUserToken(token);
        setCurrentUser(userInfo);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};