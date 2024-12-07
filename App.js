import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [geofence, setGeofence] = useState({
    latitude: 37.78825, 
    longitude: -122.4324,
    radius: 100, // in meters
  });

  // Request Location Permissions
  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required');
      return;
    }
    const userLocation = await Location.getCurrentPositionAsync({});
    setLocation(userLocation.coords);
    setRegion({
      ...region,
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    });
  };

  // Get User Location
  const getUserLocation = async () => {
    const userLocation = await Location.getCurrentPositionAsync({});
    setLocation(userLocation.coords);
    checkGeofence(userLocation.coords);
  };

  // Geofencing Check
  const checkGeofence = (currentLocation) => {
    const distance = getDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      geofence.latitude,
      geofence.longitude
    );
    if (distance < geofence.radius) {
      Alert.alert('Geofence Alert', 'You have entered the geofence area!');
    } else {
      Alert.alert('Geofence Alert', 'You are outside the geofence area.');
    }
  };

  // Calculate Distance for Geofencing (Haversine Formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation={true}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
          />
        )}
        <Marker
          coordinate={{
            latitude: geofence.latitude,
            longitude: geofence.longitude,
          }}
          title="Geofence Area"
          description="100m radius"
        />
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Check Geofence" onPress={getUserLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '90%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
});
