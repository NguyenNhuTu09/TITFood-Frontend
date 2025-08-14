import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading: authIsLoading } = useContext(AuthContext);
  const [localIsLoading, setLocalIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginIdentifier || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập/email và mật khẩu.');
      return;
    }
    setLocalIsLoading(true);
    try {
      await login(loginIdentifier, password);
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLocalIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text variant="headlineLarge" style={styles.title}>
          Chào mừng đến TITFood!
        </Text>
        <TextInput
          label="Tên đăng nhập hoặc Email"
          value={loginIdentifier}
          onChangeText={setLoginIdentifier}
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
        />
        <TextInput
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
        />
        {(authIsLoading || localIsLoading) ? (
          <ActivityIndicator animating={true} size="large" color="tomato" style={styles.loading} />
        ) : (
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            buttonColor="tomato"
            contentStyle={{ paddingVertical: 8 }}
          >
            Đăng Nhập
          </Button>
        )}
        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          textColor="tomato"
        >
          Chưa có tài khoản? Đăng ký ngay
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  inner: {
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    marginBottom: 18,
  },
  button: {
    marginBottom: 16,
    borderRadius: 8,
  },
  loading: {
    marginVertical: 16,
  },
});

export default LoginScreen;