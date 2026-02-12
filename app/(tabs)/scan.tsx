import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../src/constants/Colors';

export default function ScanScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Scan Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.green1,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.green5,
    },
});
