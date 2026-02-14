import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Image, TouchableOpacity } from 'react-native';
import { ReportDetailStyles as styles } from './ReportDetailStyles';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

import { useReportDetailViewModel } from './ReportDetailViewModel';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { ReportLocationViewer } from '../../../components/ReportLocationViewer';

export default function ReportDetailScreen() {
    const {
        data,
        loading,
        imageAspectRatio,
        alertVisible,
        alertConfig,
        hideAlert,
        handleOpenLocation,
        handleDelete,
        handleEdit,
        getStatusColor,
        getStatusBg,
        refresh
    } = useReportDetailViewModel();

    // Reload data when screen is focused (in case we return from Edit)
    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [])
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Memuat...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Laporan tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const formattedDate = new Date(data.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title="Detail Laporan" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Card */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(data.status) }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>{data.status}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row' }}>
                                {/* Edit Button */}
                                <TouchableOpacity onPress={handleEdit} style={{ padding: 4, marginRight: 8 }}>
                                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                                </TouchableOpacity>
                                {/* Delete Button */}
                                <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
                                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.title}>{data.title}</Text>
                    <Text style={styles.category}>{data.category}</Text>

                    <ReportLocationViewer
                        locationUrl={data.location}
                        onOpenLocation={handleOpenLocation}
                    />

                    <View style={styles.divider} />

                    <Text style={styles.description}>{data.description}</Text>

                    {data.image_url && (
                        <Image
                            source={{ uri: data.image_url }}
                            style={[styles.image, { height: undefined, aspectRatio: imageAspectRatio }]}
                            resizeMode="contain"
                        />
                    )}
                </View>

                {/* Timeline Placeholder - Logic can be added later if we have a history table */}
                <Text style={styles.sectionTitle}>Status Laporan</Text>
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                            <View style={[styles.dot, { backgroundColor: Colors.green5 }]} />
                        </View>
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>Laporan Dibuat</Text>
                            <Text style={styles.timelineDate}>{formattedDate}</Text>
                            <Text style={styles.timelineDesc}>Laporan anda telah masuk ke sistem.</Text>
                        </View>
                    </View>

                    {data.status !== 'Menunggu' && (
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={styles.line} />
                                <View style={[styles.dot, { backgroundColor: Colors.green5 }]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Status: {data.status}</Text>
                                <Text style={styles.timelineDesc}>Admin memperbarui status laporan.</Text>
                            </View>
                        </View>
                    )}
                </View>

            </ScrollView>

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
        </SafeAreaView>
    );
}
