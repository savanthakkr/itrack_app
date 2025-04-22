/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  PermissionsAndroid,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import React, {useRef, useState, useEffect, useContext} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pending from './Pending';
import Delivered from './Delivered';
import axios from 'axios';
import {Card, RadioButton} from 'react-native-paper';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import Moment from 'react-moment';
import {AuthContext} from './Context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {BASE_URL, SETTING_VERSION} from '../../config';
import DeviceInfo from 'react-native-device-info';
import {RNAndroidLocationEnabler} from 'react-native-android-location-enabler';
import {accelerometer} from 'react-native-sensors';
import {map, filter} from 'rxjs/operators';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import moment from 'moment-timezone';

const STEP_THRESHOLD = 1.2; // Adjust this threshold based on testing
const MIN_STEP_DURATION = 500; // Minimum duration between steps in milliseconds

export default function Home() {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();

  const [isOpenClient, setIsOpenClient] = useState(false);
  const [deleteAccountbutton, setDeleteAccount] = useState('');

  const [currentTime, setCurrentTime] = useState(
    moment().tz('Australia/Melbourne'),
  );

  useEffect(() => {
    getStatus();
    const interval = setInterval(() => {
      setCurrentTime(moment().tz('Australia/Melbourne'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const enableGPS = async () => {
    const isLocationEnabled = await DeviceInfo.isLocationEnabled();
    if (!isLocationEnabled) {
      return RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
        interval: 10000,
        fastInterval: 5000,
      })
        .then(data => {
          return true;
        })
        .catch(err => {
          // console.error('Location not enabled:', err);
          return false;
        });
    }
    return true;
  };

  const getStatus = async () => {
    try {
      setDeleteAccount('false');
      const response = await axios.get(`${BASE_URL}driver/status`, {
        headers: {
          os: Platform.OS,
          v: SETTING_VERSION,
        },
      });

      console.log('response.data.data.status::', response.data.data);

      if (response.data.data.status == false) {
        setDeleteAccount(response.data.data.settings.deleteAccount);
      }
      if (response.data.data.status == true) {
        setDeleteAccount(response.data.data.settings.deleteAccount);
      }

      if (response.data.success) {
        console.log('Fetched status:', response.data.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEnableGPS = async () => {
    const enabled = await enableGPS();
    if (enabled) {
      setIsOpenClient(true);
      getCurrentLocation();
    }
  };

  const translateAminClient = useRef(
    new Animated.Value(isOpenClient ? 0 : 300),
  ).current;

  const animateMainClinet = () => {
    Animated.timing(translateAminClient, {
      toValue: isOpenClient ? 300 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Animation completed
      setIsOpenClient(!isOpenClient);
    });
  };

  const [driverId, setDriverId] = useState();

  useEffect(() => {
    AsyncStorage.getItem('driverId').then(id => setDriverId(id));
  });

  //  useEffect(()=>{
  //   const interval = setInterval(() => {
  //     getCurrentLocation()
  //   }, 10000);
  //   return () => clearInterval(interval)
  // },[])

  // Run getCurrentLocation every 5 seconds

  const confirmDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
        {text: 'No', style: 'cancel'},
        {text: 'Yes', onPress: () => deleteAccount()},
      ],
      {cancelable: true},
    );
  };

  // get drive location
  const getCurrentLocation = async () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
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
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(`${BASE_URL}driver/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ID: `${driverId}`,
          latt: `${latitude}`,
          long: `${longitude}`,
        }),
      });
      const data = await response.json();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // const intervalId = setInterval(() => {
  //   getCurrentLocation();
  // }, 10000);

  const {loginType, setLoginType, logOutDriver, logOutAdmin} =
    useContext(AuthContext);

  const animateTranslateShow = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      Animated.timing(translateX, {
        toValue: 160,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    }
  };

  const animateTranslateHide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    }
  };

  const [hover, setHover] = useState('pending');
  const [filter, setFilter] = useState('');
  const [calenderActive, setCalenderActive] = useState(false);

  const handleFilter = name => {
    setFilter(name);
    animateTranslateHide();
    if (name === 'Custom Date') {
      setCalenderActive(true);
    }
  };

  const [selectedDate, setSelectedDate] = useState('');
  const [search, setSearch] = useState('');

  const onDayPress = day => {
    setSelectedDate(day.dateString);
    setCalenderActive(false);
  };

  const [checked, setChecked] = React.useState('');

  useEffect(() => {
    setTimeout(() => {
      requestStoragePermission();
    }, 1000);
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      let storagePermissionType =
        Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

      const status = await check(storagePermissionType);

      if (status === RESULTS.GRANTED) {
      } else if (status === RESULTS.DENIED) {
        await request(storagePermissionType);
      } else if (status === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Required',
          'Storage access is required to save images. Please enable it in settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
      }
    }
  };

  return (
    <View style={{height: '100%', width: '100%', backgroundColor: '#f5f5f5'}}>
      <StatusBar barStyle="light-content" backgroundColor="#0F3B60" />
      {/* side start*/}

      <View style={{width: '39%', height: '100%'}}>
        <SafeAreaView />
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity onPress={animateTranslateHide}>
            <Feather
              name="x"
              size={30}
              style={{marginRight: 10, marginTop: 10}}
              color={'#000'}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <View style={{width: '90%', height: '80%', marginTop: 20}}>
            <TouchableOpacity onPress={() => handleFilter('Today')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor:
                    filter === 'Today' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'Today' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 10,
                  }}>
                  Today
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilter('Yesterday')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor:
                    filter === 'Yesterday' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'Yesterday' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 10,
                  }}>
                  Yesterday
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilter('Tomorrow')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor:
                    filter === 'Tomorrow' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'Tomorrow' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 10,
                  }}>
                  Tomorrow
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilter('Custom Date')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor:
                    filter === 'Custom Date' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'Custom Date' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 10,
                  }}>
                  Custom Date
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilter('')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor: 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 10,
                  }}>
                  Clean Filter
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: 40,
            bottom: 0,
            marginBottom: 10,
          }}>
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: 40,
              bottom: 0,
              marginBottom: 10,
            }}>
            {deleteAccountbutton ? (
              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
                  alignItems: 'start',
                  justifyContent: 'center',
                  paddingBottom: '30',
                  height: 40,
                }}>
                <TouchableOpacity onPress={confirmDelete}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'start',
                      justifyContent: 'start',
                      marginLeft: '10',
                      height: 40,
                    }}>
                    <Feather name="trash-2" size={20} color="#000" />
                    <Text
                      style={{
                        marginLeft: 10,
                        color: '#000',
                        fontFamily: 'Inter-SemiBold',
                      }}>
                      Delete Account
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => logOutDriver()}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'start',
                      marginLeft: '10',
                      justifyContent: 'start',
                      height: 40,
                    }}>
                    <Feather name="log-out" size={20} color="#000" />
                    <Text
                      style={{
                        marginLeft: 10,
                        color: '#000',
                        fontFamily: 'Inter-SemiBold',
                      }}>
                      LogOut
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  width: '100%',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 40,
                }}>
                <TouchableOpacity onPress={() => logOutDriver()}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 40,
                    }}>
                    <Feather name="log-out" size={20} color="#000" />
                    <Text
                      style={{
                        marginLeft: 10,
                        color: '#000',
                        fontFamily: 'Inter-SemiBold',
                      }}>
                      LogOut
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* side end*/}

      {/* Home */}
      <Animated.View
        style={{
          backgroundColor: '#fff',
          height: '100%',
          width: '100%',
          position: 'absolute',
          transform: [{translateX}],
        }}>
        <SafeAreaView style={{backgroundColor: '#0F3B60'}} />
        {/* Top Header */}
        <View
          style={{
            width: '100%',
            height: 170,
            backgroundColor: '#0F3B60',
            borderBottomRightRadius: 30,
            borderBottomLeftRadius: 30,
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '90%',
              height: 50,
              marginTop: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Inter-SemiBold',
                fontSize: 22,
              }}>
              Jobs
            </Text>
            <View
              style={{
                width: 120,
                height: 40,
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
              <View style={{flexDirection: 'row'}}>
                <Feather name="calendar" size={15} color={'#fff'} />
                <Text
                  style={{
                    marginLeft: 5,
                    color: '#fff',
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 12,
                  }}>
                  <Moment element={Text} format="DD MMM YYYY">
                    {currentTime}
                  </Moment>
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Feather name="clock" size={15} color={'#fff'} />
                <Text
                  style={{
                    marginLeft: 5,
                    color: '#fff',
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 12,
                  }}>
                  <Moment element={Text} format="hh:mm A">
                    {currentTime}
                  </Moment>
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              height: 45,
              width: '90%',
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                width: '83%',
                flexDirection: 'row',
                height: '100%',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 10,
              }}>
              <Feather
                name="search"
                size={20}
                style={{marginLeft: 10}}
                color={'#0F3B60'}
              />
              <TextInput
                placeholder="Search Client...."
                onChangeText={e => setSearch(e)}
                onFocus={() => handleFilter('SearchInput')}
                style={{marginLeft: 5, color: '#000'}}
                placeholderTextColor={'#0F3B60'}
              />
            </View>
            <View
              style={{
                width: '15%',
                height: 45,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 10,
              }}>
              <TouchableOpacity
                onPress={animateTranslateShow}
                style={{
                  width: '100%',
                  height: '100%',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="options-outline" size={25} color={'#0F3B60'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Top Header */}

        <View
          style={{
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 50,
          }}>
          <View
            style={{
              width: '90%',
              height: 50,
              marginTop: 25,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                width: '49%',
                height: 45,
                backgroundColor: hover === 'pending' ? '#0F3B60' : '#fff',
                borderWidth: 1,
                borderColor: '#0F3B60',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}>
              <TouchableOpacity
                onPress={() => setHover('pending')}
                style={{width: '100%', height: '100%'}}>
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: hover === 'pending' ? '#fff' : '#0F3B60',
                      fontFamily: 'Inter-SemiBold',
                    }}>
                    Assign Job
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: '49%',
                height: 45,
                backgroundColor: hover === 'Delivered' ? '#0F3B60' : '#fff',
                borderWidth: 1,
                borderColor: '#0F3B60',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}>
              <TouchableOpacity
                onPress={() => setHover('Delivered')}
                style={{width: '100%', height: '100%'}}>
                <View
                  style={{
                    width: '100%',
                    height: 45,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: hover === 'Delivered' ? '#fff' : '#0F3B60',
                      fontFamily: 'Inter-SemiBold',
                    }}>
                    Delivered
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {hover === 'pending' ? (
          <Pending
            filter={filter}
            selectedDate={selectedDate}
            search={search}
          />
        ) : hover === 'Delivered' ? (
          <Delivered
            filter={filter}
            selectedDate={selectedDate}
            search={search}
          />
        ) : (
          <></>
        )}
      </Animated.View>

      {calenderActive === true ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0,0.5)',
          }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
            }}>
            <View
              style={{
                width: '90%',
                height: 20,
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <TouchableOpacity onPress={() => setCalenderActive(false)}>
                <Feather
                  name="x"
                  size={20}
                  color="#fff"
                  style={{marginTop: -20}}
                />
              </TouchableOpacity>
            </View>
            <Card
              style={{
                width: 320,
                height: 350,
                backgroundColor: '#fff',
                borderRadius: 20,
              }}>
              <Calendar
                onDayPress={onDayPress}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    marked: true,
                    selectedColor: 'blue',
                  },
                }}
                theme={{
                  selectedDayBackgroundColor: 'blue',
                  todayTextColor: 'red',
                  arrowColor: 'blue',
                }}
                style={{padding: 10, borderRadius: 20}}
              />
            </Card>
          </View>
        </View>
      ) : (
        <></>
      )}

      {isOpenClient ? (
        <Animated.View
          style={{
            position: 'absolute',
            height: 250,
            zIndex: 1,
            bottom: 0,
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{translateY: translateAminClient}],
          }}>
          <View
            style={{
              width: '100%',
              height: 250,
              backgroundColor: '#ecf0f1',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              elevation: 5,
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '90%',
              }}>
              <Feather
                name="x"
                style={{marginTop: 10}}
                size={25}
                color="#000"
                onPress={() => animateMainClinet()}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 50,
            }}>
            <TouchableOpacity onPress={() => handleEnableGPS()}>
              <View
                style={{
                  width: '90%',
                  height: 50,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    width: '100%',
                    width: 50,
                    backgroundColor: '#3498db',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text>GPS Location On</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <></>
      )}
    </View>
  );
}
