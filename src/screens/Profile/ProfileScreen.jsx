import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient'; // Sử dụng apiClient

const ProfileScreen = ({ navigation }) => {
  const { logout, currentUser, userToken, refreshUserInfo, updateCurrentUserContext } = useContext(AuthContext); // Thêm refreshUserInfo
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [address, setAddress] = useState(currentUser?.address || '');

  useEffect(() => {
    if (currentUser) {
        setFullName(currentUser.fullName || '');
        setPhoneNumber(currentUser.phoneNumber || '');
        setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const handleLogout = async () => { /* ... giữ nguyên ... */
    Alert.alert( "Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?",
      [ { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", onPress: async () => { await logout(); }}
      ]
    );
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
        await apiClient.put(`/users/me`, { fullName, phoneNumber, address } );
        Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật.");
        updateCurrentUserContext({ fullName, phoneNumber, address });
        
        setIsEditing(false);
    } catch (error) {
        Alert.alert("Lỗi", error.response?.data?.message || "Không thể cập nhật thông tin.");
    } finally {
        setIsLoading(false);
    }
  };

  if (!currentUser) { /* ... giữ nguyên ... */
    return ( <View style={profileStyles.centered}><ActivityIndicator size="large" color="tomato"/><Text>Đang tải...</Text></View> );
  }

  return ( /* ... JSX giữ nguyên, chỉ cần đảm bảo các state được bind đúng ... */
    <ScrollView style={profileStyles.container}>
      <Text style={profileStyles.header}>Thông Tin Cá Nhân</Text>
      <View style={profileStyles.infoItem}><Text style={profileStyles.label}>Tên đăng nhập:</Text><Text style={profileStyles.value}>{currentUser.username}</Text></View>
      <View style={profileStyles.infoItem}><Text style={profileStyles.label}>Email:</Text><Text style={profileStyles.value}>{currentUser.email}</Text></View>
      <View style={profileStyles.infoItem}><Text style={profileStyles.label}>Họ và tên:</Text>{isEditing ? (<TextInput style={profileStyles.input} value={fullName} onChangeText={setFullName} placeholder="Nhập họ và tên"/>) : (<Text style={profileStyles.value}>{fullName || 'Chưa cập nhật'}</Text>)}</View>
      <View style={profileStyles.infoItem}><Text style={profileStyles.label}>Số điện thoại:</Text>{isEditing ? (<TextInput style={profileStyles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Nhập số điện thoại" keyboardType="phone-pad"/>) : (<Text style={profileStyles.value}>{phoneNumber || 'Chưa cập nhật'}</Text>)}</View>
      <View style={profileStyles.infoItem}><Text style={profileStyles.label}>Địa chỉ:</Text>{isEditing ? (<TextInput style={profileStyles.input} value={address} onChangeText={setAddress} placeholder="Nhập địa chỉ" multiline/>) : (<Text style={profileStyles.value}>{address || 'Chưa cập nhật'}</Text>)}</View>
      <View style={profileStyles.infoItem}><Text style={profileStyles.label}>Vai trò:</Text><Text style={profileStyles.value}>{currentUser.roles?.join(', ') || 'Customer'}</Text></View>
      {isEditing ? (<View style={profileStyles.buttonContainer}><TouchableOpacity style={[profileStyles.button, profileStyles.saveButton]} onPress={handleSaveChanges} disabled={isLoading}>{isLoading ? <ActivityIndicator color="#fff"/> : <Text style={profileStyles.buttonText}>Lưu Thay Đổi</Text>}</TouchableOpacity><TouchableOpacity style={[profileStyles.button, profileStyles.cancelButton]} onPress={() => setIsEditing(false)} disabled={isLoading}><Text style={profileStyles.buttonText}>Hủy</Text></TouchableOpacity></View>) : (<TouchableOpacity style={[profileStyles.button, profileStyles.editButton]} onPress={() => setIsEditing(true)}><Text style={profileStyles.buttonText}>Chỉnh Sửa Thông Tin</Text></TouchableOpacity>)}
      <TouchableOpacity style={[profileStyles.button, profileStyles.logoutButton]} onPress={handleLogout}><Text style={profileStyles.buttonText}>Đăng Xuất</Text></TouchableOpacity>
    </ScrollView>
  );
};
// styles giữ nguyên
const profileStyles = StyleSheet.create({ centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa', }, header: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: '#333', }, infoItem: { marginBottom: 18, backgroundColor: 'white', padding: 15, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, }, label: { fontSize: 14, color: 'gray', marginBottom: 5, }, value: { fontSize: 17, color: '#333', }, input: { fontSize: 17, color: '#333', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingVertical: 5, }, buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, marginBottom: 15, }, button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 140, marginVertical: 8, }, editButton: { backgroundColor: '#007bff', }, saveButton: { backgroundColor: '#28a745', flex: 1, marginRight: 5, }, cancelButton: { backgroundColor: '#6c757d', flex: 1, marginLeft: 5, }, logoutButton: { backgroundColor: 'tomato', marginTop: 15, }, buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', }, });
export default ProfileScreen;