import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useHomeViewModel } from './HomeViewModel';
import { createStyles } from './HomeStyles';
import { BannerCarousel } from '../../../components/banner/BannerCarousel';
import { PanicCountdown } from '../../../components/panic/PanicCountdown';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { FeatureFlags } from '../../../constants/FeatureFlags';

export default function HomeScreen() {
    const { colors, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const { width } = Dimensions.get('window');

    const {
        userName,
        avatarUrl,
        weather,
        billSummary,
        newsItems,
        unreadNotifCount,
        banners,
        quickActions,
        handleNavigation,
        handleNewsClick,
        handlePanicButton,
        alertVisible,
        alertConfig,
        hideAlert,
        refresh: loadData,
        verifyLocation,
        isPanicSessionActive,
        panicTimeLeft,
        panicClickCount
    } = useHomeViewModel();

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [loadData])
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatCurrency = (value: string) => {
        return value; // already formatted in VM
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />

            {/* Panic Countdown Overlay */}
            <PanicCountdown
                visible={isPanicSessionActive}
                timeLeft={panicTimeLeft}
                clicksRemaining={3 - panicClickCount}
            />

            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerGreeting}>Halo,</Text>
                        <Text style={styles.headerName}>{userName}!</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            style={{ marginRight: 16, padding: 4, position: 'relative' }}
                            onPress={() => handleNavigation('/warga/notifications')}
                        >
                            <View style={{
                                padding: 8,
                                backgroundColor: colors.surfaceSubtle,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}>
                                <Ionicons name="notifications" size={20} color={colors.primary} />
                            </View>
                            {unreadNotifCount > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    backgroundColor: colors.danger,
                                    minWidth: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 2,
                                    borderColor: colors.surface
                                }}>
                                    <Text style={{ color: 'white', fontSize: 8, fontWeight: '900' }}>
                                        {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.profileImage} onPress={() => handleNavigation('/(tabs)/profil')}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Ionicons name="person" size={24} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Weather Widget (Dynamic & Glassmorphic) */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.weatherCard}>
                    <View style={styles.weatherGradient}>
                        <View style={styles.weatherInfo}>
                            <Text style={styles.weatherTemp}>{weather.temp}</Text>
                            <Text style={styles.weatherLocation}>
                                <Ionicons name="location-sharp" size={14} color={colors.primary} /> {weather.location}
                            </Text>
                            <Text style={styles.weatherCondition}>
                                KONDISI: {weather.condition}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <View style={{
                                padding: 10,
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 20,
                            }}>
                                <Ionicons
                                    name={weather.icon}
                                    size={50}
                                    color={weather.color}
                                />
                            </View>
                            <TouchableOpacity
                                style={{ marginTop: 10 }}
                                onPress={verifyLocation}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="refresh-circle" size={18} color={colors.primary} />
                                    <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>UPDATE</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* Billing Summary (Urgent Link) */}
                {billSummary && billSummary.total !== 'Lunas' && (
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.billCard}>
                        <View style={styles.billHighlight} />
                        <View style={styles.billTextContainer}>
                            <Text style={styles.billLabel}>Tagihan Belum Dibayar</Text>
                            <Text style={styles.billAmount}>{billSummary.total}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.payButtonSmall}
                            onPress={() => handleNavigation('/(tabs)/iuran')}
                        >
                            <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Dynamic Banner Carousel */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                    <BannerCarousel banners={banners} />
                </Animated.View>

                {/* Quick Actions Grid */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Layanan Terintegrasi</Text>
                    </View>
                    <View style={styles.gridContainer}>
                        {quickActions.map((action, index) => {
                            const isGated =
                                (action.id === 'message' && !FeatureFlags.IS_MESSAGE_ENABLED) ||
                                (action.id === 'more' && !FeatureFlags.IS_OTHERS_ENABLED);

                            return (
                                <TouchableOpacity
                                    key={action.id}
                                    style={styles.actionButton}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        if (isGated) {
                                            handleNavigation();
                                            return;
                                        }
                                        if (action.id === 'panic') {
                                            handlePanicButton();
                                        } else {
                                            handleNavigation(action.route);
                                        }
                                    }}
                                >
                                    <View style={[styles.iconCircle, { borderColor: action.bgColor + '00' }]}>
                                        <View style={{
                                            padding: 12,
                                            borderRadius: 16,
                                            backgroundColor: action.bgColor + (isDark ? '20' : '80')
                                        }}>
                                            <Ionicons name={action.icon as any} size={28} color={action.color} />
                                        </View>
                                        {isGated && (
                                            <View style={styles.gatedIcon}>
                                                <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
                                            </View>
                                        )}
                                        {!!action.badge && action.badge > 0 && (
                                            <View style={{
                                                position: 'absolute',
                                                top: -4,
                                                right: -4,
                                                backgroundColor: colors.danger,
                                                minWidth: 20,
                                                height: 20,
                                                borderRadius: 10,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderWidth: 2,
                                                borderColor: colors.surface
                                            }}>
                                                <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>
                                                    {action.badge > 99 ? '99+' : action.badge}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.actionText}>{action.title}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Latest News (Premium Cards) */}
                <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.newsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Info Terbaru</Text>
                        <TouchableOpacity onPress={() => handleNavigation('/news')}>
                            <Text style={styles.viewAllLink}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.newsList}
                        decelerationRate="fast"
                        snapToInterval={318} // card width + margin
                    >
                        {newsItems.length > 0 ? newsItems.slice(0, 3).map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInRight.delay(600 + (index * 100))}
                            >
                                <TouchableOpacity
                                    style={styles.newsCard}
                                    onPress={() => handleNewsClick(item.id)}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.newsImageContainer}>
                                        {item.image_url ? (
                                            <Image
                                                source={{ uri: item.image_url }}
                                                style={styles.newsImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                <Ionicons name="newspaper-outline" size={40} color={colors.primary + '40'} />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.newsBody}>
                                        <View style={styles.newsBadge}>
                                            <Text style={styles.newsBadgeText}>{item.category || 'WARTA WARGA'}</Text>
                                        </View>
                                        <Text style={styles.newsTitle} numberOfLines={1}>{item.title}</Text>
                                        <View style={styles.newsMeta}>
                                            <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                                            <Text style={styles.newsDate}>{formatDate(item.created_at)}</Text>
                                        </View>
                                        <Text style={styles.newsContent} numberOfLines={2}>{item.content}</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        )) : (
                            <View style={{ width: width - 40, height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceSubtle, borderRadius: 20 }}>
                                <Text style={{ color: colors.textSecondary }}>Belum ada informasi terbaru</Text>
                            </View>
                        )}
                    </ScrollView>
                </Animated.View>

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
