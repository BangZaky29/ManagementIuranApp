
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface ReportLocationViewerProps {
    locationUrl: string | null;
    onOpenLocation: () => void;
}

export const ReportLocationViewer: React.FC<ReportLocationViewerProps> = ({ locationUrl, onOpenLocation }) => {
    if (!locationUrl) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Lokasi Kejadian:</Text>
            <TouchableOpacity style={styles.buttonFallback} onPress={onOpenLocation}>
                <Ionicons name="map" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.textFallback}>Buka Lokasi di Google Maps</Text>
                <Ionicons name="open-outline" size={16} color={Colors.primary} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
        </View>
    );
};

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
    buttonFallback: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F7FA',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#B2EBF2'
    },
    textFallback: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 14
    },
});
