import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle, Platform } from 'react-native';
import { Colors } from '../constants/Colors';

interface InfoCardProps {
    title?: string;
    children: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children, style, titleStyle }) => {
    return (
        <View style={[styles.card, style]}>
            {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
            <View style={styles.content}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20, // More rounded
        padding: 20,
        marginVertical: 10,
        ...Platform.select({
            ios: {
                shadowColor: Colors.green4,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 4px 8px rgba(42, 111, 43, 0.1)', // Green4 with opacity
            }
        }),
        borderWidth: 1,
        borderColor: Colors.green1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 16,
    },
    content: {
        // Content container style if needed
    },
});
