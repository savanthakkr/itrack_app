/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  PermissionsAndroid,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';
import React, { useRef, useEffect, useState, useContext } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Card } from 'react-native-paper';
import { AuthContext } from './Context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { getFormattedDAndT } from './common/DateTimeFormate';
import DeviceInfo from 'react-native-device-info';
import Moment from 'react-moment';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function JobDetail({ route }) {
  const navigation = useNavigation();
  const { jobId } = route.params;

  // console.log(jobId);


  // const DATA = [
  //   { id: '1', title: 'Item 1', image: 'https://via.placeholder.com/150' },
  //   { id: '2', title: 'Item 2', image: 'https://via.placeholder.com/150' },
  //   { id: '3', title: 'Item 3', image: 'https://via.placeholder.com/150' },
  //   { id: '4', title: 'Item 4', image: 'https://via.placeholder.com/150' },
  //   { id: '5', title: 'Item 5', image: 'https://via.placeholder.com/150' },
  //   // Add more items as needed
  // ];

  // send location pick up job
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();

  useEffect(() => {
    const requestLocationPermission = async () => {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        console.log('Location permission granted');
        Geolocation.getCurrentPosition(
          pos => {
            console.log('Position:', pos); // <-- Add this to see the full response
            setLatitude(pos.coords.latitude);
            setLongitude(pos.coords.longitude);

          },
          error =>
            Alert.alert('GetCurrentPosition Error', JSON.stringify(error)),
          { enableHighAccuracy: true }
        );
      } else if (result === RESULTS.DENIED) {
        Alert.alert('Permission Denied', 'Location access is required.');
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert('Permission Blocked', 'Enable it in settings.');
      }
    };

    console.log(latitude);
    console.log(longitude);
    // const requestLocationPermission = async () => {
    //   try {
    //     if (Platform.OS === 'android') {
    //       const granted = await PermissionsAndroid.request(
    //         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //       );
    //       if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    //         console.log('Location permission denied');
    //         return;
    //       }
    //     }

    //     // Enable GPS mode check (for Android)
    //     Geolocation.getCurrentPosition(
    //       pos => {
    //         setLatitude(pos.coords.latitude);
    //         setLongitude(pos.coords.longitude);
    //         console.log(latitude);
    //         console.log(longitude);
    //       },
    //       error =>
    //         Alert.alert('GetCurrentPosition Error', JSON.stringify(error)),
    //       {enableHighAccuracy: true},
    //     );
    //   } catch (error) {
    //     console.error('Error requesting location permission:', error);
    //   }
    // };

    requestLocationPermission();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(`${BASE_URL}driver/pickupAdrr?id=${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      });
      const data = await response.json();
    } catch (error) {
      // console.error('Error:', error);
    }
  };

  const getCurrentLocationDrop = async () => {
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

  const renderItem = ({ item }) => (
    <View style={{ width: 150, marginLeft: 10 }}>
      <Image source={{ uri: item.image }} style={{ width: '100%', height: 150 }} />
      <Text>{item.title}</Text>
    </View>
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [InputNote, setInputNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [imageUri, setImageUri] = React.useState(null);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const status = await check(PERMISSIONS.ANDROID.CAMERA);

      if (status === RESULTS.GRANTED) {
        return true;
      }

      if (status === RESULTS.DENIED) {
        const newStatus = await request(PERMISSIONS.ANDROID.CAMERA);
        return newStatus === RESULTS.GRANTED;
      }

      if (status === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Required',
          'Camera access is required. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ],
        );
        return false;
      }
    }

    return true;
  };

  const openCamera = async () => {
    const isCameraPermitted = await requestCameraPermission();

    if (!isCameraPermitted) {
      Alert.alert(
        'Permission Required',
        'Camera access is required. Please enable it in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
      return;
    }
    const options = {
      mediaType: 'photo',
      cameraType: 'back',
    };

    launchCamera(options, response => {
      if (response.didCancel) {
      } else if (response.errorCode) {
        // console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        navigation.navigate('CameraViewImage', { img: source, id: data._id });
        setImageUri(source);
      }
    });
  };

  // download image

  const checkPermission = async url => {
    if (Platform.OS === 'ios') {
      downloadFile(url);
    } else {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);

        if (
          granted['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_MEDIA_IMAGES'] ===
          PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_MEDIA_VIDEO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          downloadFile(url);
        } else {
          Alert.alert(
            'Permission Denied',
            'Storage permission is required to download files.',
          );
        }
      } catch (err) {
        console.error('Permission error:', err);
        Alert.alert('Error', 'Failed to request permission. Please try again.');
      }
    }
  };

  const [getImgUri, setGetImgUri] = useState('');

  const downloadFile = async url => {
    try {
      const { config, fs } = RNFetchBlob;
      const fileExt = url.split('.').pop().toLowerCase();
      const date = new Date();
      const fileName = `download_${Math.floor(
        date.getTime() + date.getSeconds() / 2,
      )}.${fileExt}`;

      let filePath = '';
      if (Platform.OS === 'android') {
        filePath = fs.dirs.DownloadDir + '/' + fileName;
      } else {
        filePath = fs.dirs.DocumentDir + '/' + fileName;
      }

      config({
        fileCache: true,
        appendExt: fileExt,
        path: filePath,
        notification: true,
      })
        .fetch('GET', url)
        .then(res => {
          Alert.alert('Download Complete', `File saved to: ${res.path()}`, [
            {
              text: 'Open File',
              onPress: () => navigation.navigate('PDFViewer', { fileUrl: url }),
            },
            {
              text: 'Download Again',
              onPress: () => downloadFile(url),
            },
            { text: 'OK' },
          ]);
        })
        .catch(error => {
          console.error('Download error:', error);
          Alert.alert('Error', 'File download failed. Please try again.');
        });
    } catch (error) {
      console.error('DownloadFile Error:', error);
      Alert.alert('Error', 'Something went wrong while downloading the file.');
    }
  };

  const getExtention = filename => {
    const match = /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
    return match ? match[0] : 'bin'; // Default to '.bin'
  };

  useEffect(() => {
    const handleData = async () => {
      try {
        const token = await AsyncStorage.getItem('driverToken');
        const response = await fetch(`${BASE_URL}driver/jobById?id=${jobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const dataResponse = await response.json();
        // console.log('dataResponse:::', dataResponse.data);

        setData(dataResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    handleData();
    const interval = setInterval(() => {
      handleData();
    }, 1000); // 1000 milliseconds = 1 second

    return () => clearInterval(interval); //
  }, [jobId, refetch]);

  // console.log(data.VpapId);

  const insets = useSafeAreaInsets();

  const { loginType, setLoginType } = useContext(AuthContext);

  const [isOpenMain, setIsOpenMain] = useState(false);
  const [isOpenNote, setIsOpenNote] = useState(false);
  const [isOpenViewNote, setIsOpenviewNote] = useState(false);
  const translateAmin = useRef(
    new Animated.Value(isOpenMain ? 0 : 300),
  ).current;

  const translateNote = useRef(
    new Animated.Value(isOpenNote ? 0 : 300),
  ).current;

  const animateMain = () => {
    Animated.timing(translateAmin, {
      toValue: isOpenMain ? 300 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Animation completed
      setIsOpenMain(!isOpenMain);
    });
  };

  const animateNote = () => {
    Animated.timing(translateNote, {
      toValue: isOpenNote ? 300 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Animation completed
      setIsOpenNote(!isOpenNote);
    });
  };
  const [state, setState] = useState(1);

  const handleClick = () => {
    setIsOpenMain(true);
    animateMain();
  };

  const handleClickDown = () => {
    setIsOpenMain(false);
    animateMain();
  };

  const handleClickNote = () => {
    setIsOpenNote(true);
    animateNote();
  };

  const handleClickDownNote = () => {
    setIsOpenNote(false);
    animateNote();
  };

  if (loading) {
    return (
      <View
        style={{
          width: '100%',
          height: '67%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}>
        <View
          style={{
            width: '50%',
            height: 100,
            backgroundColor: '#fff',
            borderRadius: 20,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: '#000', fontSize: 14 }}>Loading</Text>
          <ActivityIndicator
            size="small"
            color={'#000'}
            style={{ marginTop: 10 }}
          />
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: '#000' }}>No data found</Text>
      </View>
    );
  }

  // console.log(data);

  const handleSubmit = async () => {
    setNoteLoading(true);
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(
        `${BASE_URL}driver/jobNote?job_id=${jobId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            driverNote: `${InputNote}`,
          }),
        },
      );
      const data = await response.json();
      setRefetch(prev => !prev);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setNoteLoading(false);
      handleClickDownNote();
    }
  };

  const handleUpdateJobStatus = async status => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(`${BASE_URL}driver/jobStatus?id=${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_status: `${status}`,
        }),
      });
      const data = await response.json();
      setRefetch(prev => !prev);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }

    console.log(status);

    if (status === 'Arrival on Pickup') {
      const location = await getCurrentLocation();
    }

    if (status === 'Arrival on Delivery') {
      const location = await getCurrentLocationDrop();
      try {
        const token = await AsyncStorage.getItem('driverToken');
        const response = await fetch(
          `${BASE_URL}driver/jobStatus?id=${jobId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              new_status: `${status}`,
              latitude: `${latitude}`,
              longitude: `${longitude}`,
            }),
          },
        );
        const data = await response.json();
        setRefetch(prev => !prev);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNav = (_id, uid) => {
    if (!_id || !uid) {
      console.error('Invalid data: Missing jobId or uid');
      return;
    }
    navigation.navigate('Signature', { jobId: _id, uid: uid });
  };
  // console.log(data.VpapId);

  return (
    <>
      {loading ? (
        <Text>Loading</Text>
      ) : (
        <>
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

              <ScrollView
                style={{ width: '100%' }}
                contentContainerStyle={{ paddingBottom: 120 }}>
                <View
                  style={{
                    width: '100%',
                    height: 25,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 20,
                  }}>
                  <Text
                    style={{ fontFamily: 'Inter-SemiBold', color: '#0F3B60' }}>
                    Job Id: {data.uid}
                  </Text>

                  {data.isVpap === true ? (
                    <>
                      {data.VpapId != null ? (
                        <View
                          style={{
                            width: 130,
                            height: 25,
                            backgroundColor: '#F1C40F',
                            marginLeft: 10,
                            borderRadius: 100,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.4,
                          }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: 'Inter-SemiBold',
                              color: '#000',
                            }}>
                            VPAP Required Done
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity>
                          <View
                            style={{
                              width: 100,
                              height: 25,
                              backgroundColor: '#F1C40F',
                              marginLeft: 10,
                              borderRadius: 100,
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: 'Inter-SemiBold',
                                color: '#000',
                              }}>
                              VPAP Required
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </View>

                <View
                  style={{
                    width: '100%',
                    height: 50,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 10,
                  }}>
                  {isLoading ? (
                    <ActivityIndicator size={'small'} color={'#000'} />
                  ) : (
                    <>
                      {data.currentStatus === 'Driver Assigned' ? (
                        <View
                          style={{
                            width: '90%',
                            height: 45,
                            backgroundColor: '#0F3B60',
                            borderRadius: 10,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() =>
                              handleUpdateJobStatus('Arrival on Pickup')
                            }
                            style={{ width: '100%', height: '100%' }}>
                            <View
                              style={{
                                flexDirection: 'column',
                                width: '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 18,
                                }}>
                                Arrived
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ) : data.currentStatus === 'Arrival on Pickup' ? (
                        <>
                          {data.isVpap === true ? (
                            <View
                              style={{
                                width: '90%',
                                height: 45,
                                backgroundColor: '#27AE60',
                                borderRadius: 10,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('VPAP', { id: data._id })
                                }
                                style={{ width: '100%', height: '100%' }}>
                                <View
                                  style={{
                                    flexDirection: 'column',
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontFamily: 'Inter-SemiBold',
                                      fontSize: 18,
                                    }}>
                                    Picked Up
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View
                              style={{
                                width: '90%',
                                height: 45,
                                backgroundColor: '#27AE60',
                                borderRadius: 10,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <TouchableOpacity
                                onPress={() =>
                                  handleUpdateJobStatus('Picked Up')
                                }
                                style={{ width: '100%', height: '100%' }}>
                                <View
                                  style={{
                                    flexDirection: 'column',
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontFamily: 'Inter-SemiBold',
                                      fontSize: 18,
                                    }}>
                                    Picked Up
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      ) : data.currentStatus === 'Picked Up' ? (
                        <View
                          style={{
                            width: '90%',
                            height: 45,
                            backgroundColor: '#8E44AD',
                            borderRadius: 10,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() =>
                              handleUpdateJobStatus('Arrival on Delivery')
                            }
                            style={{ width: '100%', height: '100%' }}>
                            <View
                              style={{
                                flexDirection: 'column',
                                width: '100%',
                                height: '100%',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 18,
                                }}>
                                Arrival on Delivery
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ) : data.currentStatus === 'Arrival on Delivery' ? (
                        <View
                          style={{
                            width: '90%',
                            height: 45,
                            backgroundColor: '#CE6D17',
                            borderRadius: 10,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() => handleNav(data._id, data.uid)}
                            style={{ width: '100%', height: '100%' }}>
                            <View
                              style={{
                                flexDirection: 'column',
                                width: '100%',
                                height: '100%',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 18,
                                }}>
                                Delivered
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ) : data.currentStatus === 'Delivered' ? (
                        <View
                          style={{
                            width: '90%',
                            height: 40,
                            backgroundColor: 'green',
                            borderRadius: 10,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              fontSize: 17,
                              fontFamily: 'Inter-SemiBold',
                            }}>
                            {' '}
                            Completed{' '}
                          </Text>
                        </View>
                      ) : data.currentStatus === 'Cancelling' ? (
                        <View
                          style={{
                            width: '90%',
                            height: 45,
                            backgroundColor: '#e74c3c',
                            borderRadius: 10,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() => handleUpdateJobStatus('Cancelled')}
                            style={{ width: '100%', height: '100%' }}>
                            <View
                              style={{
                                flexDirection: 'column',
                                width: '100%',
                                height: '100%',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 18,
                                }}>
                                Accept Cancellation
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ) : data.currentStatus === 'Cancelled' ? (
                        <View
                          style={{
                            width: '90%',
                            height: 45,
                            backgroundColor: '#e74c3c',
                            borderRadius: 10,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <View
                            style={{
                              flexDirection: 'column',
                              width: '100%',
                              height: '100%',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#fff',
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 18,
                              }}>
                              Cancelled
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </View>

                <View
                  style={{
                    width: '100%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 7,
                  }}>
                  <View
                    style={{
                      width: '90%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      height: 35,
                    }}>
                    <View
                      style={{
                        width: '48%',
                        height: 35,
                        backgroundColor: '#81ECEC',
                        borderRadius: 5,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <TouchableOpacity
                        style={{ width: '100%', height: '100%' }}
                        onPress={() => handleClick()}>
                        <View
                          style={{
                            width: '100%',
                            height: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              color: '#000',
                              fontFamily: 'Inter-SemiBold',
                              fontSize: 12,
                            }}>
                            Download Attachment
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    <View
                      style={{
                        width: '48%',
                        height: 35,
                        backgroundColor: '#55EFC4',
                        borderRadius: 5,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <TouchableOpacity
                        style={{ width: '100%', height: '100%' }}
                        onPress={() => handleClickNote()}>
                        <View
                          style={{
                            width: '100%',
                            height: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              color: '#000',
                              fontFamily: 'Inter-SemiBold',
                              fontSize: 12,
                            }}>
                            Add your note
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={{
                      width: '90%',
                      backgroundColor: '#DFE6E9',
                      paddingBottom: 10,
                      marginTop: 10,
                      borderRadius: 10,
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 10,
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                          color: '#0F3B60',
                          fontSize: 11,
                        }}>
                        Pickup Location :{' '}
                      </Text>

                      {data.pickUpDetails.pickupLocationId === null ? (
                        <Text
                          style={{
                            fontFamily: 'Inter-Light',
                            color: '#0F3B60',
                            fontSize: 11,
                            width: '75%',
                          }}>
                          null
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Inter-Light',
                            color: '#0F3B60',
                            fontSize: 11,
                            width: '70%',
                          }}>
                          {data.pickUpDetails.pickupLocationId.mapName}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 2,
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                          color: '#0F3B60',
                          fontSize: 11,
                        }}>
                        Service Code :{' '}
                      </Text>
                      {data.serviceCodeId === null ? (
                        <Text
                          style={{
                            fontFamily: 'Inter-Light',
                            color: '#0F3B60',
                            fontSize: 11,
                          }}>
                          Not Available
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Inter-Light',
                            color: '#0F3B60',
                            fontSize: 11,
                          }}>
                          {data.serviceCodeId.text}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 2,
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                          color: '#0F3B60',
                          fontSize: 11,
                        }}>
                        Service Type :{' '}
                      </Text>
                      {data.serviceTypeId === null ? (
                        <Text
                          style={{
                            fontFamily: 'Inter-Light',
                            color: '#0F3B60',
                            fontSize: 11,
                          }}>
                          Not Available
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Inter-Light',
                            color: '#0F3B60',
                            fontSize: 11,
                          }}>
                          {data.serviceTypeId.text}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 2,
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                          color: '#0F3B60',
                          fontSize: 11,
                        }}>
                        Pieces :{' '}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter-Light',
                          color: '#0F3B60',
                          fontSize: 11,
                        }}>
                        {data.pieces}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 2,
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                          color: '#0F3B60',
                          fontSize: 11,
                        }}>
                        Weight :{' '}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter-Light',
                          color: '#0F3B60',
                          fontSize: 11,
                        }}>
                        {data.weight} KG
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 10,
                        marginLeft: 10,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                          color: '#0F3B60',
                          fontSize: 11,
                        }}>
                        Drop Up Location :{' '}
                      </Text>

                      {data.dropOfDetails.dropOfLocationId === null ? (
                        <Text
                          style={{
                            fontFamily: 'Inter-Light',
                            color: '#0F3B60',
                            fontSize: 11,
                            width: '75%',
                          }}>
                          null
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontFamily: 'Inter-Light',
                            color: '#0F3B60',
                            fontSize: 11,
                            width: '70%',
                          }}>
                          {data.dropOfDetails.dropOfLocationId.mapName}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View
                    style={{
                      width: '90%',
                      backgroundColor: '#EEF6FE',
                      marginTop: 10,
                      borderRadius: 10,
                    }}>
                    <View
                      style={{
                        height: 40,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: '#CFCFCF',
                      }}>
                      <Text
                        style={{
                          color: '#0F3B60',
                          fontFamily: 'Inter-SemiBold',
                          fontSize: 13,
                        }}>
                        Client Detail
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 5,
                        marginBottom: 10,
                      }}>
                      <View style={{ width: '100%', marginBottom: 5 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginTop: 2,
                            marginLeft: 10,
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Inter-SemiBold',
                              color: '#0F3B60',
                              fontSize: 11,
                            }}>
                            Email : {''}
                          </Text>
                          <Text
                            style={{
                              width: '85%',
                              fontFamily: 'Inter-Light',
                              color: '#0F3B60',
                              fontSize: 11,
                            }}>
                            {data.clientId.email}
                          </Text>
                        </View>

                        <View
                          style={{
                            flexDirection: 'row',
                            marginTop: 2,
                            marginLeft: 10,
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Inter-SemiBold',
                              color: '#0F3B60',
                              fontSize: 11,
                            }}>
                            Phone :{' '}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'Inter-Light',
                              color: '#0F3B60',
                              fontSize: 11,
                            }}>
                            {' '}
                            {data.clientId.phone}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginTop: 2,
                            marginLeft: 10,
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Inter-SemiBold',
                              color: '#0F3B60',
                              fontSize: 11,
                            }}>
                            Company Name :{' '}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'Inter-Light',
                              color: '#0F3B60',
                              fontSize: 11,
                            }}>
                            {' '}
                            {data.clientId.companyName}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        width: '100%',
                        height: 1,
                        backgroundColor: '#CFCFCF',
                      }}></View>
                    <View
                      style={{ width: '100%', marginTop: 10, marginBottom: 10 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                          color: '#0F3B60',
                          fontSize: 12,
                          marginLeft: 10,
                        }}>
                        Job Note{' '}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: 'Inter-Medium',
                          color: '#0F3B60',
                          marginLeft: 10,
                        }}>
                        {data.note}
                      </Text>
                    </View>
                  </View>
                </View>
                {data.currentStatus === 'Delivered' ? (
                  <View
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                      width: '100%',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{ color: '#000', color: 'green' }}>
                      Delivered Verification
                    </Text>
                    <Text
                      style={{
                        color: '#0F3B60',
                        fontSize: 12,
                        fontFamily: 'Inter-Medium',
                      }}>
                      Driver Name : {data.signature_name}{' '}
                    </Text>
                    <Image
                      source={{
                        uri: `https://jdimages.blob.core.windows.net/jdimages/${data.signature_img}`,
                      }}
                      style={{
                        width: 150,
                        height: 150,
                        marginTop: 10,
                        borderRadius: 10,
                      }}
                    />
                  </View>
                ) : (
                  <></>
                )}

                {data.driverNote != null ? (
                  <TouchableOpacity
                    onPress={() => setIsOpenviewNote(true)}
                    style={{
                      width: '90%',
                      backgroundColor: '#38ada9',
                      borderRadius: 10,
                      marginTop: 20,
                      padding: 5,
                      height: 45,
                      justifyContent: 'center',
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-SemiBold',
                        color: '#fff',
                        fontSize: 15,
                        textAlign: 'center',
                      }}>
                      View Your Notes
                    </Text>
                    {/* <Text style={{fontFamily:"Inter-Medium",color:"#000",fontSize:10,textAlign:"center"}}>{data.driverNote}</Text> */}
                  </TouchableOpacity>
                ) : (
                  <></>
                )}

                <TouchableOpacity
                  onPress={() => openCamera()}
                  style={{
                    width: '90%',
                    height: 40,
                    backgroundColor: '#0984e3',
                    marginTop: 10,
                    borderRadius: 10,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}>
                  <Text style={{ fontFamily: 'Inter-Medium', color: '#fff' }}>
                    Open Camera
                  </Text>
                </TouchableOpacity>

                {data.capturedPic.length === 0 ? (
                  <></>
                ) : (
                  <View style={{ alignItems: 'center', marginTop: 40 }}>
                    {data.capturedPic
                      .slice()
                      .reverse()
                      .map(item => {
                        return (
                          <Image
                            source={{
                              uri: `https://jdimages.blob.core.windows.net/jdimages/${item}`,
                            }}
                            style={{
                              width: 320,
                              height: 200,
                              borderRadius: 10,
                              marginTop: 10,
                            }}
                          />
                        );
                      })}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
          {isOpenMain ? (
            <View
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}>
              <Animated.View
                style={{
                  width: '100%',
                  height: 250,
                  backgroundColor: '#F4F2F2',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  elevation: 5,
                  transform: [{ translateY: translateAmin }],
                }}>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    height: 30,
                    marginTop: 20,
                  }}>
                  <View style={{ width: '25%', height: '100%' }}></View>
                  <View
                    style={{
                      width: '50%',
                      height: '100%',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{ color: '#0F3B60', fontFamily: 'Inter-SemiBold' }}>
                      Attachments
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '25%',
                      height: '100%',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity onPress={() => handleClickDown()}>
                      <Feather
                        name="x"
                        style={{ marginRight: 15 }}
                        size={20}
                        color="#0F3B60"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {data.attachmentKeys.length === 0 ? (
                  <View
                    style={{
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        fontFamily: 'Inter-SemiBold',
                        marginTop: 20,
                      }}>
                      {' '}
                      No Data Available
                    </Text>
                  </View>
                ) : (
                  <>
                    {data.attachmentKeys.map((it, index) => {
                      return (
                        <View
                          key={it} // Added key prop here
                          style={{
                            width: '100%',
                            height: 40,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottomColor: '#C8C3C3',
                            borderBottomWidth: 1,
                          }}>
                          <View
                            style={{
                              width: '90%',
                              height: 40,
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <TouchableOpacity
                              onPress={() =>
                                checkPermission(
                                  `https://jdimages.blob.core.windows.net/jdimages/${it}`,
                                )
                              }>
                              <View
                                style={{
                                  width: '100%',
                                  height: 40,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <View
                                  style={{
                                    width: '100%',
                                    height: 40,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      height: '100%',
                                      alignItems: 'center',
                                    }}>
                                    <FontAwesome
                                      name="file-photo-o"
                                      size={18}
                                      color="#4E4E4E"
                                    />
                                    <Text
                                      style={{
                                        marginLeft: 10,
                                        color: '#4E4E4E',
                                        fontFamily: 'Inter-SemiBold',
                                      }}>
                                      File Name {index + 1}
                                    </Text>
                                  </View>
                                  <Feather
                                    name="download"
                                    size={20}
                                    color="#4E4E4E"
                                  />
                                </View>
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}
              </Animated.View>
            </View>
          ) : (
            <></>
          )}

          {isOpenNote ? (
            <View
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <Animated.View
                style={{
                  // width: '100%',
                  height: 250,
                  backgroundColor: '#F4F2F2',
                  borderRadius: 16,
                  marginHorizontal: 16,
                  // borderTopLeftRadius: 20,
                  // borderTopRightRadius: 20,
                  elevation: 5,
                  transform: [{ translateY: translateNote }],
                }}>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    height: 30,
                    marginTop: 20,
                  }}>
                  <View style={{ width: '25%', height: '100%' }}></View>
                  <View
                    style={{
                      width: '50%',
                      height: '100%',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{ color: '#0F3B60', fontFamily: 'Inter-SemiBold' }}>
                      Driver Note
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '25%',
                      height: '100%',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity onPress={() => handleClickDownNote()}>
                      <Feather
                        name="x"
                        style={{ marginRight: 15 }}
                        size={20}
                        color="#0F3B60"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={{
                    height: 150,
                    width: '100%',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 30,
                    borderRadius: 10,
                  }}>
                  <Card
                    style={{
                      width: '90%',
                      height: 100,
                      backgroundColor: '#f1eaea',
                      padding: 5,
                    }}>
                    <View style={{ width: '100%', height: '100%' }}>
                      <TextInput
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={e => setInputNote(e)}
                        placeholder="Enter note here"
                        placeholderTextColor={'#9A9A9A'}
                        style={{
                          height: 200,
                          textAlignVertical: 'top',
                          color: '#000',
                        }}
                      />
                    </View>
                  </Card>

                  <View
                    style={{
                      width: '100%',
                      height: 50,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 10,
                    }}>
                    {noteLoading ? (
                      <ActivityIndicator size={'small'} color={'#000'} />
                    ) : InputNote === '' ? (
                      <View
                        style={{
                          width: 120,
                          height: 35,
                          backgroundColor: 'gray',
                          borderRadius: 10,
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{ color: '#fff', fontFamily: 'Inter-SemiBold' }}>
                          Submit
                        </Text>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity onPress={() => handleSubmit()}>
                          <View
                            style={{
                              width: 120,
                              height: 35,
                              backgroundColor: '#6EEDA4',
                              borderRadius: 10,
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#0F3B60',
                                fontFamily: 'Inter-SemiBold',
                              }}>
                              Submit
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </Animated.View>
            </View>
          ) : (
            <></>
          )}
        </>
      )}
      {isOpenViewNote ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'absolute',
            paddingTop: insets.top,
          }}>
          <View
            style={{
              width: '100%',
              height: 50,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <Feather
              name="x"
              size={25}
              style={{ marginRight: 15, color: '#fff' }}
              onPress={() => setIsOpenviewNote(false)}
            />
          </View>
          <View
            style={{
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 30,
            }}>
            <ScrollView
              style={{
                width: '90%',
                height: 400,
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 7,
              }}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  borderBottomColor: '#535c68',
                  borderBottomWidth: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: '#000', fontFamily: 'Inter-SemiBold' }}>
                  Note Here
                </Text>
              </View>

              {data.driverNote
                .slice()
                .reverse()
                .map(it => {
                  return (
                    <View
                      style={{
                        backgroundColor: '#dcdde1',
                        padding: 10,
                        marginTop: 10,
                        borderRadius: 5,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Inter-Medium',
                          color: '#3498db',
                          fontSize: 12,
                        }}>
                        {it.text}
                      </Text>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          marginTop: 10,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Medium',
                            color: '#000',
                            fontSize: 10,
                            fontStyle: 'italic',
                          }}>
                          {' '}
                          <Moment element={Text} format="DD.MMM.YYYY hh:mm A">
                            {it.createdAt}
                          </Moment>
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      ) : (
        <></>
      )}
    </>
  );
}
