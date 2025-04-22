/* eslint-disable no-unused-vars */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable quotes */
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import React, { createRef, useRef, useEffect, useState } from 'react';
//import SignatureCapture from 'react-native-signature-capture';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config';
import { showMessage } from 'react-native-flash-message';
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@react-navigation/native';
import SignatureScreen from 'react-native-signature-canvas';

export default function Signature({  route }) {
  const { jobId, uid } = route.params;
  const navigation = useNavigation();

  console.log('JOBID999', jobId, '--', uid);

  // send location delivered job
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [driverId, setDriverId] = useState();
  useEffect(() => {
    AsyncStorage.getItem('driverId').then(id => setDriverId(id));
  }, []);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLatitude(parseFloat(latitude));
        setLongitude(parseFloat(longitude));
      },

      error => {
        console.error(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0,
        interval: 5000,
        fastestInterval: 2000,
      },
    );
  }, []);



  const getCurrentLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(
        `${BASE_URL}driver/dropoffAdrr?id=${jobId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude,
            longitude,
          }),
        },
      );
      const data = await response.json();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const [storage, setStorage] = useState('');

  const [getImage, setGetImage] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [driverName, setDriverName] = useState('');
  const sign = createRef();
  const signRef = useRef();

  const saveSign = () => {
    sign.current.saveImage();
  };

  const resetSign = () => {
    sign.current.resetImage();
  };

  const [state, setState] = useState(false);
  const [signa, setSigna] = useState('');

  const _onSaveEvent = result => {

    setState(true);
    setSigna({ path: result.pathName });
    setGetImage(result.pathName);
  };

  const _onDragEvent = () => {
    // This callback will be called when the user enters signature
  };

  const handleSignOk = signature => {
    if (!signature) {
      Alert.alert('Error', 'Failed to capture signature. Please try again.');
      return;
    }
    signRef.current.readSignature();
    setGetImage(signature);
    setState(true);
  };

  const handleClear = () => {
    signRef.current.clearSignature();
  };

  const saveImageData = async () => {
    try {
      setIsLoading(true);  // Start loading
      const formData = new FormData();
      formData.append('sign_img', {
        uri: getImage,
        type: 'image/png',
        name: 'sign_img.png',
      });
      formData.append('name', driverName);

      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(`${BASE_URL}driver/signature?id=${jobId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseData = await response.json();

      if (responseData.data) {
        await handleUpdateJobStatus('Delivered');
      }
      Alert.alert('Successfully Delivered');
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error', 'Failed to upload signature. Try again.');
    } finally {
      setIsLoading(false);  // Stop loading
      showMessage({ message: 'Upload Successfully Please Wait', type: 'success' });
    }
  };


  const handleUpdateJobStatus = async status => {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(`${BASE_URL}driver/jobStatus?id=${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_status: status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await response.json();
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to update job status.');
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ backgroundColor: '#0F3B60' }} />
      <View
        style={{
          maxHeight: '100%',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: '100%',
            height: 100,
            backgroundColor: '#0F3B60',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{ width: '93%', height: 50, flexDirection: 'row' }}>
            <View
              style={{
                width: '25%',
                height: 50,
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Feather name="chevron-left" size={25} color="#fff" />
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: '50%',
                height: 50,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  color: '#fff',
                  fontSize: 18,
                }}>
                Job Detail
              </Text>
            </View>
            <View style={{ width: '25%', height: 50 }}></View>
          </View>
        </View>

        <View
          style={{
            width: '100%',
            height: 25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}>
          <Text style={{ fontFamily: 'Inter-SemiBold', color: '#0F3B60' }}>
            Job Id: {uid}
          </Text>
        </View>

        <View
          style={{
            width: '90%',
            height: 40,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: '#0F3B60',
            borderWidth: 1,
            marginTop: 10,
            borderRadius: 10,
          }}>
          <TextInput
            placeholderTextColor={'#000'}
            onChangeText={e => setDriverName(e)}
            value={driverName}
            placeholder="Enter Your Name"
            style={{ width: '90%', color: '#000' }}
          />
        </View>

        <View style={{ height: 550, width: '100%' }}>
          <SignatureScreen
            ref={signRef}
            onOK={handleSignOk}
            webStyle={`.m-signature-pad {border: 1px solid #000; }`}
            confirmText="Save"
            clearText="Clear"
          />

          {state ? (
            <>
              {isLoading ? (
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      width: '95%',
                      height: 45,
                      backgroundColor: '#CE6D17',
                      borderRadius: 10,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        height: 45,
                        backgroundColor: '#CE6D17',
                        borderRadius: 10,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <ActivityIndicator size={'small'} color={'#fff'} />
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      width: '95%',
                      height: 45,
                      backgroundColor: '#CE6D17',
                      borderRadius: 10,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {isLoading ? (
                      <ActivityIndicator color={'#000'} size={'small'} />
                    ) : driverName === '' ? (
                      <TouchableOpacity
                        onPress={() => Alert.alert('Name is Required')}
                        style={{ width: '100%' }}>
                        <View
                          style={{
                            width: '100%',
                            height: 45,
                            backgroundColor: '#CE6D17',
                            borderRadius: 10,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              fontFamily: 'Inter-SemiBold',
                            }}>
                            Delivered
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={driverName === '' ?
                          () => Alert.alert('Name is Required') :
                          saveImageData
                        }
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          backgroundColor: isLoading ? '#ddd' : '#CE6D17',
                          borderRadius: 10,
                          height: 45,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#000" />
                        ) : (
                          <Text style={{ color: '#fff', fontFamily: 'Inter-SemiBold' }}>
                            Delivered
                          </Text>
                        )}
                      </TouchableOpacity>

                    )}
                  </View>
                </View>
              )}
            </>
          ) : (
            <></>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  signature: {
    flex: 1,
    borderColor: '#D9D9D9',
    borderWidth: 1,
  },
  buttonStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#D9D9D9',
    margin: 10,
  },
});
