import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

interface CustomHeaderProps {
    title: string;
    showBack?: boolean;
    rightIcon?: React.ReactNode;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    showBack = false,
    rightIcon,
}) => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.title}>{title}</Text>

                <View style={styles.rightContainer}>
                    {rightIcon}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Colors.green1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});
