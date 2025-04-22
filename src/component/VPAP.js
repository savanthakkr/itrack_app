/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {Card} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../config';
import Geolocation from '@react-native-community/geolocation';
import DeviceInfo from 'react-native-device-info';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CheckBox from './common/CheckBox';
import RadioButton from './common/RadioButton';
export default function VPAP({navigation, route}) {
  const {id} = route.params;
  const insets = useSafeAreaInsets();

  // send location pick up job
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [driverId, setDriverId] = useState();
  useEffect(() => {
    AsyncStorage.getItem('driverId').then(id => setDriverId(id));
  });

  useEffect(() => {
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
  }, []);

  const getCurrentLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(`${BASE_URL}driver/pickupAdrr?id=${id}`, {
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

  const [checked, setChecked] = React.useState(false);

  const [integralCartonsA, setIntegralCartonsA] = useState(false);
  const [
    VentilationholesofcartonscoveredA,
    setVentilationholesofcartonscoveredA,
  ] = useState(false);
  const [polytheneLinerA, setPolytheneLinerA] = useState(false);
  const [meshorPlasticA, setMeshorPlasticA] = useState(false);
  const [cartonpackedA, setCartonpackedA] = useState(false);
  const [notApplicableDamageA, setNotApplicableeDamageA] = useState(false);
  const [checkDamageA, setCheckeDamageA] = useState(false);

  const [
    VentilationholesofcartonscoveredB,
    setVentilationholesofcartonscoveredB,
  ] = useState(false);
  const [polytheneLinerB, setPolytheneLinerB] = useState(false);
  const [meshorPlasticB, setMeshorPlasticB] = useState(false);
  const [notApplicableDamageB, setNotApplicableeDamageB] = useState(false);
  const [checkDamageB, setCheckeDamageB] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [sections, setSections] = useState([
    {
      title: 'Section A',
      options: [
        {
          label:
            'Integral Cartons: Goods must be packed in fully enclosed cartons that have no ventilation holes, and with lids tightly fixed.',
          checked: integralCartonsA,
        },
        {
          label:
            'Ventilation holes of cartons covered: Ventilation holes must be covered/sealed with mesh/screen of no more than 1.6mm diameter pore size and not less than 0.16mm strand thickness. Alternatively, ventilation holes may be taped over.',
          checked: VentilationholesofcartonscoveredA,
        },
        {
          label:
            'Polythene Liner: Vented carton with polythene liners/bags must be sealed. Overlapping folder edges of polythene liner is considered sealed.',
          checked: polytheneLinerA,
        },
        {
          label:
            '   Mesh or Plastic (Shrink) wrapped pallets or ULD’s: ULD’s transporting cartons with ventilation holes/gaps, or palletized cartons with ventilation holes/gaps must be fully covered or wrapped with polythene/plastic/foil sheet or mesh/screen of no more that 1.6mm diameter pore size and not less than 0.16mm strand thickness.',
          checked: meshorPlasticA,
        },
        {
          label:
            ' Carton packed in ab enclosed container: C, AAP, AMF, AAF, ALF,AKE, AKH',
          checked: cartonpackedA,
        },
        {label: 'Not Applicable', checked: notApplicableDamageA},
      ],
      damage: {
        yes: checkDamageA === 'Yes' ? true : false,
        no: checkDamageA === 'Yes' ? false : true,
      },
    },
    {
      title: 'Section B',
      options: [
        {
          label:
            'Placed in an enclosed container: i.e. AMP, AAP, AMF, AAF, ALF, AKE, AKH',
          checked: polytheneLinerB,
        },
        {
          label:
            'Ventilation holes of cartons covered: Ventilation holes must be covered/sealed with mesh/screen of no more than 1.6mm diameter pore size and not less than 0.16mm strand thickness.Alternatively, ventilation holes may be taped over.',
          checked: VentilationholesofcartonscoveredB,
        },
        {
          label:
            'Mesh or Plastic (Shrink) wrapped pallets or ULD’s: ULD’stransporting cartons with ventilation holes/gaps, or palletized cartons with ventilation holes/gaps must be fully covered or wrapped with polythene/plastic/foil sheet or mesh/screen of no more than 1.6mm diameter pore size and not less than 0.16mm strand thickness.',
          checked: meshorPlasticB,
        },
        {label: 'Not Applicable', checked: notApplicableDamageB},
      ],
      damage: {
        yes: checkDamageB === 'Yes' ? true : false,
        no: checkDamageB === 'Yes' ? false : true,
      },
    },
  ]);

  useEffect(() => {
    setSections([
      {
        title: 'Section A',
        options: [
          {
            label:
              'Integral Cartons: Goods must be packed in fully enclosed cartons that have no ventilation holes, and with lids tightly fixed.',
            checked: integralCartonsA,
          },
          {
            label:
              'Ventilation holes of cartons covered: Ventilation holes must be covered/sealed with mesh/screen of no more than 1.6mm diameter pore size and not less than 0.16mm strand thickness. Alternatively, ventilation holes may be taped over.',
            checked: VentilationholesofcartonscoveredA,
          },
          {
            label:
              'Polythene Liner: Vented carton with polythene liners/bags must be sealed. Overlapping folder edges of polythene liner is considered sealed.',
            checked: polytheneLinerA,
          },
          {
            label:
              '   Mesh or Plastic (Shrink) wrapped pallets or ULD’s: ULD’s transporting cartons with ventilation holes/gaps, or palletized cartons with ventilation holes/gaps must be fully covered or wrapped with polythene/plastic/foil sheet or mesh/screen of no more that 1.6mm diameter pore size and not less than 0.16mm strand thickness.',
            checked: meshorPlasticA,
          },
          {
            label:
              ' Carton packed in ab enclosed container: C, AAP, AMF, AAF, ALF,AKE, AKH',
            checked: cartonpackedA,
          },
          {label: 'Not Applicable', checked: notApplicableDamageA},
        ],
        damage: {
          yes: checkDamageA === 'Yes' ? true : false,
          no: checkDamageA === 'Yes' ? false : true,
        },
      },
      {
        title: 'Section B',
        options: [
          {
            label:
              'Placed in an enclosed container: i.e. AMP, AAP, AMF, AAF, ALF, AKE, AKH',
            checked: polytheneLinerB,
          },
          {
            label:
              'Ventilation holes of cartons covered: Ventilation holes must be covered/sealed with mesh/screen of no more than 1.6mm diameter pore size and not less than 0.16mm strand thickness.Alternatively, ventilation holes may be taped over.',
            checked: VentilationholesofcartonscoveredB,
          },
          {
            label:
              'Mesh or Plastic (Shrink) wrapped pallets or ULD’s: ULD’stransporting cartons with ventilation holes/gaps, or palletized cartons with ventilation holes/gaps must be fully covered or wrapped with polythene/plastic/foil sheet or mesh/screen of no more than 1.6mm diameter pore size and not less than 0.16mm strand thickness.',
            checked: meshorPlasticB,
          },
          {label: 'Not Applicable', checked: notApplicableDamageB},
        ],
        damage: {
          yes: checkDamageB === 'Yes' ? true : false,
          no: checkDamageB === 'Yes' ? false : true,
        },
      },
    ]);
  }, [
    integralCartonsA,
    VentilationholesofcartonscoveredA,
    polytheneLinerA,
    meshorPlasticA,
    cartonpackedA,
    notApplicableDamageA,
    checkDamageA,
    VentilationholesofcartonscoveredB,
    polytheneLinerB,
    meshorPlasticB,
    notApplicableDamageB,
    checkDamageB,
  ]);

  console.log('data.currentStatus:', data);

  useEffect(() => {
    const handleData = async () => {
      try {
        const token = await AsyncStorage.getItem('driverToken');
        const response = await fetch(`${BASE_URL}driver/jobById?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setData(data.data);
      } catch (error) {
        // console.error(error);
      } finally {
        setLoading(false);
      }
    };
    handleData();
  }, [id]);

  const handleisVpap = async () => {
    const jobId = id;
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const response = await fetch(`${BASE_URL}driver/vpap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({jobId, sections}),
      });
      console.log(response.body);
      console.log(response.headers);
      console.log(response.status);
      console.log(response);
      console.log('vpap');

      const data = await response.json();
    } catch (error) {
      // console.log('error', error);
    }
  };

  const handleUpdateJobStatus = async status => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('driverToken');
      console.log('LAT__LONG:', latitude, longitude);

      const response = await fetch(`${BASE_URL}driver/jobStatus?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          cache: 'no-store',
        },
        body: JSON.stringify({
          new_status: `${status}`,
          latitude: `${latitude}`,
          longitude: `${longitude}`,
        }),
      });
      console.log(response.body);
      console.log(response.status);
      console.log('vpapa status update', response.body, response);
      const data = await response.json();
      const isvpap = await handleisVpap();
      const location = await getCurrentLocation();
    } catch (error) {
      console.error('Stats update Error:', error);
    } finally {
      setIsLoading(false);
      navigation.goBack();
      // navigation.navigate('Home');
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <SafeAreaView style={{backgroundColor: '#0F3B60'}} />
      <View
        style={{
          maxHeight: '100%',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        {loading ? (
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              marginTop: 20,
            }}>
            <Text style={{color: '#000', fontFamily: 'Inter-SemiBold'}}>
              Loading
            </Text>
            <ActivityIndicator size={'small'} color={'#000'} />
          </View>
        ) : (
          <>
            <View
              style={{
                height: 80,
                width: '100%',
                backgroundColor: '#0F3B60',
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'row',
                  height: 70,
                  alignItems: 'center',
                }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Feather name="chevron-left" size={25} color="#fff" />
                </TouchableOpacity>
                <View style={{marginLeft: 10}}>
                  <Text style={{fontFamily: 'Inter-SemiBold', color: '#fff'}}>
                    Job Id: {data.uid}
                  </Text>
                  <Text
                    style={{
                      color: '#fff',
                      fontFamily: 'Inter-Medium',
                      fontSize: 9,
                      marginTop: 3,
                      marginLeft: 3,
                    }}>
                    Enter VPAP Details
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={{paddingBottom: 120}}
              style={{
                width: '100%',
                paddingHorizontal: 20,
              }}>
              <Card
                style={{
                  marginTop: 20,
                  backgroundColor: '#fff',
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      marginTop: 10,
                      fontFamily: 'Inter-Bold',
                      color: '#3498DB',
                    }}>
                    Section A
                  </Text>
                  <View
                    style={{
                      width: '95%',
                      height: 1,
                      backgroundColor: 'gray',
                      marginTop: 5,
                    }}></View>

                  <View style={{width: '90%', marginTop: 10}}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 11,
                        textAlign: 'center',
                        color: '#000000',
                        marginTop: 5,
                      }}>
                      {' '}
                      Consignment Packaging for airfreight perishable must be
                      verified for compliance with one or more of the following
                      secure packaging options.
                    </Text>
                  </View>

                  <View
                    style={{
                      width: '90%',
                      marginTop: 10,
                      flexDirection: 'row',
                    }}>
                    <View style={{width: '15%', marginTop: 15}}>
                      <CheckBox
                        checked={integralCartonsA}
                        onChange={() => {
                          setIntegralCartonsA(!integralCartonsA);
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 5,
                        }}>
                        Integral Cartons: Goods must be packed in fully enclosed
                        cartons that have no ventilation holes, and with lids
                        tightly fixed.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      width: '90%',
                      marginTop: 10,
                      flexDirection: 'row',
                    }}>
                    <View style={{width: '15%', marginTop: 15}}>
                      <CheckBox
                        checked={VentilationholesofcartonscoveredA}
                        onChange={() => {
                          setVentilationholesofcartonscoveredA(
                            !VentilationholesofcartonscoveredA,
                          );
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 5,
                        }}>
                        Ventilation holes of cartons covered: Ventilation holes
                        must be covered/sealed with mesh/screen of no more than
                        1.6mm diameter pore size and not less than 0.16mm strand
                        thickness. Alternatively, ventilation holes may be taped
                        over.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
                    <View style={{width: '15%', marginTop: 15}}>
                      <CheckBox
                        checked={polytheneLinerA}
                        onChange={() => {
                          setPolytheneLinerA(!polytheneLinerA);
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 5,
                        }}>
                        Polythene Liner: Vented carton with polythene
                        liners/bags must be sealed. Overlapping folder edges of
                        polythene liner is considered sealed.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
                    <View style={{width: '15%', marginTop: 15}}>
                      <CheckBox
                        checked={meshorPlasticA}
                        onChange={() => {
                          setMeshorPlasticA(!meshorPlasticA);
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 5,
                        }}>
                        Mesh or Plastic (Shrink) wrapped pallets or ULD’s: ULD’s
                        transporting cartons with ventilation holes/gaps, or
                        palletized cartons with ventilation holes/gaps must be
                        fully covered or wrapped with polythene/plastic/foil
                        sheet or mesh/screen of no more that 1.6mm diameter pore
                        size and not less than 0.16mm strand thickness.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
                    <View style={{width: '15%', marginTop: 10}}>
                      <CheckBox
                        checked={cartonpackedA}
                        onChange={() => {
                          setCartonpackedA(!cartonpackedA);
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 5,
                        }}>
                        Carton packed in ab enclosed container: C, AAP, AMF,
                        AAF, ALF, AKE, AKH{' '}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
                    <View style={{width: '15%', marginTop: 10}}>
                      <CheckBox
                        checked={notApplicableDamageA}
                        onChange={() => {
                          setNotApplicableeDamageA(!notApplicableDamageA);
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 8,
                        }}>
                        Not Applicable{' '}
                      </Text>
                    </View>
                  </View>
                  {notApplicableDamageA ? (
                    <>
                      <View
                        style={{
                          width: '80%',
                          marginLeft: 50,
                          flexDirection: 'row',
                          marginBottom: 10,
                        }}>
                        <Text
                          style={{
                            marginLeft: 10,
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 11,
                            color: '#000',
                          }}>
                          Damage
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '80%',
                          marginLeft: 50,
                          flexDirection: 'row',
                        }}>
                        <View style={{width: '15%'}}>
                          <RadioButton
                            selected={checkDamageA === 'Yes'}
                            onSelect={() => setCheckeDamageA('Yes')}
                            label={'Yes'}
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          width: '80%',
                          marginLeft: 50,
                          flexDirection: 'row',
                        }}>
                        <View style={{width: '15%'}}>
                          <RadioButton
                            selected={checkDamageA === 'No'}
                            onSelect={() => setCheckeDamageA('No')}
                            label={'No'}
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}
                </View>
              </Card>

              <Card
                style={{
                  marginTop: 20,
                  backgroundColor: '#fff',
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      marginTop: 10,
                      fontFamily: 'Inter-Bold',
                      color: '#3498DB',
                    }}>
                    Section B
                  </Text>
                  <View
                    style={{
                      width: '95%',
                      height: 1,
                      backgroundColor: 'gray',
                      marginTop: 5,
                    }}></View>

                  <View style={{width: '90%', marginTop: 10}}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 11,
                        textAlign: 'center',
                        color: '#000000',
                        marginTop: 5,
                      }}>
                      {' '}
                      Airfreight perishable verified as without secure packaging
                      must be immediately secured with one or more of the
                      following secure packaging options.
                    </Text>
                  </View>

                  <View
                    style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
                    <View style={{width: '15%', marginTop: 10}}>
                      <CheckBox
                        checked={polytheneLinerB}
                        onChange={() => {
                          setPolytheneLinerB(!polytheneLinerB);
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 5,
                        }}>
                        Placed in an enclosed container: i.e. AMP, AAP, AMF,
                        AAF, ALF, AKE, AKH
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
                    <View style={{width: '15%', marginTop: 10}}>
                      <CheckBox
                        checked={VentilationholesofcartonscoveredB}
                        onChange={() => {
                          setVentilationholesofcartonscoveredB(
                            !VentilationholesofcartonscoveredB,
                          );
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 5,
                        }}>
                        Ventilation holes of cartons covered: Ventilation holes
                        must be covered/sealed with mesh/screen of no more than
                        1.6mm diameter pore size and not less than 0.16mm strand
                        thickness. Alternatively, ventilation holes may be taped
                        over.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
                    <View style={{width: '15%', marginTop: 10}}>
                      <CheckBox
                        checked={meshorPlasticB}
                        onChange={() => {
                          setMeshorPlasticB(!meshorPlasticB);
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 5,
                        }}>
                        Mesh or Plastic (Shrink) wrapped pallets or ULD’s: ULD’s
                        transporting cartons with ventilation holes/gaps, or
                        palletized cartons with ventilation holes/gaps must be
                        fully covered or wrapped with polythene/plastic/foil
                        sheet or mesh/screen of no more than 1.6mm diameter pore
                        size and not less than 0.16mm strand thickness.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
                    <View style={{width: '15%', marginTop: 10}}>
                      <CheckBox
                        checked={notApplicableDamageB}
                        onChange={() => {
                          setNotApplicableeDamageB(!notApplicableDamageB);
                        }}
                      />
                    </View>
                    <View style={{width: '85%'}}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#000000',
                          fontFamily: 'Inter-Medium',
                          marginTop: 8,
                        }}>
                        Not Applicable{' '}
                      </Text>
                    </View>
                  </View>
                  {notApplicableDamageB ? (
                    <>
                      <View
                        style={{
                          width: '80%',
                          marginLeft: 50,
                          flexDirection: 'row',
                          marginBottom: 10,
                        }}>
                        <Text
                          style={{
                            marginLeft: 10,
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 11,
                            color: '#000',
                          }}>
                          Damage
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '80%',
                          marginLeft: 50,
                          flexDirection: 'row',
                        }}>
                        <View style={{width: '15%'}}>
                          <RadioButton
                            selected={checkDamageB === 'Yes'}
                            onSelect={() => setCheckeDamageB('Yes')}
                            label={'Yes'}
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          width: '80%',
                          marginLeft: 50,
                          flexDirection: 'row',
                        }}>
                        <View style={{width: '15%'}}>
                          <RadioButton
                            selected={checkDamageB === 'No'}
                            onSelect={() => setCheckeDamageB('No')}
                            label={'No'}
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}
                </View>
              </Card>
            </ScrollView>
            {data?.currentStatus === 'Arrival on Pickup' && (
              <View
                style={{
                  width: '90%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  marginBottom: insets.bottom + 50,
                }}>
                <View
                  style={{
                    height: 40,
                    backgroundColor: '#27AE60',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                  }}>
                  <TouchableOpacity
                    style={{width: '100%'}}
                    onPress={() => handleUpdateJobStatus('Picked Up')}>
                    <View
                      style={{
                        height: 40,
                        backgroundColor: '#27AE60',
                        width: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                      }}>
                      {isLoading ? (
                        <ActivityIndicator size={'small'} color={'#FFF'} />
                      ) : (
                        <Text
                          style={{fontFamily: 'Inter-Medium', color: '#fff'}}>
                          Picked Up
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {/* {isLoading === true ? (
              <View
                style={{
                  width: '90%',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                <ActivityIndicator size={'small'} color={'#000'} />
              </View>
             ) : (
              <>
                {data.currentStatus === 'Arrival on Pickup' ? (
                  <View
                    style={{
                      width: '90%',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 10,
                      marginBottom: 10,
                    }}>
                    <View
                      style={{
                        height: 40,
                        backgroundColor: '#27AE60',
                        width: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 10,
                      }}>
                      <TouchableOpacity
                        style={{width: '100%'}}
                        onPress={() => handleUpdateJobStatus('Picked Up')}>
                        <View
                          style={{
                            height: 40,
                            backgroundColor: '#27AE60',
                            width: '100%',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 10,
                          }}>
                          <Text
                            style={{fontFamily: 'Inter-Medium', color: '#fff'}}>
                            Picked Up
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </>
            )} */}
          </>
        )}
      </View>
    </View>
  );
}
