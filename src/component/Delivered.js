import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {Card} from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../config';
import Moment from 'react-moment';
import {getFormattedDAndT} from './common/DateTimeFormate';
import moment from 'moment';
import {
  isToday,
  isTomorrow,
  isYesterday,
  isWithinInterval,
  parseISO,
  format,
  addDays,
  isSameDay,
} from 'date-fns';
import {useNavigation} from '@react-navigation/native';
import img from '../../assets/Img/no1.jpg';
import Entypo from 'react-native-vector-icons/Entypo';

export default function Delivered({filter, selectedDate, search}) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [foundValue, setFoundValue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const [driverId, setDriverId] = useState();
  useEffect(() => {
    AsyncStorage.getItem('driverId').then(id => setDriverId(id));
  });

  const handleData = async () => {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const id = await AsyncStorage.getItem('driverId');
      const response = await fetch(
        `${BASE_URL}driver/jobsByDriverStatusDelivered?driverId=${id}`,
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleData().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    if (filter) {
      handleData();
    } else {
      handleData();
      let interval;
      if (!isFiltering) {
        interval = setInterval(() => {
          handleData();
        }, 10000);
      }
      return () => clearInterval(interval);
    }
  }, [isFiltering]);

  const handleClick = _id => {
    navigation.navigate('JobDetail', {jobId: _id});
  };

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterDate = addDays(today, -1);

  const tomorrowDateFormat = moment(tomorrow).format('YYYY-MM-DD');
  const yesterDateFormat = moment(yesterDate).format('YYYY-MM-DD');
  const todayDateFormat = moment(today).format('YYYY-MM-DD');
  const selectDateFormat = moment(selectedDate).format('YYYY-MM-DD');

  const [stop, setStop] = useState(false);

  useEffect(() => {
    if (data) {
      handleFilter();
    }
  }, [filter, selectedDate, search]);

  const handleFilter = async () => {
    switch (filter) {
      case 'Today':
        const tokenAT = await AsyncStorage.getItem('driverToken');
        const responseToday = await fetch(
          `${BASE_URL}driver/jobFilter?fromDate=${todayDateFormat}&currentStatus=Delivered`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenAT}`,
            },
          },
        );
        const dataToday = await responseToday.json();
        setFoundValue(dataToday.data);
        break;
      case 'Tomorrow':
        const tokenA = await AsyncStorage.getItem('driverToken');
        const tomorrowData = await fetch(
          `${BASE_URL}driver/jobFilter?fromDate=${tomorrowDateFormat}&currentStatus=Delivered`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenA}`,
            },
          },
        );
        const datatomorrowData = await tomorrowData.json();
        setFoundValue(datatomorrowData.data);
        break;
      case 'Yesterday':
        const tokenAC = await AsyncStorage.getItem('driverToken');
        const yesterDate = await fetch(
          `${BASE_URL}driver/jobFilter?fromDate=${yesterDateFormat}&currentStatus=Delivered`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenAC}`,
            },
          },
        );
        const datayesterDate = await yesterDate.json();
        setFoundValue(datayesterDate.data);

        break;
      case 'Custom Date':
        const tokenACD = await AsyncStorage.getItem('driverToken');
        const responseCustomToday = await fetch(
          `${BASE_URL}driver/jobFilter?fromDate=${selectDateFormat}&currentStatus=Delivered`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenACD}`,
            },
          },
        );
        const dataCustomToday = await responseCustomToday.json();
        setFoundValue(dataCustomToday.data);
        break;
      case 'SearchInput':
        const SearchInput = data.filter(item =>
          item.clientId.firstname.toLowerCase().includes(search.toLowerCase()),
        );
        setFoundValue(SearchInput);
        break;

      // Add other cases for different filters
      default:
        setIsFiltering(false);
        setFoundValue(data);
    }
  };

  if (!data) {
    return (
      <View
        style={{
          width: '100%',
          height: '70%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image source={img} style={{width: 180, height: 180}} />
        <Text style={{color: '#000'}}>No Any Job Delivered !!</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        maxHeight: '83%',
        marginTop: 15,
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <View style={{width: '90%', height: '90%'}}>
        {/* single card start */}
        {loading ? (
          <View
            style={{
              height: 250,
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ActivityIndicator
              size="small"
              color={'#000'}
              style={{marginTop: 10}}
            />
            <Text style={{color: '#000', fontSize: 15}}>Loading</Text>
          </View>
        ) : (
          <>
            {filter === '' ? (
              <FlatList
                data={data.slice().reverse()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 120}}
                keyExtractor={item => item._id}
                renderItem={({item}) => {
                  return (
                    <Card
                      style={{
                        width: '100%',
                        marginTop: 5,
                        marginBottom: 5,
                        borderRadius: 20,
                        backgroundColor: '#fff',
                        borderColor: '#27AE60',
                        borderWidth: 2,
                      }}
                      key={item._id}>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            width: 150,
                            height: 25,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 10,
                              height: 7,
                              backgroundColor: '#27AE60',
                              marginTop: -19,
                              borderBottomLeftRadius: 10,
                            }}></View>
                          <View
                            style={{
                              width: 120,
                              height: 25,
                              backgroundColor: '#27AE60',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter-Medium',
                                color: '#000',
                                fontSize: 12,
                              }}>
                              {item.currentStatus}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 10,
                              height: 7,
                              backgroundColor: '#27AE60',
                              marginTop: -19,
                              borderBottomRightRadius: 10,
                            }}></View>
                        </View>

                        <View
                          style={{
                            width: '93%',

                            marginTop: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <View
                            style={{
                              width: '50%',
                              flexDirection: 'column',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter-Bold',
                                fontSize: 16,
                                color: '#0F3B60',
                              }}>
                              {item.uid}
                            </Text>
                            <Text
                              style={{
                                fontFamily: 'Inter-Medium',
                                fontSize: 11,
                                color: '#0F3B60',
                              }}>
                              AWB: {item.AWB}{' '}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: '50%',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}>
                            {item.clientId == null ? (
                              <Text
                                style={{
                                  fontFamily: 'Inter-Bold',
                                  fontSize: 16,
                                  color: '#0F3B60',
                                }}>
                                Not Available Client
                              </Text>
                            ) : (
                              <Text
                                style={{
                                  fontFamily: 'Inter-Bold',
                                  fontSize: 16,
                                  color: '#0F3B60',
                                }}>
                                {item.clientId.companyName}
                              </Text>
                            )}

                            {item.isVpap ? (
                              <Text
                                style={{
                                  color: '#F39C12',
                                  fontSize: 11,
                                  fontFamily: 'Inter-Medium',
                                }}>
                                Required VPAP
                              </Text>
                            ) : (
                              <Text
                                style={{
                                  color: '#F39C12',
                                  fontSize: 11,
                                  fontFamily: 'Inter-Medium',
                                }}>
                                Not Required VPAP
                              </Text>
                            )}
                          </View>
                        </View>

                        <View
                          style={{
                            width: '100%',
                            height: 1,
                            backgroundColor: '#9A8A8A',
                            marginTop: 7,
                          }}></View>
                        <View
                          style={{
                            width: '93%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 10,
                          }}>
                          <View style={{width: '50%'}}>
                            <Text
                              style={{
                                color: '#0F3B60',
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 13,
                              }}>
                              Pick Up Location
                            </Text>
                            <View style={{flexDirection: 'row', marginTop: 1}}>
                              <Entypo
                                name="shop"
                                style={{
                                  marginTop: 4,
                                  marginRight: 5,
                                  color: '#57595B',
                                }}
                                size={15}
                              />
                              {item.pickUpDetails.pickupLocationId === null ? (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-Medium',
                                    color: '#57595B',
                                  }}>
                                  not Available
                                </Text>
                              ) : (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-Medium',
                                    color: '#57595B',
                                    width: '85%',
                                    marginTop: 3,
                                  }}
                                  numberOfLines={1}>
                                  {
                                    item.pickUpDetails.pickupLocationId
                                      .customName
                                  }
                                </Text>
                              )}
                            </View>
                            <View style={{width: '100%'}}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 11,
                                  color: '#9B59B6',
                                }}>
                                Ready Time:{' '}
                                {item.pickUpDetails.readyTime
                                  ? getFormattedDAndT(
                                      item.pickUpDetails.readyTime,
                                    )
                                  : ''}
                                {/* <Moment
                                  element={Text}
                                  format="DD MMM YYYY hh:mm A">
                                  {item.pickUpDetails.readyTime}
                                </Moment> */}{' '}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 10,
                                  color: '#3498DB',
                                }}>
                                Cut-Off Time:{' '}
                                {item.dropOfDetails.cutOffTime
                                  ? getFormattedDAndT(
                                      item.dropOfDetails.cutOffTime,
                                    )
                                  : ''}
                                {/* <Moment
                                  element={Text}
                                  format="DD MMM YYYY hh:mm A">
                                  {item.dropOfDetails.cutOffTime}
                                </Moment> */}{' '}
                              </Text>
                            </View>
                          </View>
                          <View style={{width: '50%', flexDirection: 'column'}}>
                            <Text
                              style={{
                                color: '#0F3B60',
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 13,
                              }}>
                              Delivery Location
                            </Text>
                            <View style={{flexDirection: 'row', marginTop: 1}}>
                              <Entypo
                                name="shop"
                                style={{
                                  marginTop: 4,
                                  marginRight: 5,
                                  color: '#57595B',
                                }}
                                size={15}
                              />
                              {item.dropOfDetails.dropOfLocationId === null ? (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-Medium',
                                    color: '#57595B',
                                  }}>
                                  not Available
                                </Text>
                              ) : (
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontFamily: 'Inter-Medium',
                                    color: '#57595B',
                                    width: '85%',
                                    marginTop: 3,
                                  }}
                                  numberOfLines={1}>
                                  {
                                    item.dropOfDetails.dropOfLocationId
                                      .customName
                                  }
                                </Text>
                              )}
                            </View>
                            <View style={{width: '100%'}}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 11,
                                  color: '#E67E22',
                                }}>
                                Pieces: {item.pieces}
                              </Text>
                              {item.serviceCodeId === null ? (
                                <Text
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    fontSize: 10,
                                    color: '#E74C3C',
                                  }}>
                                  Service Code: Not Available
                                </Text>
                              ) : (
                                <Text
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    fontSize: 10,
                                    color: '#E74C3C',
                                  }}>
                                  Service Code: {item.serviceCodeId.text}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>

                        <View
                          style={{
                            width: '100%',
                            height: 1,
                            backgroundColor: '#9A8A8A',
                            marginTop: 7,
                          }}></View>
                        <View
                          style={{
                            width: '93%',
                            marginTop: 5,
                            flexDirection: 'column',
                          }}>
                          <Text
                            style={{
                              color: '#000',
                              fontFamily: 'Inter-Bold',
                              fontSize: 13,
                            }}>
                            Notes
                          </Text>
                          <Text
                            numberOfLines={2}
                            style={{
                              fontFamily: 'Inter-Regular',
                              color: '#000',
                              fontSize: 11,
                            }}>
                            {item.note}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: '100%',
                            height: 1,
                            backgroundColor: '#9A8A8A',
                            marginTop: 7,
                          }}></View>
                        <View
                          style={{
                            width: '90%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 15,
                          }}>
                          <View
                            style={{
                              height: 40,
                              width: '45%',
                              backgroundColor: '#0F3B60',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 10,
                            }}>
                            <TouchableOpacity
                              onPress={() => handleClick(item._id)}>
                              <View
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}>
                                <Feather
                                  name="eye"
                                  color="#fff"
                                  style={{marginRight: 5}}
                                  size={16}
                                />
                                <Text
                                  style={{
                                    color: '#fff',
                                    fontSize: 12,
                                    fontFamily: 'Inter-SemiBold',
                                  }}>
                                  View Detail
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>

                          {item?.pickUpDetails?.pickupLocationId?.latitude ===
                            null ||
                          item?.dropOfDetails?.dropOfLocationId?.latitude ===
                            null ? (
                            <View
                              style={{
                                height: 40,
                                width: '45%',
                                marginBottom: 15,
                                backgroundColor: '#0F3B60',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 10,
                              }}>
                              <TouchableOpacity
                                onPress={() =>
                                  Alert.alert('Not Found Any Location ')
                                }>
                                <View
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Feather
                                    name="move"
                                    color="#fff"
                                    style={{marginRight: 5}}
                                    size={16}
                                  />
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 12,
                                      fontFamily: 'Inter-SemiBold',
                                    }}>
                                    Navigate
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View
                              style={{
                                height: 40,
                                width: '45%',
                                marginBottom: 15,
                                backgroundColor: '#0F3B60',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 10,
                              }}>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('Map', {
                                    pickUplatitude:
                                      item.pickUpDetails.pickupLocationId
                                        .latitude,
                                    pickUplongitude:
                                      item.pickUpDetails.pickupLocationId
                                        .longitude,
                                    dropUplatitude:
                                      item.dropOfDetails.dropOfLocationId
                                        .latitude,
                                    dropUplongitude:
                                      item.dropOfDetails.dropOfLocationId
                                        .longitude,
                                    jobid: item.uid,
                                  })
                                }>
                                <View
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <Feather
                                    name="move"
                                    color="#fff"
                                    style={{marginRight: 5}}
                                    size={16}
                                  />
                                  <Text
                                    style={{
                                      color: '#fff',
                                      fontSize: 12,
                                      fontFamily: 'Inter-SemiBold',
                                    }}>
                                    Navigate
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    </Card>
                  );
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            ) : (
              <>
                {
                  <FlatList
                    data={foundValue}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 120}}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => {
                      return (
                        <Card
                          style={{
                            width: '100%',
                            marginTop: 5,
                            marginBottom: 5,
                            borderRadius: 20,
                            backgroundColor: '#fff',
                            borderColor: '#27AE60',
                            borderWidth: 2,
                          }}
                          key={item._id}>
                          <View
                            style={{
                              width: '100%',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}>
                            <View
                              style={{
                                width: 150,
                                height: 25,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <View
                                style={{
                                  width: 10,
                                  height: 7,
                                  backgroundColor: '#27AE60',
                                  marginTop: -19,
                                  borderBottomLeftRadius: 10,
                                }}></View>
                              <View
                                style={{
                                  width: 120,
                                  height: 25,
                                  backgroundColor: '#27AE60',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderBottomLeftRadius: 10,
                                  borderBottomRightRadius: 10,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Medium',
                                    color: '#000',
                                    fontSize: 12,
                                  }}>
                                  {item.currentStatus}
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: 10,
                                  height: 7,
                                  backgroundColor: '#27AE60',
                                  marginTop: -19,
                                  borderBottomRightRadius: 10,
                                }}></View>
                            </View>

                            <View
                              style={{
                                width: '93%',

                                marginTop: 15,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              <View
                                style={{
                                  width: '50%',
                                  flexDirection: 'column',
                                  justifyContent: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Bold',
                                    fontSize: 16,
                                    color: '#0F3B60',
                                  }}>
                                  {item.uid}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Medium',
                                    fontSize: 11,
                                    color: '#0F3B60',
                                  }}>
                                  AWB: {item.AWB}{' '}
                                </Text>
                              </View>

                              <View
                                style={{
                                  width: '50%',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                }}>
                                {item.clientId == null ? (
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-Bold',
                                      fontSize: 16,
                                      color: '#0F3B60',
                                    }}>
                                    Not Available Client
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-Bold',
                                      fontSize: 16,
                                      color: '#0F3B60',
                                    }}>
                                    {item.clientId.companyName}
                                  </Text>
                                )}

                                {item.isVpap ? (
                                  <Text
                                    style={{
                                      color: '#F39C12',
                                      fontSize: 11,
                                      fontFamily: 'Inter-Medium',
                                    }}>
                                    Required VPAP
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      color: '#F39C12',
                                      fontSize: 11,
                                      fontFamily: 'Inter-Medium',
                                    }}>
                                    Not Required VPAP
                                  </Text>
                                )}
                              </View>
                            </View>

                            <View
                              style={{
                                width: '100%',
                                height: 1,
                                backgroundColor: '#9A8A8A',
                                marginTop: 7,
                              }}></View>
                            <View
                              style={{
                                width: '93%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                              }}>
                              <View style={{width: '50%'}}>
                                <Text
                                  style={{
                                    color: '#0F3B60',
                                    fontFamily: 'Inter-SemiBold',
                                    fontSize: 13,
                                  }}>
                                  Pick Up Location
                                </Text>
                                <View
                                  style={{flexDirection: 'row', marginTop: 1}}>
                                  <Entypo
                                    name="shop"
                                    style={{
                                      marginTop: 4,
                                      marginRight: 5,
                                      color: '#57595B',
                                    }}
                                    size={15}
                                  />
                                  {item.pickUpDetails.pickupLocationId ===
                                  null ? (
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Inter-Medium',
                                        color: '#57595B',
                                      }}>
                                      not Available
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Inter-Medium',
                                        color: '#57595B',
                                        width: '85%',
                                        marginTop: 3,
                                      }}
                                      numberOfLines={1}>
                                      {
                                        item.pickUpDetails.pickupLocationId
                                          .customName
                                      }
                                    </Text>
                                  )}
                                </View>
                                <View style={{width: '100%'}}>
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-SemiBold',
                                      fontSize: 11,
                                      color: '#9B59B6',
                                    }}>
                                    Ready Time:{' '}
                                    {item.pickUpDetails.readyTime
                                      ? getFormattedDAndT(
                                          item.pickUpDetails.readyTime,
                                        )
                                      : ''}
                                    {/* <Moment
                                      element={Text}
                                      format="DD MMM YYYY hh:mm A">
                                      {item.pickUpDetails.readyTime}
                                    </Moment>{' '} */}
                                  </Text>
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-SemiBold',
                                      fontSize: 10,
                                      color: '#3498DB',
                                    }}>
                                    Cut-Off Time:{' '}
                                    {item.dropOfDetails.cutOffTime
                                      ? getFormattedDAndT(
                                          item.dropOfDetails.cutOffTime,
                                        )
                                      : ''}
                                    {/* <Moment
                                      element={Text}
                                      format="DD MMM YYYY hh:mm A">
                                      {item.dropOfDetails.cutOffTime}
                                    </Moment>{' '} */}
                                  </Text>
                                </View>
                              </View>
                              <View
                                style={{width: '50%', flexDirection: 'column'}}>
                                <Text
                                  style={{
                                    color: '#0F3B60',
                                    fontFamily: 'Inter-SemiBold',
                                    fontSize: 13,
                                  }}>
                                  Delivery Location
                                </Text>
                                <View
                                  style={{flexDirection: 'row', marginTop: 1}}>
                                  <Entypo
                                    name="shop"
                                    style={{
                                      marginTop: 4,
                                      marginRight: 5,
                                      color: '#57595B',
                                    }}
                                    size={15}
                                  />
                                  {item.dropOfDetails.dropOfLocationId ===
                                  null ? (
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Inter-Medium',
                                        color: '#57595B',
                                      }}>
                                      not Available
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Inter-Medium',
                                        color: '#57595B',
                                        width: '85%',
                                        marginTop: 3,
                                      }}
                                      numberOfLines={1}>
                                      {
                                        item.dropOfDetails.dropOfLocationId
                                          .customName
                                      }
                                    </Text>
                                  )}
                                </View>
                                <View style={{width: '100%'}}>
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-SemiBold',
                                      fontSize: 11,
                                      color: '#E67E22',
                                    }}>
                                    Pieces: {item.pieces}
                                  </Text>
                                  {item.serviceCodeId === null ? (
                                    <Text
                                      style={{
                                        fontFamily: 'Inter-SemiBold',
                                        fontSize: 10,
                                        color: '#E74C3C',
                                      }}>
                                      Service Code: Not Available
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        fontFamily: 'Inter-SemiBold',
                                        fontSize: 10,
                                        color: '#E74C3C',
                                      }}>
                                      Service Code: {item.serviceCodeId.text}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>

                            <View
                              style={{
                                width: '100%',
                                height: 1,
                                backgroundColor: '#9A8A8A',
                                marginTop: 7,
                              }}></View>
                            <View
                              style={{
                                width: '93%',
                                marginTop: 5,
                                flexDirection: 'column',
                              }}>
                              <Text
                                style={{
                                  color: '#000',
                                  fontFamily: 'Inter-Bold',
                                  fontSize: 13,
                                }}>
                                Notes
                              </Text>
                              <Text
                                numberOfLines={2}
                                style={{
                                  fontFamily: 'Inter-Regular',
                                  color: '#000',
                                  fontSize: 11,
                                }}>
                                {item.note}
                              </Text>
                            </View>
                            <View
                              style={{
                                width: '100%',
                                height: 1,
                                backgroundColor: '#9A8A8A',
                                marginTop: 7,
                              }}></View>
                            <View
                              style={{
                                width: '90%',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 15,
                              }}>
                              <View
                                style={{
                                  height: 40,
                                  width: '45%',
                                  backgroundColor: '#0F3B60',
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderRadius: 10,
                                }}>
                                <TouchableOpacity
                                  onPress={() => handleClick(item._id)}>
                                  <View
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      flexDirection: 'row',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                    }}>
                                    <Feather
                                      name="eye"
                                      color="#fff"
                                      style={{marginRight: 5}}
                                      size={16}
                                    />
                                    <Text
                                      style={{
                                        color: '#fff',
                                        fontSize: 12,
                                        fontFamily: 'Inter-SemiBold',
                                      }}>
                                      View Detail
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </View>

                              {item.pickUpDetails.pickupLocationId.latitude ===
                                null ||
                              item.dropOfDetails.dropOfLocationId.latitude ===
                                null ? (
                                <View
                                  style={{
                                    height: 40,
                                    width: '45%',
                                    marginBottom: 15,
                                    backgroundColor: '#0F3B60',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 10,
                                  }}>
                                  <TouchableOpacity
                                    onPress={() =>
                                      Alert.alert('Not Found Any Location ')
                                    }>
                                    <View
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                      <Feather
                                        name="move"
                                        color="#fff"
                                        style={{marginRight: 5}}
                                        size={16}
                                      />
                                      <Text
                                        style={{
                                          color: '#fff',
                                          fontSize: 12,
                                          fontFamily: 'Inter-SemiBold',
                                        }}>
                                        Navigate
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <View
                                  style={{
                                    height: 40,
                                    width: '45%',
                                    marginBottom: 15,
                                    backgroundColor: '#0F3B60',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 10,
                                  }}>
                                  <TouchableOpacity
                                    onPress={() =>
                                      navigation.navigate('Map', {
                                        pickUplatitude:
                                          item.pickUpDetails.pickupLocationId
                                            .latitude,
                                        pickUplongitude:
                                          item.pickUpDetails.pickupLocationId
                                            .longitude,
                                        dropUplatitude:
                                          item.dropOfDetails.dropOfLocationId
                                            .latitude,
                                        dropUplongitude:
                                          item.dropOfDetails.dropOfLocationId
                                            .longitude,
                                        jobid: item.uid,
                                      })
                                    }>
                                    <View
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}>
                                      <Feather
                                        name="move"
                                        color="#fff"
                                        style={{marginRight: 5}}
                                        size={16}
                                      />
                                      <Text
                                        style={{
                                          color: '#fff',
                                          fontSize: 12,
                                          fontFamily: 'Inter-SemiBold',
                                        }}>
                                        Navigate
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          </View>
                        </Card>
                      );
                    }}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    }
                  />
                }
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
}
