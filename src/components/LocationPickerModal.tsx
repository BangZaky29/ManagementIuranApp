import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { CustomButton } from './CustomButton';

interface LocationPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (coordinate: { latitude: number; longitude: number }) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ visible, onClose, onSelectLocation }) => {
    const [region, setRegion] = useState<Region | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (visible) {
                try {
                    let { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        // Default to Jakarta if permission denied
                        setRegion({
                            latitude: -6.2088,
                            longitude: 106.8456,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        });
                        setIsLoading(false);
                        return;
                    }

                    let location = await Location.getCurrentPositionAsync({});
                    const initialRegion = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    };
                    setRegion(initialRegion);
                    setSelectedLocation(location.coords);
                } catch (error) {
                    console.warn("Map Init Error:", error);
                    // Default to Jakarta
                    setRegion({
                        latitude: -6.2088,
                        longitude: 106.8456,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        })();
    }, [visible]);

    const handleConfirm = () => {
        if (selectedLocation) {
            onSelectLocation(selectedLocation);
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Pilih Lokasi</Text>
                    <View style={{ width: 24 }} />
                </View>

                {isLoading || !region ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.green5} />
                        <Text style={{ marginTop: 10, color: Colors.textSecondary }}>Memuat Peta...</Text>
                    </View>
                ) : (
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            initialRegion={region}
                            onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
                        >
                            {selectedLocation && (
                                <Marker coordinate={selectedLocation} />
                            )}
                        </MapView>

                        <View style={styles.footer}>
                            <Text style={styles.hintText}>Ketuk pada peta untuk memilih lokasi</Text>
                            <CustomButton
                                title="Pilih Lokasi Ini"
                                onPress={handleConfirm}
                                disabled={!selectedLocation}
                            />
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginTop: 40, // StatusBar compensation
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    hintText: {
        textAlign: 'center',
        marginBottom: 12,
        color: Colors.textSecondary,
        fontSize: 12,
    }
});
