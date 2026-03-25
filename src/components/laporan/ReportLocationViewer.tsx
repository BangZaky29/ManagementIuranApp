
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ReportLocationViewerProps {
    locationUrl: string | null;
    onOpenLocation: () => void;
}

// Safe import for MapView — prevent crash if native module fails to load
let MapView: any = null;
let Marker: any = null;

try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
} catch (e) {
    console.warn('react-native-maps failed to load, using fallback:', e);
}

export const ReportLocationViewer: React.FC<ReportLocationViewerProps> = ({ locationUrl, onOpenLocation }) => {
    if (!locationUrl) return null;

    // Helper to extract coords from Google Maps URL
    // Format: https://www.google.com/maps/search/?api=1&query=-6.123,106.123
    const getCoords = (url: string) => {
        try {
            const regex = /query=([-0-9.]+),([-0-9.]+)/;
            const match = url.match(regex);
            if (match && match[1] && match[2]) {
                return {
                    latitude: parseFloat(match[1]),
                    longitude: parseFloat(match[2]),
                };
            }
        } catch (e) {
            console.error('Error parsing coords', e);
        }
        return null;
    };

    const coords = getCoords(locationUrl);

    // Fallback: show a button if coords can't be parsed OR MapView failed to load
    if (!coords || !MapView || !Marker) {
        return (
            <TouchableOpacity style={styles.buttonFallback} onPress={onOpenLocation}>
                <Ionicons name="map" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.textFallback}>Lihat Lokasi di Peta</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Lokasi Kejadian:</Text>
            <View style={styles.mapContainer}>
                <MapViewSafe
                    coords={coords}
                    onOpenLocation={onOpenLocation}
                />
            </View>
        </View>
    );
};

// Separate component with error boundary protection
class MapViewSafe extends React.Component<{
    coords: { latitude: number; longitude: number };
    onOpenLocation: () => void;
}, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any, info: any) {
        console.warn('MapView crashed, showing fallback:', error, info);
    }

    render() {
        if (this.state.hasError || !MapView || !Marker) {
            return (
                <TouchableOpacity style={styles.buttonFallback} onPress={this.props.onOpenLocation}>
                    <Ionicons name="map" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.textFallback}>Lihat Lokasi di Peta</Text>
                </TouchableOpacity>
            );
        }

        const { coords, onOpenLocation } = this.props;

        return (
            <>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    onPress={onOpenLocation}
                >
                    <Marker coordinate={coords} />
                </MapView>

                {/* Overlay link button */}
                <TouchableOpacity style={styles.overlayButton} onPress={onOpenLocation}>
                    <Ionicons name="open-outline" size={16} color="white" />
                    <Text style={styles.overlayText}>Buka Maps</Text>
                </TouchableOpacity>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    mapContainer: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#eee',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    buttonFallback: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#E0F7FA',
        padding: 10,
        borderRadius: 8
    },
    textFallback: {
        color: Colors.primary,
        fontWeight: 'bold'
    },
    overlayButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    overlayText: {
        color: 'white',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    }
});
