import {View, Text, Image, ActivityIndicator} from 'react-native';
import React from 'react';
import logo from '../../assets/logo/logo.png';

export default function SplashScreen() {
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
      }}>
      <Image source={logo} style={{width: 290, height: 180}} />
      <ActivityIndicator
        color={'#000'}
        size={'small'}
        style={{marginTop: 20}}
      />
    </View>
  );
}
