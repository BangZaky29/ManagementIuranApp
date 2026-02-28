import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useHomeViewModel } from './HomeViewModel';
import { HomeStyles as styles } from './HomeStyles';
import { CustomAlertModal } from '../../../components/CustomAlertModal';

export default function HomeScreen() {
    const {
        userName,
        avatarUrl,
        weather,
        billSummary,
        newsItems,
        unreadNotifCount,
        quickActions,
        handleNavigation,
        handleNewsClick,
        handlePanicButton,
        alertVisible,
        alertConfig,
        hideAlert,
        isLoading,
        refresh: loadData,
        verifyLocation
    } = useHomeViewModel();
    const { colors } = useTheme();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.green1} />

            {/* Header */}
            <View style={[styles.headerContainer, { backgroundColor: colors.green1 }]}>
                <View style={[styles.headerTitleContainer, { marginLeft: 0 }]}>
                    <Text style={[styles.headerGreeting, { color: colors.textSecondary }]}>Halo,</Text>
                    <Text style={[styles.headerName, { color: colors.green5 }]}>{userName}!</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ marginRight: 12, padding: 4, position: 'relative' }}
                        onPress={() => handleNavigation('/warga/notifications')} // Routing to new Notification Screen
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.green5} />
                        {unreadNotifCount > 0 && (
                            <View style={{
                                position: 'absolute',
                                top: 2,
                                right: 4,
                                backgroundColor: 'red',
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                borderWidth: 1,
                                borderColor: colors.green1
                            }} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.profileImage, { backgroundColor: colors.green3, overflow: 'hidden' }]} onPress={() => handleNavigation('/(tabs)/profil')}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <Ionicons name="person" size={24} color={colors.backgroundCard} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Weather Widget (Dynamic) */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.weatherCard, { backgroundColor: colors.backgroundCard }]}>
                    <View style={styles.weatherGradient}>
                        <View style={styles.weatherInfo}>
                            <Text style={[styles.weatherTemp, { color: colors.green5 }]}>{weather.temp}</Text>
                            <Text style={[styles.weatherLocation, { color: colors.green4 }]}>
                                <Ionicons name="location-sharp" size={12} color={colors.green4} /> {weather.location}
                            </Text>
                            <Text style={{ fontSize: 10, color: colors.green4, marginTop: 4 }}>
                                Kondisi: {weather.condition}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <Ionicons
                                name={weather.condition.includes('Hujan') ? 'rainy' : (weather.condition.includes('Berawan') ? 'cloud' : 'sunny')}
                                size={44}
                                color={weather.condition.includes('Hujan') ? '#1976D2' : '#FFB300'}
                            />
                            <TouchableOpacity
                                style={{ marginTop: 8, padding: 4 }}
                                onPress={verifyLocation}
                            >
                                <Ionicons name="refresh-circle" size={24} color={colors.green3} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* Banner Coming Soon (Replacement for Bill Summary) */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.bannerContainerHome}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=500&auto=format&fit=crop' }}
                        style={styles.bannerImage}
                    />
                    <View style={styles.bannerOverlay}>
                        <View style={styles.bannerTag}>
                            <Text style={styles.bannerTagText}>Coming Soon</Text>
                        </View>
                        <Text style={styles.bannerTitleText}>Layanan Premium</Text>
                        <Text style={styles.bannerSubtitleText}>Segera hadir fitur marketplace khusus warga.</Text>
                    </View>
                </Animated.View>

                {/* Quick Actions Grid */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                    <Text style={[styles.sectionTitle, { color: colors.green5 }]}>Layanan Warga</Text>
                    <View style={styles.gridContainer}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.actionButton}
                                onPress={() => {
                                    if (action.id === 'panic') {
                                        handlePanicButton();
                                    } else {
                                        handleNavigation(action.route);
                                    }
                                }}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: action.bgColor }]}>
                                    <Ionicons name={action.icon as any} size={26} color={action.color} />
                                </View>
                                <Text style={[styles.actionText, { color: colors.textPrimary }]}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Latest News */}
                <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.newsContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={[styles.sectionTitle, { marginLeft: 0, marginBottom: 0, color: colors.green5 }]}>Info Terbaru</Text>
                        <TouchableOpacity onPress={() => handleNavigation('/news')}>
                            <Text style={{ marginTop: 10, marginRight: 10, fontSize: 13, color: colors.green5, fontWeight: '600' }}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        onTouchStart={(e) => {
                            // This helps on Android to claim the touch event
                            e.stopPropagation();
                        }}
                    >
                        {newsItems.slice(0, 3).map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.newsCard, { backgroundColor: colors.backgroundCard }]}
                                onPress={() => handleNewsClick(item.id)}
                            >
                                {/* Top row: badge + thumbnail */}
                                <View style={styles.newsCardTopRow}>
                                    <View style={[styles.newsBadge, { backgroundColor: colors.accent, marginBottom: 0 }]}>
                                        <Text style={[styles.newsBadgeText, { color: colors.green5 }]}>{item.category || 'PENGUMUMAN'}</Text>
                                    </View>
                                    {item.image_url ? (
                                        <Image
                                            source={{ uri: item.image_url }}
                                            style={styles.newsThumb}
                                        />
                                    ) : (
                                        <View style={[styles.newsThumbPlaceholder, { backgroundColor: colors.accent }]}>
                                            <Ionicons name="newspaper-outline" size={20} color={colors.green4} />
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.newsTitle, { color: colors.green5, marginTop: 10 }]} numberOfLines={2}>{item.title}</Text>
                                <Text style={{ fontSize: 11, color: colors.green4, marginBottom: 8 }}>
                                    <Ionicons name="calendar-outline" size={10} color={colors.green4} /> {formatDate(item.created_at)}
                                </Text>
                                <Text style={[styles.newsContent, { color: colors.textSecondary }]} numberOfLines={3}>{item.content}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

            </ScrollView>

            {/* Custom Alert Modal */}
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
