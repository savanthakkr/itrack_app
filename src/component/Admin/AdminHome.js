/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pending from '../Pending';
import Delivered from '../Delivered';
import {Card, RadioButton} from 'react-native-paper';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {AuthContext} from '../Context/AuthContext';
import AdminDeliveredJob from './AdminDeliveredJob';
import AdminPendingJob from './AdminPendingJob';
import Moment from 'react-moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../../config';
import moment from 'moment-timezone';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';

export default function AdminHome() {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const {loginType, setLoginType, logOutAdmin} = useContext(AuthContext);
  const [getStatus, setGetStatus] = useState('');
  const [isOpenMain, setIsOpenMain] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Track total pages for limiting calls
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [limit] = useState(10);

  const translateAmin = useRef(
    new Animated.Value(isOpenMain ? 0 : 300),
  ).current;

  const [isOpenClient, setIsOpenClient] = useState(false);

  const translateAminClient = useRef(
    new Animated.Value(isOpenClient ? 0 : 300),
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

  const animateMainClinet = () => {
    Animated.timing(translateAminClient, {
      toValue: isOpenClient ? 300 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Animation completed
      setSelectedClient('');
      setIsOpenClient(!isOpenClient);
    });
  };

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
  const [dropDown, setDropDown] = useState(false);
  const [calenderActive, setCalenderActive] = useState(false);
  const [clientName, setClientName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverId, setDriverId] = useState();
  const [clientId, setClientId] = useState();
  const [jobInputId, setJobInputId] = useState('');
  const [awsInput, setAwsInput] = useState('');
  const [clientInput, setClientInput] = useState('');

  const handleFilter = name => {
    setFilter(name);
    setClientInput('');
    
    if (name === 'Status') {
      setFilter(name);
      setDropDown(!dropDown);
    }


    if (name === 'Driver') {
      animateMain();
      animateTranslateHide();
    }

    if (name === 'Client') {
      animateMainClinet();
      animateTranslateHide();
    }

    if (name === 'Custom Date') {
      setCalenderActive(true);
      animateTranslateHide();
    }
  };

  const handleFilterStatus = name => {
    setGetStatus(name);
    animateTranslateHide();
  };

  const [currentTime, setCurrentTime] = useState(
    moment().tz('Australia/Melbourne'),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().tz('Australia/Melbourne'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    requestStoragePermission();
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

  const [selectedDate, setSelectedDate] = useState('');

  const onDayPress = day => {
    setSelectedDate(day.dateString);
    setCalenderActive(false);
  };

  const [checked, setChecked] = React.useState('');

  const [dropDownDriver, setDropDownDriver] = useState(false);
  const [driverData, setDriverData] = useState([]);
  const [driverloading, setDriverloading] = useState(false);
  const [selectDriver, setSelectedDriver] = useState('');
  const [lastNameDriver, setLastNameDriver] = useState('');
  const [dropDownClient, setDropDownClient] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [clientloading, setClientloading] = useState(false);
  const [selectClient, setSelectedClient] = useState('');
  const [lastNameClient, setLastNameClient] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClientData, setFilteredClientData] = useState(clientData); // Filtered Data
  const [searchText, setSearchText] = useState('');

  const [currentPageclient, setCurrentPageclient] = useState(1);
  const [limitclient] = useState(10); // Items per page
  const [refreshingclient, setRefreshingclient] = useState(false);
  const [loadingMoreclient, setLoadingMoreclient] = useState(false);
  const [hasMoreDataclient, setHasMoreDataclient] = useState(true);

  const handleDataDriver = async (page, limit) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const response = await fetch(
        `${BASE_URL}admin/info/allDrivers?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (page === 1) {
        setDriverData(data.data); // Replace data on refresh
      } else {
        setDriverData(prevData => [...prevData, ...data.data]); // Append new data
      }

      if (data.data.length < limit) {
        setHasMoreData(false); // No more data available
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const [allClientData, setAllClientData] = useState([]); // Store unfiltered data

  const handleDataClient = async (page, limit) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const response = await fetch(
        `${BASE_URL}admin/info/allClients?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (page === 1) {
        setAllClientData(data.data); // Store all data for filtering
        setFilteredClientData(data.data); // Display initial data
      } else {
        setAllClientData(prevData => [...prevData, ...data.data]);
        setFilteredClientData(prevData => [...prevData, ...data.data]);
      }

      setHasMoreDataclient(data.data.length === limit); // Correct pagination check
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMoreclient(false);
      setRefreshingclient(false);
    }
  };

  // Search Logic - Filter Data Locally
  const handleSearch = text => {
    setSearchText(text);
    const filteredData = allClientData.filter(item =>
      `${item.firstname} ${item.lastname}`
        .toLowerCase()
        .includes(text.toLowerCase()),
    );
    setFilteredClientData(filteredData);
  };

  // Refresh with Search
  const onRefreshclient = useCallback(() => {
    setRefreshingclient(true);
    setCurrentPageclient(1);
    setAllClientData([]);
    setFilteredClientData([]);
    handleDataClient(1, limitclient);
  }, []);

  // Initial Load
  useEffect(() => {
    handleDataClient(1, limitclient);
  }, []);

  // Pagination
  const loadMoreDataclient = () => {
    if (!loadingMoreclient && hasMoreDataclient) {
      const nextPage = currentPageclient + 1;
      setCurrentPageclient(nextPage);
      handleDataClient(nextPage, limitclient);
    }
  };

  useEffect(() => {
    handleDataDriver(1, limit); // Initial load
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1); // Reset pagination on refresh
    handleDataDriver(1, limit);
  }, []);

  const loadMoreData = () => {
    if (!loadingMore && hasMoreData) {
      setLoadingMore(true);
      setCurrentPage(prevPage => {
        const nextPage = prevPage + 1;
        handleDataDriver(nextPage, limit);
        return nextPage;
      });
    }
  };

  const onChangeSearchText = text => {
    if (text.length > 2) {
      handleFilter('SearchInput');
    } else {
      handleFilter('');
    }
    setClientInput(text);
  };

  const [filteredDriverData, setFilteredDriverData] = useState(driverData); // New filtered data

  // Filter driver data when search text changes
  useEffect(() => {
    const filteredData = driverData.filter(item =>
      `${item.firstname} ${item.lastname}`
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );
    setFilteredDriverData(filteredData);
  }, [searchText, driverData]);

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
            <TouchableOpacity onPress={() => handleFilter('Status')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor:
                    filter === 'Status' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'Status' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 10,
                  }}>
                  Status
                </Text>
                {dropDown ? (
                  <Feather
                    name="chevron-up"
                    size={20}
                    color="#fff"
                    style={{marginRight: 10}}
                  />
                ) : (
                  <Feather
                    name="chevron-down"
                    size={20}
                    color="#0F3B60"
                    style={{marginRight: 10}}
                  />
                )}
              </View>
            </TouchableOpacity>
            {dropDown === true ? (
              <>
                <TouchableOpacity onPress={() => handleFilterStatus('Pending')}>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor:
                        getStatus === 'Pending'
                          ? 'rgba(15,59,96,0.5)'
                          : 'transparent',
                      borderBottomColor: '#DFDFDF',
                      borderBottomWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color: getStatus === 'Pending' ? '#f1c40f' : '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                        marginLeft: 10,
                        fontSize: 13,
                      }}>
                      Pending
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFilterStatus('Driver Assigned')}>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor:
                        getStatus === 'Driver Assigned'
                          ? 'rgba(15,59,96,0.5)'
                          : 'transparent',
                      borderBottomColor: '#DFDFDF',
                      borderBottomWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          getStatus === 'Driver Assigned'
                            ? '#f1c40f'
                            : '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                        marginLeft: 10,
                        fontSize: 13,
                      }}>
                      Driver Assigned
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFilterStatus('Arrival on Pickup')}>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor:
                        getStatus === 'Arrival on Pickup'
                          ? 'rgba(15,59,96,0.5)'
                          : 'transparent',
                      borderBottomColor: '#DFDFDF',
                      borderBottomWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          getStatus === 'Arrival on Pickup'
                            ? '#f1c40f'
                            : '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                        marginLeft: 10,
                        fontSize: 13,
                      }}>
                      Arrival on Pickup
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFilterStatus('Picked Up')}>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor:
                        getStatus === 'Picked Up'
                          ? 'rgba(15,59,96,0.5)'
                          : 'transparent',
                      borderBottomColor: '#DFDFDF',
                      borderBottomWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          getStatus === 'Picked Up' ? '#f1c40f' : '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                        marginLeft: 10,
                        fontSize: 13,
                      }}>
                      Picked Up
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFilterStatus('Arrival on Delivery')}>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor:
                        getStatus === 'Arrival on Delivery'
                          ? 'rgba(15,59,96,0.5)'
                          : 'transparent',
                      borderBottomColor: '#DFDFDF',
                      borderBottomWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          getStatus === 'Arrival on Delivery'
                            ? '#f1c40f'
                            : '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                        marginLeft: 10,
                        fontSize: 13,
                      }}>
                      Arrival on Delivery
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFilterStatus('Cancelling')}>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor:
                        getStatus === 'Cancelling'
                          ? 'rgba(15,59,96,0.5)'
                          : 'transparent',
                      borderBottomColor: '#DFDFDF',
                      borderBottomWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          getStatus === 'Cancelling' ? '#f1c40f' : '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                        marginLeft: 10,
                        fontSize: 13,
                      }}>
                      Cancelling
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleFilterStatus('Cancelled')}>
                  <View
                    style={{
                      width: '100%',
                      height: 40,
                      backgroundColor:
                        getStatus === 'Cancelled'
                          ? 'rgba(15,59,96,0.5)'
                          : 'transparent',
                      borderBottomColor: '#DFDFDF',
                      borderBottomWidth: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        color:
                          getStatus === 'Cancelled' ? '#f1c40f' : '#0F3B60',
                        fontFamily: 'Inter-SemiBold',
                        marginLeft: 10,
                        fontSize: 13,
                      }}>
                      Cancelled
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <></>
            )}

            <TouchableOpacity onPress={() => handleFilter('Client')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor:
                    filter === 'Client' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'Client' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 10,
                  }}>
                  Client
                </Text>
                <Feather
                  name="chevron-down"
                  size={20}
                  color="#0F3B60"
                  style={{marginRight: 10}}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleFilter('Driver')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor:
                    filter === 'Driver' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'Driver' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 10,
                  }}>
                  Driver
                </Text>
                <Feather
                  name="chevron-down"
                  size={20}
                  color="#0F3B60"
                  style={{marginRight: 10}}
                />
              </View>
            </TouchableOpacity>
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
                  Today Jobs
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
            <TouchableOpacity onPress={() => handleFilter('JobId')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor:
                    filter === 'JobId' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'JobId' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 5,
                  }}>
                  Job Id
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFilter('AWB')}>
              <View
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor: filter === 'AWB' ? '#0F3B60' : 'transparent',
                  borderBottomColor: '#DFDFDF',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: filter === 'AWB' ? '#fff' : '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 5,
                  }}>
                  AWB
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
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    marginLeft: 5,
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
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
            }}>
            <TouchableOpacity onPress={() => logOutAdmin()}>
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
        {isOpenMain ? (
          <Animated.View
            style={{
              position: 'absolute',
              height: 350,
              zIndex: 1,
              bottom: 0,
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{translateY: translateAmin}],
            }}>
            <View
              style={{
                width: '100%',
                height: 350,
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
                  onPress={() => animateMain()}
                />
              </View>
              <View
                style={{
                  width: '90%',
                  height: dropDownDriver === true ? 300 : 50,
                  marginTop: 5,
                  borderRadius: 10,
                  borderColor: '#000',
                  borderWidth: 1,
                }}>
                <TouchableOpacity
                  onPress={() => setDropDownDriver(!dropDownDriver)}>
                  <View
                    style={{
                      width: '100%',
                      height: 50,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        height: 50,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      {selectDriver === '' ? (
                        <Text
                          style={{
                            marginLeft: 10,
                            color: '#000',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Select Driver
                        </Text>
                      ) : (
                        <Text
                          style={{
                            marginLeft: 10,
                            color: '#000',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          {selectDriver} {lastNameDriver}
                        </Text>
                      )}

                      {dropDownDriver === true ? (
                        <Feather
                          name="chevron-up"
                          style={{marginRight: 10, color: '#000'}}
                          size={20}
                        />
                      ) : (
                        <Feather
                          name="chevron-down"
                          style={{marginRight: 10, color: '#000'}}
                          size={20}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                {dropDownDriver === true ? (
                  <View style={{height: 250}}>
                    {/* <ScrollView>
                      {driverData.map(item => {
                        return (
                          <View
                            style={{
                              width: '100%',
                              height: 50,
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}>
                            <TouchableOpacity
                              style={{width: '100%'}}
                              onPress={() => {
                                setSelectedDriver(item.firstname),
                                  setLastNameDriver(item.lastname),
                                  setDriverId(item._id);
                              }}>
                              <View
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  backgroundColor:
                                    selectDriver === item.firstname
                                      ? '#0F3B60'
                                      : 'transparent',
                                }}>
                                <Text
                                  style={{
                                    marginLeft: 10,
                                    color:
                                      selectDriver === item.firstname
                                        ? '#fff'
                                        : '#0F3B60',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  {item.firstname} {item.lastname}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </ScrollView> */}
                    <View style={{flex: 1}}>
                      {/* Search Bar */}
                      {/* <TextInput
                        placeholder="Search drivers..."
                        placeholderTextColor="#000"
                        value={searchText}
                        onChangeText={setSearchText}
                        style={{
                          height: 40,
                          borderColor: '#0F3B60',
                          borderWidth: 1,
                          borderRadius: 5,
                          marginBottom: 10,
                          paddingHorizontal: 10,
                          color: '#000', // Text color
                        }}
                      /> */}

                      {/* Driver List */}
                      <FlatList
                        data={filteredDriverData}
                        renderItem={({item}) => (
                          <View
                            style={{
                              width: '100%',
                              height: 50,
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}>
                            <TouchableOpacity
                              style={{width: '100%'}}
                              onPress={() => {
                                setSelectedDriver(item.firstname);
                                setLastNameDriver(item.lastname);
                                setDriverId(item._id);
                              }}>
                              <View
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  backgroundColor:
                                    selectDriver === item.firstname
                                      ? '#0F3B60'
                                      : 'transparent',
                                }}>
                                <Text
                                  style={{
                                    marginLeft: 10,
                                    color:
                                      selectDriver === item.firstname
                                        ? '#fff'
                                        : '#0F3B60',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  {item.firstname} {item.lastname}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        )}
                        refreshControl={
                          <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                          />
                        }
                        onEndReached={loadMoreData}
                        onEndReachedThreshold={0.1} // Trigger when 10% from the end
                        ListFooterComponent={
                          loadingMore && hasMoreData ? (
                            <ActivityIndicator size="small" color="#0F3B60" />
                          ) : null
                        }
                      />
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            </View>
          </Animated.View>
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
                height: 350,
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
              <View
                style={{
                  width: '90%',
                  height: dropDownClient === true ? 300 : 50,
                  marginTop: 5,
                  borderRadius: 10,
                  borderColor: '#000',
                  borderWidth: 1,
                }}>
                <TouchableOpacity
                  onPress={() => setDropDownClient(!dropDownClient)}>
                  <View
                    style={{
                      width: '100%',
                      height: 50,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        height: 50,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      {selectClient === '' ? (
                        <Text
                          style={{
                            marginLeft: 10,
                            color: '#000',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          Select Client
                        </Text>
                      ) : (
                        <Text
                          style={{
                            marginLeft: 10,
                            color: '#000',
                            fontFamily: 'Inter-SemiBold',
                          }}>
                          {selectClient}
                          {lastNameClient}
                        </Text>
                      )}

                      {dropDownClient === true ? (
                        <Feather
                          name="chevron-up"
                          style={{marginRight: 10, color: '#000'}}
                          size={20}
                        />
                      ) : (
                        <Feather
                          name="chevron-down"
                          style={{marginRight: 10, color: '#000'}}
                          size={20}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <View>
                  {dropDownClient === true ? (
                    <View style={{height: 250}}>
                      {/* Search Bar */}
                      {/* <TextInput
                        placeholder="Search clients..."
                        placeholderTextColor="#000"  // Black color for placeholder text
                        value={searchText}
                        onChangeText={handleSearch}
                        style={{
                          height: 40,
                          borderColor: '#0F3B60',
                          borderWidth: 1,
                          borderRadius: 5,
                          marginBottom: 10,
                          paddingHorizontal: 10,
                          color: '#000', // Ensure typed text is also black
                        }}
                      /> */}

                      <ScrollView
                        refreshControl={
                          <RefreshControl
                            refreshing={refreshingclient}
                            onRefresh={onRefreshclient}
                          />
                        }
                        onMomentumScrollEnd={loadMoreDataclient}
                        contentContainerStyle={{paddingBottom: 50}}>
                        {filteredClientData.map(item => (
                          <View
                            key={item._id}
                            style={{
                              width: '100%',
                              height: 50,
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}>
                            <TouchableOpacity
                              style={{width: '100%'}}
                              onPress={() => {
                                setSelectedClient(item.firstname);
                                setLastNameClient(item.lastname);
                                setClientId(item._id);
                              }}>
                              <View
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                  backgroundColor:
                                    selectClient === item.firstname
                                      ? '#0F3B60'
                                      : 'transparent',
                                }}>
                                <Text
                                  style={{
                                    marginLeft: 10,
                                    color:
                                      selectClient === item.firstname
                                        ? '#fff'
                                        : '#0F3B60',
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  {item.firstname} {item.lastname}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        ))}

                        {loadingMoreclient && hasMoreDataclient && (
                          <ActivityIndicator size="small" color="#0F3B60" />
                        )}
                      </ScrollView>
                    </View>
                  ) : (
                    <></>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <></>
        )}

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
            {filter === 'JobId' ? (
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
                  placeholder="Search Job Id...."
                  onChangeText={e => setJobInputId(e)}
                  value={jobInputId}
                  style={{marginLeft: 5, color: '#000'}}
                  placeholderTextColor={'#0F3B60'}
                />
              </View>
            ) : filter === 'AWB' ? (
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
                  placeholder="Search Awb...."
                  value={awsInput}
                  onChangeText={e => setAwsInput(e)}
                  style={{marginLeft: 5, color: '#000'}}
                  placeholderTextColor={'#0F3B60'}
                />
              </View>
            ) : (
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
                  placeholder="Search by company name...."
                  style={{marginLeft: 5, color: '#000'}}
                  value={clientInput}
                  onChangeText={onChangeSearchText}
                  placeholderTextColor={'#0F3B60'}
                />
                {/* <Text style={{marginLeft: 20, color: '#0F3B60'}}>
                  Search By Filter
                </Text> */}
              </View>
            )}

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
                    All Jobs
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
          <AdminPendingJob
            filter={filter}
            Status={getStatus}
            clientName={clientName}
            driverName={driverName}
            selectedDates={selectedDate}
            jobInputId={jobInputId}
            awsInput={awsInput}
            selectDriver={selectDriver}
            selectClient={selectClient}
            clientId={clientId}
            driverId={driverId}
            clientInput={clientInput}
          />
        ) : hover === 'Delivered' ? (
          <AdminDeliveredJob
            filter={filter}
            Status={getStatus}
            clientName={clientName}
            driverName={driverName}
            selectedDates={selectedDate}
            jobInputId={jobInputId}
            awsInput={awsInput}
            selectDriver={selectDriver}
            selectClient={selectClient}
            clientId={clientId}
            driverId={driverId}
            clientInput={clientInput}
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
    </View>
  );
}
