import React, { createContext, useState, useEffect, useMemo } from 'react';
import { storeToken, removeToken, storeUserInfo, getUserInfo, removeUserInfo } from '../utils/storageHelper';
import apiClient from '../services/apiClient'; // Sử dụng apiClient đã cấu hình

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const updateCurrentUserContext = (newUserInfo) => {
    setCurrentUser(prevUser => ({...prevUser, ...newUserInfo}));
    storeUserInfo({...currentUser, ...newUserInfo}); // Lưu vào storage
  };


  const authContextValue = useMemo(() => ({
    login: async (loginIdentifier, password) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post(`/auth/login`, { // Sử dụng apiClient
          loginIdentifier,
          password,
        });
        const { token, userId, username, email, roles, fullName, address, phoneNumber } = response.data;
        if (token) {
          await storeToken(token);
          const userInfo = { userId, username, email, roles, fullName, address, phoneNumber };
          await storeUserInfo(userInfo);
          setUserToken(token);
          setCurrentUser(userInfo);
        }
        setIsLoading(false);
        return response.data;
      } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
        setIsLoading(false);
        throw error;
      }
    },
    register: async (username, email, password, fullName, phoneNumber) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post(`/auth/register`, { // Sử dụng apiClient
          username,
          email,
          password,
          fullName,
          phoneNumber,
        });
        setIsLoading(false);
        return response.data;
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
      setIsLoading(false);
    },
    refreshUserInfo: async () => { 
        if (!userToken) return;
        try {
            const response = await apiClient.get('/users/me');
            const { id, username, email, roles, fullName, address, phoneNumber } = response.data;
            const refreshedUserInfo = { userId: id, username, email, roles, fullName, address, phoneNumber };
            await storeUserInfo(refreshedUserInfo);
            setCurrentUser(refreshedUserInfo);
        } catch (error) {
            console.error("Failed to refresh user info:", error.response?.data || error.message);
            if (error.response?.status === 401) {
                await authContextValue.logout();
            }
        }
    },
    updateCurrentUserContext, // Export hàm này
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
        console.error('Restoring auth state failed', e);
      }
      if (token && userInfo) {
        setUserToken(token);
        setCurrentUser(userInfo);
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
