/* eslint-disable no-alert */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  PermissionsAndroid,
  Image,
  Linking,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import React, {useRef, useEffect, useState, useContext} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Card} from 'react-native-paper';
import {AuthContext} from '../Context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../../config';
import Moment from 'react-moment';
import {getFormattedDAndT} from '../common/DateTimeFormate';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function AdminJobDetail({navigation, route}) {
  const {loginType, setLoginType} = useContext(AuthContext);

  const {jobId} = route.params;

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
      const {config, fs} = RNFetchBlob;
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
              onPress: () => navigation.navigate('PDFViewer', {fileUrl: url}),
            },
            {
              text: 'Download Again',
              onPress: () => downloadFile(url),
            },
            {text: 'OK'},
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
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
  };

  const [driverNote, setDriverNote] = useState('');

  const [isOpenMain, setIsOpenMain] = useState(false);
  const [isOpenNote, setIsOpenNote] = useState(false);
  const [isOpenAssignDriver, setIsOpenAssignDriver] = useState(false);
  const [isOpenViewNote, setIsOpenviewNote] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const translateAmin = useRef(
    new Animated.Value(isOpenMain ? 0 : 300),
  ).current;

  const translateNote = useRef(
    new Animated.Value(isOpenNote ? 0 : 300),
  ).current;

  const translateAssignNote = useRef(
    new Animated.Value(isOpenAssignDriver ? 0 : 300),
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

  const animateAssignDriver = () => {
    Animated.timing(translateAssignNote, {
      toValue: isOpenAssignDriver ? 300 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Animation completed
      setIsOpenAssignDriver(!isOpenAssignDriver);
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

  const handleClickAssignDriver = () => {
    setIsOpenAssignDriver(true);
    animateAssignDriver();
  };

  const handleClickDownAssignDriver = () => {
    setIsOpenAssignDriver(false);
    animateAssignDriver();
  };

  const [dropDown, setDropDown] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [selectedFName, setSelectedFName] = useState();
  const [selectedLName, setSelectedLName] = useState();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverData, setDriverData] = useState([]);
  const [driverloading, setDriverloading] = useState(false);
  const [driverAssignloading, setDriverAssignloading] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const handleChange = (id, firstname, lastname) => {
    setSelectedId(id);
    setSelectedFName(firstname);
    setSelectedLName(lastname);
    setDropDown(false);
  };

  // console.log(data.VpapId);

  useEffect(() => {
    const handleData = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken');
        const response = await fetch(
          `${BASE_URL}admin/job/jobById?id=${jobId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        setData(data.data);
        console.log(data);
        console.log(data.data);
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

  const insets = useSafeAreaInsets();

  // console.log(data.deliveredVerificationImage);
  // console.log(data.signature_name);

  // console.log(data);
  // console.log("arrivel time");

  useEffect(() => {
    setDriverloading(true);
    const handleDataDriver = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken');
        const response = await fetch(`${BASE_URL}admin//info/allDrivers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setDriverData(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setDriverloading(false);
      }
    };
    handleDataDriver();
  }, []);

  const handleUpdateJobStatus = async status => {
    setIsLoading(false);
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const response = await fetch(`${BASE_URL}/admin/job/status?id=${jobId}`, {
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
      // console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // console.log(data);
  // console.log("data.capturedPic");

  const handleClickSubmitAssignDriver = async () => {
    setDriverAssignloading(false);
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const response = await fetch(`${BASE_URL}admin/job/driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_id: `${jobId}`,
          driver_id: `${selectedId}`,
        }),
      });
      const data = await response.json();
      setRefetch(prev => !prev);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setDriverAssignloading(false);
      handleClickDownAssignDriver();
    }
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
          <Text style={{color: '#000', fontSize: 14}}>Loading</Text>
          <ActivityIndicator
            size="small"
            color={'#000'}
            style={{marginTop: 10}}
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
        <Text style={{color: '#000'}}>No data found</Text>
      </View>
    );
  }

  const openMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open Google Maps');
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  return (
    <>
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <SafeAreaView style={{backgroundColor: '#0F3B60'}} />

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
          <View style={{width: '93%', height: 50, flexDirection: 'row'}}>
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
            <View style={{width: '25%', height: 50}} />
          </View>
        </View>

        <ScrollView contentContainerStyle={{paddingBottom: 120}}>
          <View
            style={{
              width: '100%',
              height: 25,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
            }}>
            <Text style={{fontFamily: 'Inter-SemiBold', color: '#0F3B60'}}>
              Job Id: {data.uid}
            </Text>
            {data.isVpap === true ? (
              <>
                {data.VpapId != null ? (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('AdminVpap', {
                        id: data._id,
                        jobId: data.uid,
                        vpapId: data.VpapId,
                      })
                    }>
                    <View
                      style={{
                        width: 120,
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
                        VPAP Required Done
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
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
                      opacity: 0.5,
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
                )}
              </>
            ) : (
              <></>
            )}
          </View>

          <View
            style={{
              width: '100%',
              height: 25,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 5,
              marginBottom: 5,
            }}>
            <Text style={{fontFamily: 'Inter-SemiBold', color: '#0F3B60'}}>
              Invoice : {data.invoice_number}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              marginTop: 5,
            }}>
            <View style={{width: '90%', flexDirection: 'row'}}>
              <View style={{width: '50%'}}>
                <View style={{flexDirection: 'row', width: '100%'}}>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    AWB :
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    {' '}
                    {data.AWB}
                  </Text>
                </View>
                <View
                  style={{flexDirection: 'row', marginTop: 5, width: '100%'}}>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    Driver Name:{' '}
                  </Text>
                  {data.driverId === null ? (
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: '#0F3B60',
                        fontSize: 11,
                        width: '50%',
                      }}
                      numberOfLines={1}>
                      Not Assign Driver
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: '#0F3B60',
                        fontSize: 11,
                        width: '50%',
                      }}
                      numberOfLines={1}>
                      {data.driverId.firstname} {data.driverId.lastname}
                    </Text>
                  )}
                </View>
                <View style={{flexDirection: 'row', marginTop: 5}}>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    Pieces:{' '}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    {data.pieces}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: '50%',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    Service Code:{' '}
                  </Text>
                  {data.serviceCodeId === null ? (
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: '#0F3B60',
                        fontSize: 11,
                      }}>
                      {' '}
                      Not Available
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: '#0F3B60',
                        fontSize: 11,
                      }}>
                      {' '}
                      {data.serviceCodeId.text}
                    </Text>
                  )}
                </View>

                <View style={{flexDirection: 'row', marginTop: 5}}>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    Weight:{' '}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    {data.weight}KG
                  </Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 5}}>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    Service Type:
                  </Text>
                  {data.serviceTypeId === null ? (
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: '#0F3B60',
                        fontSize: 11,
                      }}>
                      {' '}
                      Not Available{' '}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: '#0F3B60',
                        fontSize: 11,
                      }}>
                      {' '}
                      {data.serviceTypeId.text}{' '}
                    </Text>
                  )}
                </View>
              </View>
            </View>
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
            <View
              style={{
                width: '90%',
                height: 45,

                borderRadius: 10,
                marginBottom: 10,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isLoading ? (
                <ActivityIndicator size={'small'} color={'#000'} />
              ) : (
                <>
                  <View
                    style={{
                      width: '100%',
                      height: 45,
                      backgroundColor: '#0F3B60',
                      borderRadius: 10,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => handleClickAssignDriver()}
                      style={{width: '100%', height: '100%'}}>
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
                          Assign Driver
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>

          <View
            style={{
              width: '90%',
              height: 40,
              backgroundColor: '#81ECEC',
              borderRadius: 5,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 5,
              alignSelf: 'center',
            }}>
            <TouchableOpacity
              style={{width: '100%', height: '100%'}}
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
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 7,
            }}>
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
                style={{flexDirection: 'row', marginTop: 15, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Pickup Location :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,

                    width: '67%',
                  }}>
                  {data?.pickUpDetails?.pickupLocationId?.mapName}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
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
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  customName :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  {data?.pickUpDetails?.pickupLocationId?.customName}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
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
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
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
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
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
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Fuel Charge :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  {data.fuel_charge}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Rates :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  {data.rates}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Wait time charge :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  {data.wait_time_charge}
                </Text>
              </View>

              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Pickup Address :{' '}
                </Text>
                <TouchableOpacity>
                  <Text
                    style={{
                      fontFamily: 'Inter-Light',
                      color: '#0F3B60',
                      fontSize: 12,
                    }}
                    onPress={() =>
                      openMap(
                        data.pickUpDetails.pickupLocationId.latitude,
                        data.pickUpDetails.pickupLocationId.longitude,
                      )
                    }>
                    Click Here To Check Location
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                width: '90%',
                backgroundColor: '#DEEFFF',
                paddingBottom: 10,
                marginTop: 10,
                borderRadius: 10,
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <View
                style={{flexDirection: 'row', marginTop: 10, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Drop Off Location :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,
                    width: '70%',
                  }}>
                  {data?.dropOfDetails?.dropOfLocationId?.mapName}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  customName :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  {data?.dropOfDetails?.dropOfLocationId?.customName}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Cut Off Time :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  {/* <Moment element={Text} format="hh:mm A">
                    {data.dropOfDetails.cutOffTime}
                  </Moment> */}
                  {data.dropOfDetails.cutOffTime
                    ? getFormattedDAndT(data.dropOfDetails.cutOffTime)
                    : ''}
                </Text>
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Arrival Time :{' '}
                </Text>
                {data.pickUpDetails.arrivalTime == null ? (
                  <Text
                    style={{
                      fontFamily: 'Inter-Light',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    null
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontFamily: 'Inter-Light',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    {data.pickUpDetails.arrivalTime
                      ? getFormattedDAndT(data.pickUpDetails.arrivalTime)
                      : ''}
                    {/* <Moment element={Text} format="hh:mm A">
                      {data.dropOfDetails.arrivalTime}
                    </Moment> */}
                  </Text>
                )}
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Delivery Time :{' '}
                </Text>
                {data.dropOfDetails.deliveredTime === null ? (
                  <Text
                    style={{
                      fontFamily: 'Inter-Light',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    null
                  </Text>
                ) : (
                  <Text
                    style={{
                      fontFamily: 'Inter-Light',
                      color: '#0F3B60',
                      fontSize: 11,
                    }}>
                    {data.dropOfDetails.deliveredTime
                      ? getFormattedDAndT(data.dropOfDetails.deliveredTime)
                      : ''}
                    {/* <Moment element={Text} format="hh:mm A">
                      {data.dropOfDetails.deliveredTime}
                    </Moment> */}
                  </Text>
                )}
              </View>
              <View
                style={{flexDirection: 'row', marginTop: 2, marginLeft: 10}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    color: '#0F3B60',
                    fontSize: 11,
                  }}>
                  Delivery Address :{' '}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Light',
                    color: '#0F3B60',
                    fontSize: 11,
                    width: '80%',
                  }}>
                  <TouchableOpacity>
                    <Text
                      style={{
                        fontFamily: 'Inter-Light',
                        color: '#0F3B60',
                        fontSize: 12,
                      }}
                      onPress={() =>
                        openMap(
                          data.dropOfDetails.dropOfLocationId.latitude,
                          data.dropOfDetails.dropOfLocationId.longitude,
                        )
                      }>
                      Click Here To Check Location
                    </Text>
                  </TouchableOpacity>
                </Text>
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
                  flexDirection: 'column',
                  marginTop: 5,
                  marginBottom: 10,
                }}>
                <View style={{width: '100%'}}>
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
                      Email :{' '}
                    </Text>
                    <Text
                      style={{
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

                <View
                  style={{
                    width: '100%',
                    height: 1,
                    backgroundColor: '#CFCFCF',
                    marginTop: 5,
                    marginBottom: 5,
                  }}
                />

                <View style={{width: '100%'}}>
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
                      fontFamily: 'Inter-Light',
                      color: '#0F3B60',
                      marginLeft: 10,
                    }}>
                    {data.note}
                  </Text>
                </View>
                {data.driverNote != null ? (
                  <TouchableOpacity
                    onPress={() => setIsOpenviewNote(true)}
                    style={{
                      width: '100%',
                      backgroundColor: '#38ada9',
                      borderRadius: 10,
                      marginTop: 20,
                      padding: 5,
                      height: 50,
                      justifyContent: 'center',
                      flexDirection: 'column',
                      marginBottom: 5,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-SemiBold',
                        color: '#fff',
                        fontSize: 15,
                        textAlign: 'center',
                      }}>
                      View Driver Note{' '}
                    </Text>

                    {/* <Text style={{fontFamily:"Inter-Medium",color:"#000",fontSize:10,textAlign:"center"}}>{data.driverNote}</Text> */}
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
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
              <Text style={{color: 'green'}}>Delivered Verification</Text>
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
          {data.capturedPic.length === 0 ? (
            <></>
          ) : (
            <>
              <Text
                style={{
                  fontFamily: 'Inter-Medium',
                  color: '#000',
                  fontSize: 12,
                }}>
                Driver Uploaded Image
              </Text>
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
            </>
          )}
        </ScrollView>
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
              transform: [{translateY: translateAmin}],
            }}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                height: 30,
                marginTop: 20,
              }}>
              <View style={{width: '25%', height: '100%'}} />
              <View
                style={{
                  width: '50%',
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#0F3B60', fontFamily: 'Inter-SemiBold'}}>
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
                    style={{marginRight: 15}}
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
              transform: [{translateY: translateNote}],
            }}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                height: 30,
                marginTop: 20,
              }}>
              <View style={{width: '25%', height: '100%'}} />
              <View
                style={{
                  width: '50%',
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#0F3B60', fontFamily: 'Inter-SemiBold'}}>
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
                    style={{marginRight: 15}}
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
                <View style={{width: '100%', height: '100%'}}>
                  <TextInput
                    multiline={true}
                    numberOfLines={4}
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
                    style={{color: '#0F3B60', fontFamily: 'Inter-SemiBold'}}>
                    Submit
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      ) : (
        <></>
      )}

      {isOpenAssignDriver ? (
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
              height: 400,
              backgroundColor: '#F4F2F2',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              elevation: 5,
              transform: [{translateY: translateAssignNote}],
            }}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                height: 30,
                marginTop: 20,
              }}>
              <View style={{width: '25%', height: '100%'}} />
              <View
                style={{
                  width: '50%',
                  height: '100%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#0F3B60', fontFamily: 'Inter-SemiBold'}}>
                  Assign Driver
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
                <TouchableOpacity onPress={() => handleClickDownAssignDriver()}>
                  <Feather
                    name="x"
                    style={{marginRight: 15}}
                    size={20}
                    color="#0F3B60"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 30,
                borderRadius: 10,
              }}>
              <View
                style={{
                  width: '90%',
                  height: dropDown === true ? 200 : 50,
                  backgroundColor: '#E1E1E1',
                  borderRadius: 10,
                  flexDirection: 'column',
                }}>
                <View
                  style={{
                    width: '100%',
                    height: 50,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  {selectedId === '' ? (
                    <Text
                      style={{
                        marginLeft: 10,
                        color: '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                      }}>
                      Choose driver
                    </Text>
                  ) : (
                    <Text
                      style={{
                        marginLeft: 10,
                        color: '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                      }}>
                      {selectedFName} {selectedLName}
                    </Text>
                  )}

                  {dropDown === true ? (
                    <TouchableOpacity onPress={() => setDropDown(false)}>
                      <Feather
                        name="chevron-up"
                        style={{marginRight: 10}}
                        size={20}
                        color="#726E6E"
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setDropDown(true)}>
                      <Feather
                        name="chevron-down"
                        style={{marginRight: 10}}
                        size={20}
                        color="#726E6E"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {dropDown === true ? (
                  <View style={{height: 150}}>
                    <ScrollView>
                      {driverData.map(driverItem => {
                        return (
                          <View style={{width: '100%', height: 50}}>
                            <TouchableOpacity
                              onPress={() =>
                                handleChange(
                                  driverItem._id,
                                  driverItem.firstname,
                                  driverItem.lastname,
                                )
                              }>
                              <View
                                style={{
                                  width: '100%',
                                  height: 50,
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  borderBottomColor: '#726E6E',
                                  backgroundColor:
                                    selectedId === driverItem._id
                                      ? '#0F3B60'
                                      : 'transparent',
                                  borderBottomWidth: 1,
                                }}>
                                <Text
                                  style={{
                                    marginLeft: 10,
                                    color:
                                      selectedId === driverItem._id
                                        ? '#fff'
                                        : '#0F3B60',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  {driverItem.firstname} {driverItem.lastname}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
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
                {driverAssignloading ? (
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
                    <ActivityIndicator size={'small'} color={'#000'} />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleClickSubmitAssignDriver()}>
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
                        Assign
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      ) : (
        <></>
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
              style={{marginRight: 15, color: '#fff'}}
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
                <Text style={{color: '#000', fontFamily: 'Inter-SemiBold'}}>
                  Driver Note Here
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
                          fontSize: 11,
                        }}>
                        {it.text}
                      </Text>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Medium',
                            color: '#000',
                            fontSize: 10,
                            marginTop: 5,
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
