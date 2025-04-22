import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {Card} from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../../config';
import Entypo from 'react-native-vector-icons/Entypo';
import Moment from 'react-moment';
import {getFormattedDAndT} from '../common/DateTimeFormate';
import moment from 'moment';

export default function AdminDeliveredJob({
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
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [foundValue, setFoundValue] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const navigation = useNavigation();
  const handleClick = _id => {
    navigation.navigate('AdminJobDetail', {jobId: _id});
  };

  const today = new Date();
  const todayDateFormat = moment(today).format('YYYY-MM-DD');

  const handleData = async (page, limit) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      const response = await fetch(
        `${BASE_URL}admin/info/allJobsDelivered?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setData(data.data.jobs);
      setTotalPages(data.data.totalPages);
      setCurrentPage(data.data.currentPage);
      // console.log('data', data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleData(currentPage, limit).then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    setPage(1);
    handleData(currentPage, limit);
    const interval = setInterval(() => {
      handleData(currentPage, limit);
    }, 5000); // Fetch new data every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    handleData(currentPage, limit);
  }, [currentPage, limit]);

  const handleLoadMore = () => {
    if (!loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePageChange = () => {
    if (totalPages != currentPage) {
      setCurrentPage(currentPage => currentPage + 1);
    }
  };

  // console.log("currentPage",currentPage)

  const handleShowMore = () => {
    setLimit(limit => limit + 10);
    // Increase limit by 10 (or any number you choose)
    // handlePageChange()
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
  ]);

  const handleFilter = async () => {
    switch (filter) {
      case 'Client':
        const tokenAC = await AsyncStorage.getItem('adminToken');
        const responseClient = await fetch(
          `${BASE_URL}admin/info/jobFilter?clientId=${clientId}&currentStatus=Delivered`,
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
          `${BASE_URL}admin/info/jobFilter?driverId=${driverId}&currentStatus=Delivered`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenAD}`,
            },
          },
        );
        const data = await response.json();

        setFoundValue(data.data);
        break;
      case 'Today':
        const tokenAT = await AsyncStorage.getItem('adminToken');
        const responseToday = await fetch(
          `${BASE_URL}admin/info/jobFilter?fromDate=${todayDateFormat}&toDate=${todayDateFormat}&currentStatus=Delivered`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenAT}`,
            },
          },
        );
        const dataToday = await responseToday.json();
        // console.log('dataToday', dataToday);
        setFoundValue(dataToday.data);
        break;
      case 'Custom Date':
        const tokenACD = await AsyncStorage.getItem('adminToken');
        const responseCustomToday = await fetch(
          `${BASE_URL}admin/info/jobFilter?fromDate=${selectedDates}&toDate=${selectedDates}&currentStatus=Delivered`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tokenACD}`,
            },
          },
        );
        const dataCustomToday = await responseCustomToday.json();
        console.log('dataCustomToday', dataCustomToday);
        setFoundValue(dataCustomToday.data);
        break;
      case 'JobId':
        const tokenAJ = await AsyncStorage.getItem('adminToken');
        const responseJOBID = await fetch(
          `${BASE_URL}admin/info/jobFilter?uid=${jobInputId}&currentStatus=Delivered`,
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
          `${BASE_URL}admin/info/jobFilter?AWB=${awsInput}&currentStatus=Delivered`,
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
      <View style={{width: '90%', height: '90%'}}>
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
            <Text style={{color: '#000', fontSize: 15}}>Loading</Text>
          </View>
        ) : (
          <>
            {filter === '' ? (
              <FlatList
                data={data}
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
                        borderColor: '#2ecc71',
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
                            width: 109,
                            height: 25,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 10,
                              height: 7,
                              backgroundColor: '#2ecc71',
                              marginTop: -19,
                              borderBottomLeftRadius: 10,
                            }}></View>
                          <View
                            style={{
                              width: 90,
                              height: 25,
                              backgroundColor: '#2ecc71',
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
                                fontSize: 13,
                              }}>
                              Delivered
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 10,
                              height: 7,
                              backgroundColor: '#2ecc71',
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
                              width: '35%',
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
                              AWB: {item.AWB}
                            </Text>
                          </View>
                          <View style={{width: '20%'}}></View>
                          <View
                            style={{
                              width: '35%',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}>
                            {item.clientId === null ? (
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
                                not Required VPAP
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
                                  : ''}{' '}
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
                                  : ''}{' '}
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
                ListFooterComponent={loading && <ActivityIndicator />}
                onEndReachedThreshold={0.5}
                onEndReached={handleShowMore}
              />
            ) : (
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
                        borderColor: '#2ecc71',
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
                            width: 109,
                            height: 25,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 10,
                              height: 7,
                              backgroundColor: '#2ecc71',
                              marginTop: -19,
                              borderBottomLeftRadius: 10,
                            }}></View>
                          <View
                            style={{
                              width: 90,
                              height: 25,
                              backgroundColor: '#2ecc71',
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
                                fontSize: 13,
                              }}>
                              Delivered
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 10,
                              height: 7,
                              backgroundColor: '#2ecc71',
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
                              width: '35%',
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
                              AWB: {item.AWB}
                            </Text>
                          </View>
                          <View style={{width: '20%'}}></View>
                          <View
                            style={{
                              width: '35%',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}>
                            {item.clientId === null ? (
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
                                not Required VPAP
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
                                  : ''}{' '}
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
                                  : ''}{' '}
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
                ListFooterComponent={loading && <ActivityIndicator />}
                onEndReachedThreshold={0.5}
                onEndReached={handleLoadMore}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}
