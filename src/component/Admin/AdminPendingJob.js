/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../config';
import { getFormattedDAndT } from '../common/DateTimeFormate';
import Moment from 'react-moment';
import { useNavigation } from '@react-navigation/native';
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
import moment from 'moment';

export default function AdminPendingJob({
  filter,
  Status,
  clientName,
  driverName,
  selectedDates,
  jobInputId,
  awsInput,
  selectDriver,
  selectClient,
  driverId,
  clientId,
  clientInput,
}) {
  const [isAtBottom, setIsAtBottom] = useState(false);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [foundValue, setFoundValue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const today = new Date();
  const todayDateFormat = moment(today).format('YYYY-MM-DD');

  const navigation = useNavigation();
  const handleClick = _id => {
    navigation.navigate('AdminJobDetail', { jobId: _id });
  };

  const handleData = async (page, limit) => {
    let response = {};
    try {
      const token = await AsyncStorage.getItem('adminToken');
      response = await fetch(
        `${BASE_URL}admin/info/allJobsPending?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const dataRes = await response.json();
      setData(dataRes.data.jobs);
      console.log(dataRes.data.jobs);
      console.log("latitue");


      setTotalPages(dataRes.data.totalPages);
      setCurrentPage(dataRes.data.currentPage);
    } catch (error) {
      //console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleData(currentPage, limit).then(() => setRefreshing(false));
  }, []);




  useEffect(() => {
    handleData(currentPage, limit);
    const interval = setInterval(() => {
      handleData(currentPage, limit);
    }, 10000); // Fetch new data every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [currentPage, limit]);

  useEffect(() => {
    handleData(currentPage, limit);
  }, [currentPage, limit]);

  const handleLoadMore = () => {
    if (!loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePageChange = () => {
    if (totalPages !== currentPage) {
      setCurrentPage(currentPage => currentPage + 1);
    }
  };

  const handleShowMore = () => {
    setLimit(limit => limit + 10);
    // Increase limit by 10 (or any number you choose)
    // handlePageChange()
  };

  const handleScroll = event => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setIsAtBottom(isBottom);
  };

  useEffect(() => {
    handleFilter();
  }, [
    filter,
    Status,
    clientName,
    driverName,
    selectedDates,
    awsInput,
    jobInputId,
    selectClient,
    selectDriver,
    clientId,
    driverId,
    clientInput,
  ]);

  const handleFilter = async () => {
    switch (filter) {
      case 'Status':
        const token = await AsyncStorage.getItem('adminToken');
        const responseS = await fetch(
          `${BASE_URL}admin/info/jobFilter?currentStatus=${Status}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const dataStaue = await responseS.json();
        setFoundValue(dataStaue.data);
        break;
      case 'Client':
        const tokenAC = await AsyncStorage.getItem('adminToken');
        const responseClient = await fetch(
          `${BASE_URL}admin/info/jobFilter?clientId=${clientId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenAC}`,
            },
          },
        );
        const dataClient = await responseClient.json();
        setFoundValue(dataClient.data);
        break;
      case 'Driver':
        const tokenAD = await AsyncStorage.getItem('adminToken');
        const response = await fetch(
          `${BASE_URL}admin/info/jobFilter?driverId=${driverId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenAD}`,
            },
          },
        );
        const driverData = await response.json();

        setFoundValue(driverData.data);
        break;
      case 'Today':
        const tokenAT = await AsyncStorage.getItem('adminToken');
        const responseToday = await fetch(
          `${BASE_URL}admin/info/jobFilter?fromDate=${todayDateFormat}&toDate=${todayDateFormat}`,
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
      case 'Custom Date':
        const tokenACD = await AsyncStorage.getItem('adminToken');

        const responseCustomToday = await fetch(
          `${BASE_URL}admin/info/jobFilter?fromDate=${selectedDates}&toDate=${selectedDates}`,
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
        console.log(foundValue);

        break;
      case 'JobId':
        const tokenAJ = await AsyncStorage.getItem('adminToken');
        const responseJOBID = await fetch(
          `${BASE_URL}admin/info/jobFilter?uid=${jobInputId.toUpperCase()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenAJ}`,
            },
          },
        );
        const dataJobId = await responseJOBID.json();
        setFoundValue(dataJobId.data);
        break;
      case 'AWB':
        const tokenAWS = await AsyncStorage.getItem('adminToken');
        const responseAws = await fetch(
          `${BASE_URL}admin/info/jobFilter?AWB=${awsInput}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenAWS}`,
            },
          },
        );
        const dataAws = await responseAws.json();
        setFoundValue(dataAws.data);
        break;
      case 'SearchInput':
        if (clientInput.length > 2) {
          console.log(clientInput);

          const SearchInputs = data.filter(item => {
            return item.clientId && item.clientId.companyName
              .toLowerCase()
              .includes(clientInput.toLowerCase());
          });
          setFoundValue(SearchInputs);
          console.log(SearchInputs); // Updated to log the correct variable
        } else {
          setFoundValue(data);
        }
        return;

      // Add other cases for different filters
      default:
        setFoundValue(data);
    }
  };

  return (
    <View
      style={{
        maxHeight: '83%',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 15,
      }}>
      <View style={{ width: '90%', height: '90%' }}>
        {loading ? (
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              height: 400,
              width: '100%',
              justifyContent: 'center',
            }}>
            <ActivityIndicator size={'small'} color={'#000'} />
            <Text style={{ color: '#000', fontSize: 15 }}>Loading</Text>
          </View>
        ) : (
          <>
            {filter === '' ? (
              <FlatList
                data={data}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item._id}
                renderItem={({ item }) => {
                  return (
                    <Card
                      style={{
                        width: '100%',
                        marginTop: 5,
                        marginBottom: 5,
                        borderRadius: 20,
                        backgroundColor: '#fff',
                        borderColor:
                          item.currentStatus === 'Cancelled'
                            ? '#e74c3c'
                            : '#F1C40F',
                        borderWidth: 2,
                      }}>
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
                              backgroundColor:
                                item.currentStatus === 'Cancelled'
                                  ? '#e74c3c'
                                  : '#F1C40F',
                              marginTop: -19,
                              borderBottomLeftRadius: 10,
                            }}></View>
                          <View
                            style={{
                              width: 120,
                              height: 25,
                              backgroundColor:
                                item.currentStatus === 'Cancelled'
                                  ? '#e74c3c'
                                  : '#F1C40F',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter-Medium',
                                color:
                                  item.currentStatus === 'Cancelled'
                                    ? '#fff'
                                    : '#000',
                                fontSize: 12,
                              }}>
                              {item.currentStatus}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 10,
                              height: 7,
                              backgroundColor:
                                item.currentStatus === 'Cancelled'
                                  ? '#e74c3c'
                                  : '#F1C40F',
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
                              AWB:{item.AWB}
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
                          <View style={{ width: '50%' }}>
                            <Text
                              style={{
                                color: '#0F3B60',
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 13,
                              }}>
                              Pick Up Location
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 1 }}>
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
                                    width: '80%',
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
                            <View style={{ width: '100%' }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 11,
                                  color: '#9B59B6',
                                }}>
                                Ready Time:{' '}
                                {/* <Moment
                                  element={Text}
                                  format="DD MMM YYYY hh:mm A">
                                  {item.pickUpDetails.readyTime}
                                </Moment> */}
                                {item.pickUpDetails.readyTime
                                  ? getFormattedDAndT(item.pickUpDetails.readyTime)
                                  : ''}
                                {' '}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 10,
                                  color: '#3498DB',
                                }}>
                                Cut-Off Time:{' '}
                                {/* <Moment
                                  element={Text}
                                  format="DD MMM YYYY hh:mm A">
                                  {item.dropOfDetails.cutOffTime}
                                </Moment> */}
                                {item.dropOfDetails.cutOffTime
                                  ? getFormattedDAndT(item.dropOfDetails.cutOffTime)
                                  : ''}
                                {' '}
                              </Text>
                            </View>
                          </View>
                          <View style={{ width: '50%', flexDirection: 'column' }}>
                            <Text
                              style={{
                                color: '#0F3B60',
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 13,
                              }}>
                              Delivery Location
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 1 }}>
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
                                    width: '80%',
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
                            <View style={{ width: '100%' }}>
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
                                  style={{ marginRight: 5 }}
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
                                    style={{ marginRight: 5 }}
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
                                    style={{ marginRight: 5 }}
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
                ListFooterComponent={loading && <ActivityIndicator />}
                onEndReachedThreshold={0.5}
                onEndReached={handleShowMore}
                onScroll={handleScroll}
                scrollEventThrottle={16} q
              />
            ) : (
              <FlatList
                data={foundValue}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                keyExtractor={item => item._id}
                renderItem={({ item }) => {
                  return (
                    <Card
                      style={{
                        width: '100%',
                        marginTop: 5,
                        marginBottom: 5,
                        borderRadius: 20,
                        backgroundColor: '#fff',
                        borderColor:
                          item.currentStatus === 'Cancelled'
                            ? '#e74c3c'
                            : '#F1C40F',
                        borderWidth: 2,
                      }}>
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
                              backgroundColor:
                                item.currentStatus === 'Cancelled'
                                  ? '#e74c3c'
                                  : '#F1C40F',
                              marginTop: -19,
                              borderBottomLeftRadius: 10,
                            }}></View>
                          <View
                            style={{
                              width: 120,
                              height: 25,
                              backgroundColor:
                                item.currentStatus === 'Cancelled'
                                  ? '#e74c3c'
                                  : '#F1C40F',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter-Medium',
                                color:
                                  item.currentStatus === 'Cancelled'
                                    ? '#fff'
                                    : '#000',
                                fontSize: 12,
                              }}>
                              {item.currentStatus}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 10,
                              height: 7,
                              backgroundColor:
                                item.currentStatus === 'Cancelled'
                                  ? '#e74c3c'
                                  : '#F1C40F',
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
                              AWB:{item.AWB}
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
                          <View style={{ width: '50%' }}>
                            <Text
                              style={{
                                color: '#0F3B60',
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 13,
                              }}>
                              Pick Up Location
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 1 }}>
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
                                    width: '80%',
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
                            <View style={{ width: '100%' }}>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 11,
                                  color: '#9B59B6',
                                }}>
                                Ready Time:{' '}
                                {/* <Moment
                                  element={Text}
                                  format="DD MMM YYYY hh:mm A">
                                  {item.pickUpDetails.readyTime}
                                </Moment> */}
                                {item.pickUpDetails.readyTime
                                  ? getFormattedDAndT(item.pickUpDetails.readyTime)
                                  : ''}
                                {' '}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: 'Inter-SemiBold',
                                  fontSize: 10,
                                  color: '#3498DB',
                                }}>
                                Cut-Off Time:{' '}
                                {/* <Moment
                                  element={Text}
                                  format="DD MMM YYYY hh:mm A">
                                  {item.dropOfDetails.cutOffTime}
                                </Moment> */}
                                {item.dropOfDetails.cutOffTime
                                  ? getFormattedDAndT(item.dropOfDetails.cutOffTime)
                                  : ''}
                                {' '}
                              </Text>
                            </View>
                          </View>
                          <View style={{ width: '50%', flexDirection: 'column' }}>
                            <Text
                              style={{
                                color: '#0F3B60',
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 13,
                              }}>
                              Delivery Location
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 1 }}>
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
                                    width: '80%',
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
                            <View style={{ width: '100%' }}>
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
                                  style={{ marginRight: 5 }}
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

                          {item?.pickUpDetails.pickupLocationId.latitude ===
                            null ||
                            item?.dropOfDetails.dropOfLocationId.latitude ===
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
                                    style={{ marginRight: 5 }}
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
                                      item?.pickUpDetails?.pickupLocationId
                                        ?.latitude,
                                    pickUplongitude:
                                      item?.pickUpDetails?.pickupLocationId
                                        ?.longitude,
                                    dropUplatitude:
                                      item?.dropOfDetails?.dropOfLocationId
                                        ?.latitude,
                                    dropUplongitude:
                                      item?.dropOfDetails?.dropOfLocationId
                                        ?.longitude,
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
                                    style={{ marginRight: 5 }}
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
                ListFooterComponent={loading && <ActivityIndicator />}
                onEndReachedThreshold={0.5}
                onEndReached={handleLoadMore}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}
