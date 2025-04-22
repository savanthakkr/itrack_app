/* eslint-disable no-sequences */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
import React, {createContext, useState, useEffect} from 'react';
import {Alert, Keyboard} from 'react-native';
import axios from 'axios';
import {BASE_URL} from '../../../config';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import messaging from '@react-native-firebase/messaging';
import SplashScreen from '../SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [loginType, setLoginType] = useState('');

  const [check, setCheck] = useState('');

  const [loginError, setLoginError] = useState(false);
  const [logintypeError, setLoginTypeError] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const [emptyError, setEmptyError] = useState(false);
  const [breakIf, setBreakIf] = useState(true);
  const [splashLoading, setSplashLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDevieToken] = useState('');

  // useEffect(() => {
  //   getDeviceToken();
  // });

  // const getDeviceToken = async () => {
  //   let token = await messaging().getToken();
  //   setDevieToken(token);
  // };

  // const [collectionLogin, { data: userData, loading: userLoginLoading }] = useMutation(MUTATION_COLLECTION_STAFF_BOY_LOGIN, {
  //     onError(error) {
  //         console.log(error);
  //         setLoginError(true);
  //     }
  // })

  // const loginHandel = async (username, password) => {
  //     setBreakIf(true)
  //     Keyboard.dismiss();
  //     if (username === "" || password === "") {
  //         showMessage({
  //             message: "Input Box is empty!!!",
  //             type: "danger",
  //         });
  //     } else {
  //         collectionLogin({
  //             variables: {
  //                 "userName": `${username}`,
  //                 "password": `${password}`,
  //             },
  //         });
  //     }
  // };

  // if (userData && breakIf) {
  //     AsyncStorage.setItem('userId', userData.collectionLogin.collectionId);
  //     AsyncStorage.setItem('userToken', userData.collectionLogin.collectionToken);
  //     setUserInfo(userData.collectionLogin.collectionToken);
  //     setBreakIf(false);
  // }

  // const isLoggedIn = async () => {
  //     try {
  //         setSplashLoading(true);
  //         let userInfo = await AsyncStorage.getItem('userToken');

  //         if (userInfo) {
  //             setUserInfo(userInfo);
  //         }
  //         setSplashLoading(false);
  //     } catch (e) {
  //         setSplashLoading(false);
  //     }
  // }

  // useEffect(() => {
  //     isLoggedIn();
  // }, []);

  const deleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const driverId = await AsyncStorage.getItem('driverId');
      const response = await fetch(`${BASE_URL}driver/profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ID: `${driverId}`,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Account deleted successfully');
        await setUserInfo('');
        await AsyncStorage.removeItem('LoginType');
        await AsyncStorage.removeItem('driverId');
        await AsyncStorage.removeItem('driverToken');
      } else {
        console.error('Failed to delete account:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loginHandel = async (username, password) => {
    if (loginType === '') {
      setLoginTypeError(true);
    } else {
      setBreakIf(true);
      setLoading(true);

      if (loginType === 'Admin') {
        console.log("kjdskjsajs");
        try {
          const response = await axios.post(`${BASE_URL}admin/login`, {
            username: `${username}`,
            password: `${password}`,
          });
          AsyncStorage.setItem('adminToken', response.data.token);
          AsyncStorage.setItem('LoginType', 'Admin');
          setUserInfo(response.data.token);
          setBreakIf(false);
        } catch (error) {
          // console.log(
          //   'Login failed',
          //   error.response?.data || 'An error occurred',
          // );
          setEmptyError(true);
        } finally {
          setLoading(false);
        }
      } else {
        try {

          console.log("kjdskjsajs");
            
          const response = await fetch(`${BASE_URL}driver/login`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: `${username}`,
              password: `${password}`,
              // deviceToken: `${deviceToken}`,
            }),
          });
          const data = await response.json();
          // console.log('data',data.data.data.clientId)
          console.log(response);
          
          AsyncStorage.setItem('driverToken', data.data.token);
          AsyncStorage.setItem('driverId', data.data.data._id);
          AsyncStorage.setItem('LoginType', 'Driver');
          setUserInfo(data.data.token);
          setBreakIf(false);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const isLoggedIn = async () => {
    try {
      setSplashLoading(true);
      let adminInfo = await AsyncStorage.getItem('adminToken');
      let driverInfo = await AsyncStorage.getItem('driverToken');
      let loginType = await AsyncStorage.getItem('LoginType');
      if (adminInfo) {
        setUserInfo(adminInfo);
      } else if (driverInfo) setUserInfo(driverInfo);
      if (loginType) {
        setLoginType(loginType);
      }

      setSplashLoading(false);
    } catch (e) {
      setSplashLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  const logOutAdmin = async () => {
    await setUserInfo('');
    await AsyncStorage.removeItem('LoginType');
    await AsyncStorage.removeItem('adminToken');
  };

  const logOutDriver = async () => {
    await setUserInfo('');
    await AsyncStorage.removeItem('LoginType');
    await AsyncStorage.removeItem('driverId');
    await AsyncStorage.removeItem('driverToken');
  };

  return (
    <AuthContext.Provider
      value={{
        loginType,
        setLoginType,
        loginHandel,
        userInfo,
        loading,
        emptyError,
        deleteAccount,
        logOutDriver,
        logOutAdmin,
        logintypeError,
        splashLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
