import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Có thể là email hoặc username
  const [password, setPassword] = useState('');
  const { login, isLoading: authIsLoading } = useContext(AuthContext); // đổi tên isLoading để tránh xung đột
  const [localIsLoading, setLocalIsLoading] = useState(false);


  const handleLogin = async () => {
    if (!loginIdentifier || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập/email và mật khẩu.');
      return;
    }
    setLocalIsLoading(true);
    try {
      await login(loginIdentifier, password);
      // Navigation to MainApp will be handled by AppNavigator due to userToken change
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLocalIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng đến TITFood!</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập hoặc Email"
        value={loginIdentifier}
        onChangeText={setLoginIdentifier}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      { (authIsLoading || localIsLoading) ? (
        <ActivityIndicator size="large" color="#tomato" style={styles.button}/>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Đăng Nhập</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'tomato',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: 'tomato',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default LoginScreen;