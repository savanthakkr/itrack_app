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
} from 'react-native';
import React, {useRef, useEffect, useState, useContext} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Card} from 'react-native-paper';
import {AuthContext} from './Context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../config';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import {Item} from 'react-native-paper/lib/typescript/components/Drawer/Drawer';

export default function JobDetail({navigation, route}) {
  const {jobId} = route.params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [InputNote, setInputNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // download image
  const checkPermission = async url => {
    // Function to check the platform
    // If iOS then start downloading
    // If Android then ask for permission

    if (Platform.OS === 'ios') {
      downloadImage(url);
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to download Photos',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Once user grant the permission start downloading
          downloadImage(url);
        } else {
          // If permission denied then show alert
          alert('Storage Permission Not Granted');
        }
      } catch (err) {
        // To handle permission related exception
        // console.warn(err);
      }
    }
  };

  const [getImgUri, setGetImgUri] = useState('');

  const downloadImage = url => {
    setGetImgUri(url);

    // Main function to download the image

    // To add the time suffix in filename
    let date = new Date();
    // Image URL which we want to download
    let image_URL = getImgUri;
    // Getting the extention of the file
    let ext = getExtention(image_URL);
    ext = '.' + ext[0];
    // Get config and fs from RNFetchBlob
    // config: To pass the downloading related options
    // fs: Directory path where we want our image to download
    const {config, fs} = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        // Related to the Android only
        useDownloadManager: true,
        notification: true,
        path:
          PictureDir +
          '/image_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          ext,
        description: 'Image',
      },
    };
    config(options)
      .fetch('GET', image_URL)
      .then(res => {
        // Showing alert after successful downloading
        alert('Image Downloaded Successfully.');
      });
  };

  const getExtention = filename => {
    // To get the file extension
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
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
        const data = await response.json();
        setData(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    handleData();
  }, [jobId, refetch]);

  const {loginType, setLoginType} = useContext(AuthContext);

  const [isOpenMain, setIsOpenMain] = useState(false);
  const [isOpenNote, setIsOpenNote] = useState(false);

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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setNoteLoading(false);
      handleClickDownNote();
    }
  };

  const handleUpdateJobStatus = async status => {
    setIsLoading(false);
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
  };

  const handleNav = _id => {
    navigation.navigate('Signature', {jobId: _id});
  };

  return (
    <>
      {loading ? (
        <Text>Loading</Text>
      ) : (
        <>
          <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
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
                  <View style={{width: '25%', height: 50}}></View>
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
                <Text style={{fontFamily: 'Inter-SemiBold', color: '#0F3B60'}}>
                  Job Id: {data.uid}
                </Text>
                {data.isVpap === true ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('VPAP', {id: data._id})}>
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
                          style={{width: '100%', height: '100%'}}>
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
                                navigation.navigate('VPAP', {id: data._id})
                              }
                              style={{width: '100%', height: '100%'}}>
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
                              onPress={() => handleUpdateJobStatus('Picked Up')}
                              style={{width: '100%', height: '100%'}}>
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
                          style={{width: '100%', height: '100%'}}>
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
                          onPress={() => handleNav(data._id)}
                          style={{width: '100%', height: '100%'}}>
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
                          height: 45,
                          backgroundColor: '#CE6D17',
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
                            Delivered Complete
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
                      width: '48%',
                      height: 35,
                      backgroundColor: '#55EFC4',
                      borderRadius: 5,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity
                      style={{width: '100%', height: '100%'}}
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
                          width: '80%',
                        }}>
                        null
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontFamily: 'Inter-Light',
                          color: '#0F3B60',
                          fontSize: 11,
                          width: '80%',
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
                    <Text
                      style={{
                        fontFamily: 'Inter-Light',
                        color: '#0F3B60',
                        fontSize: 11,
                      }}>
                      {data.serviceCodeId.text}
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
                      Service Type :{' '}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter-Light',
                        color: '#0F3B60',
                        fontSize: 11,
                      }}>
                      {data.serviceTypeId.text}
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
                    <View style={{width: '100%', marginBottom: 5}}>
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
                    style={{width: '100%', marginTop: 10, marginBottom: 10}}>
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
              {data.driverNote != null ? (
                <View
                  style={{
                    width: '90%',
                    backgroundColor: '#E4E3FC',
                    borderRadius: 10,
                    marginTop: 20,
                    padding: 5,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      color: '#000',
                      fontSize: 12,
                      textAlign: 'center',
                    }}>
                    Your Note Here
                  </Text>
                  <View
                    style={{
                      height: 1,
                      width: '100%',
                      backgroundColor: '#CFCFCF',
                      marginBottom: 5,
                      marginTop: 5,
                    }}></View>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      color: '#000',
                      fontSize: 10,
                      textAlign: 'center',
                    }}>
                    {data.driverNote}
                  </Text>
                </View>
              ) : (
                <></>
              )}
            </View>
          </ScrollView>
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
                  <View style={{width: '25%', height: '100%'}}></View>
                  <View
                    style={{
                      width: '50%',
                      height: '100%',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{color: '#0F3B60', fontFamily: 'Inter-SemiBold'}}>
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
                              `https://hariom-bucket.s3.ap-south-1.amazonaws.com/huss/${it}`,
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
                  <View style={{width: '25%', height: '100%'}}></View>
                  <View
                    style={{
                      width: '50%',
                      height: '100%',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{color: '#0F3B60', fontFamily: 'Inter-SemiBold'}}>
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
                          style={{color: '#fff', fontFamily: 'Inter-SemiBold'}}>
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
    </>
  );
}
