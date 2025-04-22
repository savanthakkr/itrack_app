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
import {Card, Checkbox, RadioButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../config';
import {Item} from 'react-native-paper/lib/typescript/components/Drawer/Drawer';

export default function AdminVpap({navigation, route}) {
  const {id, jobId, vpapId} = route.params;

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

  useEffect(() => {
    const handleData = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken');
        const response = await fetch(`${BASE_URL}admin/job/VPAP?id=${jobId}`, {
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
  }, [id]);

  return (
    <>
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
                marginTop: 100,
              }}>
              <Text style={{color: '#000'}}>Loading</Text>
              <ActivityIndicator color={'#000'} size="small" />
            </View>
          ) : vpapId === null ? (
            <Text>sdfdf</Text>
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
                      Job Id: {jobId}
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
                        verified for compliance with one or more of the
                        following secure packaging options.
                      </Text>
                    </View>

                    {vpapId.sections[0].options.map(item => {
                      return (
                        <View
                          style={{
                            width: '90%',
                            marginTop: 10,
                            flexDirection: 'row',
                          }}>
                          <View style={{width: '15%'}}>
                            <Checkbox
                              status={item.checked ? 'checked' : 'unchecked'}
                            />
                          </View>
                          <View style={{width: '85%'}}>
                            <Text
                              style={{
                                fontSize: 12,
                                color: '#000000',
                                fontFamily: 'Inter-Medium',
                                fontSize: 11,
                                marginTop: 5,
                              }}>
                              {item.label}
                            </Text>
                          </View>
                        </View>
                      );
                    })}

                    <View
                      style={{
                        width: '80%',
                        marginLeft: 50,
                        flexDirection: 'row',
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
                          status={
                            vpapId.sections[0].damage.yes === true
                              ? 'checked'
                              : 'unchecked'
                          }
                        />
                      </View>
                      <View style={{width: '85%'}}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#000000',
                            fontFamily: 'Inter-Medium',
                            fontSize: 11,
                            marginTop: 8,
                          }}>
                          Yes{' '}
                        </Text>
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
                          status={
                            vpapId.sections[0].damage.no === true
                              ? 'checked'
                              : 'unchecked'
                          }
                        />
                      </View>
                      <View style={{width: '85%'}}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#000000',
                            fontFamily: 'Inter-Medium',
                            fontSize: 11,
                            marginTop: 8,
                          }}>
                          No{' '}
                        </Text>
                      </View>
                    </View>

                    {/* <View style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <Checkbox
                  status={vpapId.sections[0].options[1].checked ? 'checked' : 'unchecked'}
                
                />
              </View>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Inter-Medium',
                    fontSize: 11,
                    marginTop: 5,
                  }}>
                  Ventilation holes of cartons covered: Ventilation holes must
                  be covered/sealed with mesh/screen of no more than 1.6mm
                  diameter pore size and not less than 0.16mm strand thickness.
                  Alternatively, ventilation holes may be taped over.
                </Text>
              </View>
            </View>

            <View style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <Checkbox
                  status={vpapId.sections[0].options[2].checked ? 'checked' : 'unchecked'}
                
                />
              </View>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Inter-Medium',
                    fontSize: 11,
                    marginTop: 5,
                  }}>
                  Polythene Liner: Vented carton with polythene liners/bags must
                  be sealed. Overlapping folder edges of polythene liner is
                  considered sealed.
                </Text>
              </View>
            </View>

            <View style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <Checkbox
                  status={vpapId.sections[0].options[3].checked  ? 'checked' : 'unchecked'}
                  onPress={() => {
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
                    fontSize: 11,
                    marginTop: 5,
                  }}>
                  Mesh or Plastic (Shrink) wrapped pallets or ULD’s: ULD’s
                  transporting cartons with ventilation holes/gaps, or
                  palletized cartons with ventilation holes/gaps must be fully
                  covered or wrapped with polythene/plastic/foil sheet or
                  mesh/screen of no more that 1.6mm diameter pore size and not
                  less than 0.16mm strand thickness.
                </Text>
              </View>
            </View>

            <View style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <Checkbox
                  status={vpapId.sections[0].options[4].checked? 'checked' : 'unchecked'}
                 
                />
              </View>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Inter-Medium',
                    fontSize: 11,
                    marginTop: 5,
                  }}>
                  Carton packed in ab enclosed container: C, AAP, AMF, AAF, ALF,
                  AKE, AKH{' '}
                </Text>
              </View>
            </View>

            <View style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <Checkbox
                  status={vpapId.sections[0].options[5].checked ? 'checked' : 'unchecked'}
                 
                />
              </View>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Inter-Medium',
                    fontSize: 11,
                    marginTop: 8,
                  }}>
                  Not Applicable{' '}
                </Text>
              </View>
            </View>
             {
                notApplicableDamageA ?
                <>
                <View style={{width: '80%', marginLeft: 50, flexDirection: 'row'}}>
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
                <View style={{width: '80%', marginLeft: 50, flexDirection: 'row'}}>
                <View style={{width: '15%'}}>
                  <RadioButton
                    status={vpapId.sections[0].damage.yes === true ? 'checked' : 'unchecked'}
                 
                  />
                </View>
                <View style={{width: '85%'}}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#000000',
                      fontFamily: 'Inter-Medium',
                      fontSize: 11,
                      marginTop: 8,
                    }}>
                    Yes{' '}
                  </Text>
                </View>
              </View>
              <View style={{width: '80%', marginLeft: 50, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <RadioButton
                  status={vpapId.sections[0].damage.no === true ? 'checked' : 'unchecked'}
               
                />
              </View>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Inter-Medium',
                    fontSize: 11,
                    marginTop: 8,
                  }}>
                  No{' '}
                </Text>
              </View>
            </View>
            </>
                :
                <></>
                  

             }

           

           */}
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
                        Airfreight perishable verified as without secure
                        packaging must be immediately secured with one or more
                        of the following secure packaging options.
                      </Text>
                    </View>

                    {vpapId.sections[1].options.map(Item => {
                      return (
                        <View
                          style={{
                            width: '90%',
                            marginTop: 10,
                            flexDirection: 'row',
                          }}>
                          <View style={{width: '15%'}}>
                            <Checkbox
                              status={Item.checked ? 'checked' : 'unchecked'}
                            />
                          </View>
                          <View style={{width: '85%'}}>
                            <Text
                              style={{
                                fontSize: 12,
                                color: '#000000',
                                fontFamily: 'Inter-Medium',
                                fontSize: 11,
                                marginTop: 5,
                              }}>
                              {Item.label}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                    <View
                      style={{
                        width: '80%',
                        marginLeft: 50,
                        flexDirection: 'row',
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
                          status={
                            vpapId.sections[1].damage.yes === true
                              ? 'checked'
                              : 'unchecked'
                          }
                        />
                      </View>
                      <View style={{width: '85%'}}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#000000',
                            fontFamily: 'Inter-Medium',
                            fontSize: 11,
                            marginTop: 8,
                          }}>
                          Yes{' '}
                        </Text>
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
                          status={
                            vpapId.sections[1].damage.no === true
                              ? 'checked'
                              : 'unchecked'
                          }
                        />
                      </View>
                      <View style={{width: '85%'}}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#000000',
                            fontFamily: 'Inter-Medium',
                            fontSize: 11,
                            marginTop: 8,
                          }}>
                          No{' '}
                        </Text>
                      </View>
                    </View>

                    {/* <View style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <Checkbox
                  status={vpapId.sections[1].options[1].checked ? 'checked' : 'unchecked'}
                 
                />
              </View>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Inter-Medium',
                    fontSize: 11,
                    marginTop: 5,
                  }}>
                  Ventilation holes of cartons covered: Ventilation holes must
                  be covered/sealed with mesh/screen of no more than 1.6mm
                  diameter pore size and not less than 0.16mm strand thickness.
                  Alternatively, ventilation holes may be taped over.
                </Text>
              </View>
            </View> */}

                    {/* <View style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <Checkbox
                  status={vpapId.sections[1].options[2].checked ? 'checked' : 'unchecked'}
                  onPress={() => {
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
                    fontSize: 11,
                    marginTop: 5,
                  }}>
                  Mesh or Plastic (Shrink) wrapped pallets or ULD’s: ULD’s
                  transporting cartons with ventilation holes/gaps, or
                  palletized cartons with ventilation holes/gaps must be fully
                  covered or wrapped with polythene/plastic/foil sheet or
                  mesh/screen of no more than 1.6mm diameter pore size and not
                  less than 0.16mm strand thickness.
                </Text>
              </View>
            </View>
           */}
                    {/* <View style={{width: '90%', marginTop: 10, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <Checkbox
                  status={vpapId.sections[1].options[3].checked ? 'checked' : 'unchecked'}
                 
                />
              </View>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Inter-Medium',
                    fontSize: 11,
                    marginTop: 8,
                  }}>
                  Not Applicable{' '}
                </Text>
              </View>
            </View>
            {
                    notApplicableDamageB ?
                    <>
                    <View style={{width: '80%', marginLeft: 50, flexDirection: 'row'}}>
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
               <View style={{width: '80%', marginLeft: 50, flexDirection: 'row'}}>
               <View style={{width: '15%'}}>
                 <RadioButton
                   status={vpapId.sections[1].damage.yes === true ? 'checked' : 'unchecked'}
                 
                 />
               </View>
               <View style={{width: '85%'}}>
                 <Text
                   style={{
                     fontSize: 12,
                     color: '#000000',
                     fontFamily: 'Inter-Medium',
                     fontSize: 11,
                     marginTop: 8,
                   }}>
                   Yes{' '}
                 </Text>
               </View>
             </View>
              <View style={{width: '80%', marginLeft: 50, flexDirection: 'row'}}>
              <View style={{width: '15%'}}>
                <RadioButton
                  status={vpapId.sections[1].damage.no === true  ? 'checked' : 'unchecked'}
                
                />
              </View>
              <View style={{width: '85%'}}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#000000',
                    fontFamily: 'Inter-Medium',
                    fontSize: 11,
                    marginTop: 8,
                  }}>
                  No{' '}
                </Text>
              </View>
            </View>
            </>
                    :
                    <></>

            }
                 
          */}
                  </View>
                </Card>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </>
  );
}
