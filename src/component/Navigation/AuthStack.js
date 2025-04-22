import {View, Text} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../AuthScreen/Login';
import Home from '../Home';
import JobDetail from '../JobDetail';
import VPAP from '../VPAP';
import Signature from '../Signature';
import AdminHome from '../Admin/AdminHome';
import AdminJobDetail from '../Admin/AdminJobDetail';
import Map from '../Map';
import {AuthContext} from '../Context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminVpap from '../Admin/AdminVpap';
import SplashScreen from '../SplashScreen';
import CameraViewImage from '../CameraViewImage';
import SignUp from '../AuthScreen/SignUp';
import CustomPDFViewer from '../PdfViewer';

const Stack = createStackNavigator();
export default function AuthStack() {
  const {userInfo, loginType, splashLoading} = useContext(AuthContext);

  const [getType, setGetType] = useState();

  AsyncStorage.getItem('LoginType').then(type => setGetType(type));

  console.log(getType);
  console.log('loginType');

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}>
        {splashLoading ? (
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
        ) : userInfo ? (
          <>
            {loginType === 'Admin' ? (
              <>
                <Stack.Screen name="AdminHome" component={AdminHome} />
                <Stack.Screen
                  name="AdminJobDetail"
                  component={AdminJobDetail}
                />
                <Stack.Screen name="AdminVpap" component={AdminVpap} />
              </>
            ) : (
              <>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="JobDetail" component={JobDetail} />
                <Stack.Screen
                  name="CameraViewImage"
                  component={CameraViewImage}
                />
              </>
            )}

            <Stack.Screen name="VPAP" component={VPAP} />
            <Stack.Screen name="Signature" component={Signature} />
            <Stack.Screen name="Map" component={Map} />
            <Stack.Screen name="PDFViewer" component={CustomPDFViewer} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
