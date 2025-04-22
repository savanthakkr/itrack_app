import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import logo from '../../../assets/logo/logo.png';
import Feather from 'react-native-vector-icons/Feather';
import {BASE_URL, SETTING_VERSION} from '../../../config';
import {TouchableOpacity} from 'react-native';
import axios from 'axios';

import {AuthContext} from '../Context/AuthContext';

export default function Login({navigation}) {
  const {
    loginType,
    setLoginType,
    loginHandel,
    loading,
    emptyError,
    logintypeError,
  } = useContext(AuthContext);

  const [hide, setHide] = useState(true);
  const [hover, setHover] = useState();
  const [registerButton, setRegister] = useState('');
  const [loginTypeDropdown, setLogintype] = useState('');
  const [secure, setSecure] = useState(true);
  const [activeInput, setActiveInput] = useState();
  const [keyboardStatus, setKeyboardStatus] = useState('');

  console.log('keyboardStatus', keyboardStatus);
  useEffect(() => {
    getStatus();
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus('Keyboard Shown');
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus('Keyboard Hidden');
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const getStatus = async () => {
    try {
      setRegister('false');
      setLogintype('false');
      const response = await axios.get(`${BASE_URL}driver/status`, {
        headers: {
          os: Platform.OS,
          v: SETTING_VERSION,
        },
      });
      console.log('response.data.data.status::', response.data.data);

      if (response.data.data.status == false) {
        setRegister(response.data.data.settings.signup);
        setLogintype(response.data.data.settings.loginType);
      }
      if (response.data.data.status == true) {
        setRegister(response.data.data.settings.signup);
        setLogintype(response.data.data.settings.loginType);
        if (Platform.OS === 'ios' && response.data.data.settings.loginType == false){
          setLoginType('Driver');
        }
      }
      if (response.data.success) {
        console.log('Fetched status:', response.data.data.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const [dropDown, setDropDown] = useState(false);

  const handleClick = () => {
    if (loginType === 'Driver') {
      navigation.navigate('Home');
    } else if (loginType === 'Admin') {
      navigation.navigate('AdminHome');
    } else {
      navigation.navigate('Home');
    }
  };

  const handleClickSignup = () => {
    navigation.navigate('Login');
  };

  const [username, setUsername] = useState('');
  const [password, setPasswrod] = useState('');

  console.log('username 1', username);

  return (
    <>
      <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={{maxHeight: '100%'}}>
          <View
            style={{
              height: 250,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}>
            <Image source={logo} style={{width: 290, height: 180}} />
          </View>

          <View
            style={{
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: '85%',
                height: 50,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: hover === 1 ? '#0F3B60' : '#E9EAF0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setHover(1)}>
                <View
                  style={{
                    width: '100%',
                    height: 50,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{width: '95%', height: 50, flexDirection: 'row'}}>
                    <View
                      style={{
                        width: '10%',
                        height: 50,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Feather name="user" size={20} color={'#726E6E'} />
                    </View>
                    <View
                      style={{
                        width: '90%',
                        height: 50,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignContent: 'center',
                      }}>
                      <TextInput
                        placeholder="Username"
                        onChangeText={e => setUsername(e)}
                        style={{fontFamily: 'Inter-Medium', color: '#000'}}
                        placeholderTextColor="#726E6E"
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: '85%',
                height: 50,
                borderRadius: 10,
                marginTop: 20,
                borderWidth: 1,
                borderColor: hover === 2 ? '#0F3B60' : '#E9EAF0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity onPress={() => setHover(2)}>
                <View
                  style={{
                    width: '100%',
                    height: 50,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{width: '95%', height: 50, flexDirection: 'row'}}>
                    <View
                      style={{
                        width: '10%',
                        height: 50,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Feather name="lock" size={20} color={'#726E6E'} />
                    </View>
                    <View
                      style={{
                        width: '80%',
                        height: 50,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignContent: 'center',
                      }}>
                      <TextInput
                        placeholder="Password"
                        secureTextEntry={hide}
                        onChangeText={e => setPasswrod(e)}
                        style={{fontFamily: 'Inter-Medium', color: '#000'}}
                        placeholderTextColor="#726E6E"
                      />
                    </View>
                    <View
                      style={{
                        width: '10%',
                        height: 50,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {hide === true ? (
                        <TouchableOpacity onPress={() => setHide(false)}>
                          <Feather name="eye" size={20} color={'#0F3B60'} />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => setHide(true)}>
                          <Feather name="eye-off" size={20} color={'#0F3B60'} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            {loginTypeDropdown ? (
              <View
                style={{
                  width: '85%',
                  height: dropDown === true ? 154 : 50,
                  borderRadius: 10,
                  marginTop: 20,
                  borderWidth: 1,
                  borderColor: hover === 3 ? '#0F3B60' : '#E9EAF0',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setHover(3), setDropDown(true);
                  }}>
                  <View
                    style={{
                      width: '100%',
                      height: 50,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{width: '95%', height: 50, flexDirection: 'row'}}>
                      <View
                        style={{
                          width: '10%',
                          height: 50,
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Feather
                          name="users"
                          size={20}
                          color={'#726E6E'}
                          style={{marginLeft: 10}}
                        />
                      </View>
                      <View
                        style={{
                          width: '80%',
                          height: 50,
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignContent: 'center',
                        }}>
                        {loginType === '' ? (
                          <Text
                            style={{
                              color: '#726E6E',
                              fontFamily: 'Inter-Medium',
                              marginLeft: 10,
                            }}>
                            Choose Login Type
                          </Text>
                        ) : (
                          <Text
                            style={{
                              color: '#726E6E',
                              fontFamily: 'Inter-Medium',
                              marginLeft: 10,
                            }}>
                            {loginType}
                          </Text>
                        )}
                      </View>
                      <View
                        style={{
                          width: '10%',
                          height: 50,
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {dropDown === true ? (
                          <TouchableOpacity onPress={() => setDropDown(false)}>
                            <Feather
                              name="chevron-up"
                              size={20}
                              color={'#0F3B60'}
                            />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity onPress={() => setDropDown(true)}>
                            <Feather
                              name="chevron-down"
                              size={20}
                              color={'#0F3B60'}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {dropDown === true ? (
                  <>
                    <View
                      style={{
                        width: '100%',
                        height: 50,
                        backgroundColor:
                          loginType === 'Driver' ? '#0F3B60' : 'transparent',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity
                        style={{width: '100%', height: '100%'}}
                        onPress={() => {
                          setLoginType('Driver'), setDropDown(false);
                        }}>
                        <View
                          style={{
                            width: '100%',
                            height: 50,
                            flexDirection: 'column',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              color:
                                loginType === 'Driver' ? '#fff' : '#726E6E',
                              marginLeft: 15,
                              fontSize: 14,
                              fontFamily: 'Inter-SemiBold',
                            }}>
                            Driver
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    <View
                      style={{
                        width: '100%',
                        height: 50,
                        backgroundColor:
                          loginType === 'Admin' ? '#0F3B60' : 'transparent',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}>
                      <TouchableOpacity
                        style={{width: '100%', height: '100%'}}
                        onPress={() => {
                          setLoginType('Admin'), setDropDown(false);
                        }}>
                        <View
                          style={{
                            width: '100%',
                            height: 50,
                            flexDirection: 'column',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              color: loginType === 'Admin' ? '#fff' : '#726E6E',
                              marginLeft: 15,
                              fontSize: 14,
                              fontFamily: 'Inter-SemiBold',
                            }}>
                            Admin
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <></>
                )}
              </View>
            ) : (
              <View></View>
            )}

            <View
              style={{
                width: '85%',
                height: 50,
                borderRadius: 10,
                marginTop: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0F3B60',
              }}>
              {loading ? (
                <ActivityIndicator size={'small'} color={'#fff'} />
              ) : (
                <TouchableOpacity
                  onPress={() => loginHandel(username, password)}
                  style={{
                    width: '100%',
                    height: '100%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 16,
                      }}>
                      Login
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            {registerButton ? (
              <View
                style={{
                  width: '85%',
                  height: 50,
                  borderRadius: 10,
                  marginTop: 10,
                }}>
                {loading ? (
                  <ActivityIndicator size={'small'} color={'#fff'} />
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SignUp')}>
                    <View
                      style={{alignItems: 'center', justifyContent: 'center'}}>
                      <Text
                        style={{
                          color: '#0F3B60',
                          fontFamily: 'Inter-SemiBold',
                          fontSize: 16,
                        }}>
                        Sign Up
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <></>
            )}
          </View>
          {logintypeError ? (
            <View
              style={{
                width: '100%',
                height: 50,
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 20,
              }}>
              <Text style={{color: 'red', fontFamily: 'Inter-Medium'}}>
                Select Login Type
              </Text>
            </View>
          ) : (
            <></>
          )}
          {emptyError ? (
            <View
              style={{
                width: '100%',
                height: 50,
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 20,
              }}>
              <Text style={{color: 'red', fontFamily: 'Inter-Medium'}}>
                Login Failed !!
              </Text>
            </View>
          ) : (
            <></>
          )}
        </View>
      </ScrollView>
      {keyboardStatus === 'Keyboard Hidden' ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            height: 80,
            width: '100%',
            backgroundColor: '#fff',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#000000',
              fontFamily: 'Inter-Medium',
              fontSize: 12,
            }}>
            Version 1.0.0
          </Text>
          <Text
            style={{
              color: '#000000',
              fontFamily: 'Inter-Medium',
              fontSize: 12,
              marginTop: 3,
            }}>
            Terms & Conditions
          </Text>
        </View>
      ) : (
        <></>
      )}
    </>
  );
}
