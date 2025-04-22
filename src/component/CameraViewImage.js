import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import {BASE_URL, BASE_URL_SETTING} from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from 'react-native-flash-message';

export default function CameraViewImage({navigation, route}) {
  const {img, id} = route.params;

  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('captured', {
        uri: img.uri,
        type: 'image/jpeg',
        name: 'captured.jpg',
      });

      console.log(formData);
      console.log('form data');

      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(
        `${BASE_URL_SETTING}driver/attachPic?id=${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );
      console.log(response.body);

      console.log('responce data');
      console.log('Raw Response Data:', response.data);

      const data = await response.json();
      console.log('Raw Data:', data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      navigation.goBack();
      setLoading(false);
      showMessage({
        message: 'Upload Successfully Please Wait',
        type: 'success',
      });
    }
  };

  return (
    <View
      style={{
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image source={{uri: img.uri}} style={{width: 350, aspectRatio: 1}} />
      {loading ? (
        <ActivityIndicator color={'#000'} size={'large'} />
      ) : (
        <TouchableOpacity
          onPress={() => handleUpload()}
          style={{
            width: 150,
            height: 40,
            backgroundColor: '#3498db',
            borderRadius: 10,
            marginTop: 20,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{color: '#fff', fontFamily: 'Inter-SemiBold'}}>
            Upload
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
