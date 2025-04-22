import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import logo from '../../../assets/logo/logo.png';
import Feather from 'react-native-vector-icons/Feather';
import {TouchableOpacity} from 'react-native';
import {BASE_URL, SETTING_VERSION} from '../../../config';
import {AuthContext} from '../Context/AuthContext';
import axios from 'axios';

export default function SignUp({navigation}) {
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
  const [keyboardStatus, setKeyboardStatus] = useState('');

  useEffect(() => {
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

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPasswrod] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSignUpPress = () => {
    if (!firstName) {
      Alert.alert('Please enter your first name');
      return;
    }
    if (!lastName) {
      Alert.alert('Please enter your last name');
      return;
    }
    if (!username) {
      Alert.alert('Please enter User name');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Please enter valid mobile number');
      return;
    }
    if (!email || !emailRegex.test(email)) {
      Alert.alert('Please enter valid email address');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Length of the password should be atleast 6');
      return;
    }
    let data = JSON.stringify({
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone: phoneNumber,
      username: username,
      password: password,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${BASE_URL}driver/signup`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    axios
      .request(config)
      .then(response => {
        console.log('RESPONSE:::::', JSON.stringify(response.data));
        if (response?.data?.status) {
          navigation.navigate('Login');
        } else {
          Alert.alert('Username, email, or phone already exists!');
        }
      })
      .catch(error => {
        console.log('ERORR@@:::', error);
      });
  };

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
              gap: 20,
            }}>
            <View
              style={{
                width: '85%',
                height: 50,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: hover == 1 ? '#0F3B60' : '#E9EAF0',
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
                        placeholder="First Name"
                        onChangeText={e => setFirstName(e)}
                        style={{fontFamily: 'Inter-Medium', color: '#000'}}
                        placeholderTextColor="#726E6E"
                        value={firstName}
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
                borderWidth: 1,
                borderColor: hover == 1 ? '#0F3B60' : '#E9EAF0',
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
                        placeholder="Last Name"
                        onChangeText={e => setLastName(e)}
                        style={{fontFamily: 'Inter-Medium', color: '#000'}}
                        placeholderTextColor="#726E6E"
                        value={lastName}
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
                      <Feather name="phone" size={20} color={'#726E6E'} />
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
                        placeholder="Mobile number"
                        onChangeText={e => setPhoneNumber(e)}
                        style={{fontFamily: 'Inter-Medium', color: '#000'}}
                        placeholderTextColor="#726E6E"
                        keyboardType="numeric"
                        maxLength={15}
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
                      <Feather name="mail" size={20} color={'#726E6E'} />
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
                        placeholder="Email"
                        onChangeText={e => setEmail(e)}
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
                  onPress={onSignUpPress}
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
                      Sign Up
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text
                  style={{
                    color: '#0F3B60',
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 16,
                  }}>
                  Login
                </Text>
              </View>
            </TouchableOpacity>

            <View
              style={{
                height: 60,
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
          </View>
        </View>
      </ScrollView>
    </>
  );
}
