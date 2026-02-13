
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface LocationPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (coordinate: { latitude: number; longitude: number }) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Pilih Lokasi</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                        <Ionicons name="map-outline" size={48} color={Colors.textSecondary} />
                        <Text style={styles.message}>
                            Fitur peta belum tersedia di versi Web.
                            Mohon gunakan aplikasi mobile untuk memilih lokasi akurat.
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        padding: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary
    },
    body: {
        alignItems: 'center',
        paddingVertical: 20
    },
    message: {
        marginTop: 12,
        textAlign: 'center',
        color: Colors.textSecondary,
        lineHeight: 20
    }
});
