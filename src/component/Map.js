import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  SafeAreaView,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../config';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import MapViewDirections from 'react-native-maps-directions';
import {locationPermission, getCurrentLocation} from './HelpFunction';
import pickUp from '../../assets/Icon/1.png';
import dropUp from '../../assets/Icon/4.png';
import Driver from '../../assets/Img/driver1.png';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const GOOGLE_MAPS_APIKEY = 'AIzaSyB2hzpy55dNKYbAmb4f7eFi-mAzk0v6Szo';
export default function Map({navigation, route}) {
  const {
    pickUplatitude,
    pickUplongitude,
    dropUplatitude,
    dropUplongitude,
    jobid,
  } = route.params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const markerRef = useRef();
  const mapRef = useRef();
  const driverRef = useRef();

  const [location, setLocation] = useState(false);
  const [pickUpLatitude, setPickUpLatitude] = useState(
    parseFloat(pickUplatitude),
  );
  const [pickUpLongitude, setPickUpLongitude] = useState(
    parseFloat(pickUplongitude),
  );
  const [dropUpLatitude, setDropUpLatitude] = useState(
    parseFloat(dropUplatitude),
  );
  const [dropUpLongitude, setDropUpLongitude] = useState(
    parseFloat(dropUplongitude),
  );

  const [state, setState] = useState({
    curLocs: {
      latitude: pickUpLatitude,
      longitude: pickUpLongitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    destinationCords: {
      latitude: dropUpLatitude,
      longitude: dropUpLongitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    coordinater: new AnimatedRegion({
      latitude: -37.840935,
      longitude: 144.946457,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }),
    heading: 0,
  });

  const [ambulanceLatLng, setAmbulanceLatLng] = useState({
    latitude: -37.840935,
    longitude: 144.946457,
  });

  const {curLocs, destinationCords, heading, coordinater} = state;

  const animate = (latitude, longitude) => {
    const newCoordinate = {latitude, longitude};
    if (Platform.OS == 'android') {
      if (markerRef.current) {
        markerRef.current.animateMarkerToCoordinate(newCoordinate, 1000);
      }
    } else {
      coordinater.timing(newCoordinate).start();
    }
  };

  const [currentLocation, setCurrentLocation] = useState({
    latitude: -37.840935,
    longitude: 144.946457,
    heading: 90,
  });
  const [header, setHeader] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude, heading} = position.coords;
          setCurrentLocation({latitude, longitude, heading});
        },
        error => {
          console.error(error);
        },
      );
    }, 3000); // 5000 ms = 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const [pickState, setPickState] = useState(false);
  const [dropState, setDropState] = useState(false);

  const openMapPickup = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pickUpLatitude},${pickUplongitude}&travelmode=driving`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert("Can't handle URL: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  const openMapDrop = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dropUpLatitude},${dropUpLongitude}&travelmode=driving`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert("Can't handle URL: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  const insets = useSafeAreaInsets();

  return (
    <View
      style={{height: '100%', flexDirection: 'column', alignItems: 'center'}}>
      <View
        style={{
          width: '100%',
          height: 50,
          position: 'absolute',
          top: insets.top + 110,
          zIndex: 2,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            color: '#0F3B60',
            marginRight: 3,
            backgroundColor: '#fff',
            padding: 5,
            borderRadius: 3,
          }}>
          Start Navigation{' '}
        </Text>
        <Feather
          name="arrow-right"
          color="#0F3B60"
          style={{marginTop: 5, marginRight: 6}}
          size={20}
        />
        <TouchableOpacity
          onPress={() => openMapPickup()}
          style={{
            width: 50,
            height: 50,
            backgroundColor: '#fff',
            marginRight: 10,
            borderRadius: 10,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image source={pickUp} style={{width: 30, height: 30}} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openMapDrop()}
          style={{
            width: 50,
            height: 50,
            backgroundColor: '#fff',
            marginRight: 10,
            borderRadius: 10,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image source={dropUp} style={{width: 20, height: 30}} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          width: '100%',
          backgroundColor: '#0F3B60',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 20,
        }}>
        <SafeAreaView />
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
              Job Id: {jobid}
            </Text>
          </View>
          <View style={{width: '25%', height: 50}}></View>
        </View>
        <View
          style={{
            width: '90%',
            height: 50,
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
              onPress={() => {
                setPickState(!pickState), setDropState(false);
              }}
              style={{
                width: '50%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 50,
              }}>
              <Image source={pickUp} style={{width: 30, height: 30}} />
              <Text
                style={{
                  fontSize: 12,
                  marginLeft: 10,
                  fontFamily: 'Inter-SemiBold',
                  color: '#000',
                }}>
                Pick Up Marker
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setDropState(!dropState), setPickState(false);
              }}
              style={{
                width: '50%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 50,
              }}>
              <Image source={dropUp} style={{width: 20, height: 30}} />
              <Text
                style={{
                  fontSize: 12,
                  marginLeft: 10,
                  fontFamily: 'Inter-SemiBold',
                  color: '#000',
                }}>
                Drop Up Marker
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{height: '90%', width: '100%'}}>
        <MapView
          ref={mapRef}
          style={{height: '90%'}}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomControlEnabled={true}>
          <Marker.Animated
            ref={driverRef}
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
            description="Your current location">
            <Image
              source={Driver}
              ref={driverRef}
              style={{
                width: 50,
                height: 50,
                transform: [{rotate: `${currentLocation.heading}deg`}],
              }}
              resizeMode="contain"
            />
          </Marker.Animated>

          <MapViewDirections
            origin={dropState ? currentLocation : curLocs}
            destination={pickState ? currentLocation : destinationCords}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor="#0F3B60"
            optimizeWaypoints={true}
            onReady={result => {
              mapRef.current.fitToCoordinates(result.coordinates, {
                // edgePadding: { right: 30, bottom: 300, left: 30, top: 100 }
              });
            }}
          />
          <Marker.Animated
            ref={markerRef}
            coordinate={curLocs}
            optimizeWaypoints={true}>
            <Image
              source={pickUp}
              ref={markerRef}
              style={{
                width: 45,
                height: 45,
                transform: [{rotate: `${heading}deg`}],
              }}
              resizeMode="contain"
            />
          </Marker.Animated>
          <Marker.Animated
            ref={markerRef}
            coordinate={destinationCords}
            optimizeWaypoints={true}>
            <Image
              source={dropUp}
              ref={markerRef}
              style={{
                width: 45,
                height: 45,
                transform: [{rotate: `${heading}deg`}],
              }}
              resizeMode="contain"
            />
          </Marker.Animated>
        </MapView>
      </View>
    </View>
  );
}
