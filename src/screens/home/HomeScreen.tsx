import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useHomeViewModel } from './HomeViewModel';
import { HomeStyles as styles } from './HomeStyles';
import { CustomAlertModal } from '../../components/CustomAlertModal';

export default function HomeScreen() {
    const {
        userName,
        avatarUrl,
        weather,
        billSummary,
        newsItems,
        quickActions,
        handleNavigation,
        handleNewsClick,
        handlePanicButton,
        alertVisible,
        alertConfig,
        hideAlert
    } = useHomeViewModel();
    const { colors } = useTheme();

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
                        style={{ marginRight: 12, padding: 4 }}
                        onPress={() => handleNavigation()} // Triggers "Coming Soon" alert
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.green5} />
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
                {/* Weather Widget (New) */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.weatherCard, { backgroundColor: colors.backgroundCard }]}>
                    <View style={styles.weatherGradient}>
                        <View style={styles.weatherInfo}>
                            <Text style={[styles.weatherTemp, { color: colors.green5 }]}>{weather.temp}</Text>
                            <Text style={[styles.weatherLocation, { color: colors.green4 }]}>
                                <Ionicons name="location-sharp" size={12} color={colors.green4} /> {weather.location}
                            </Text>
                        </View>
                        <Ionicons name="partly-sunny" size={48} color="#FFB300" />
                    </View>
                </Animated.View>

                {/* Bill Summary Widget (New Priority Feature) */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={[styles.billCard, { backgroundColor: colors.backgroundCard }]}>
                    <View style={styles.billTextContainer}>
                        <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Tagihan Belum Dibayar</Text>
                        <Text style={[styles.billAmount, { color: colors.green5 }]}>{billSummary.total}</Text>
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>Jatuh tempo: {billSummary.dueDate}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.payButtonSmall, { backgroundColor: colors.green3 }]}
                        onPress={() => handleNavigation('/(tabs)/iuran')}
                    >
                        <Text style={styles.payButtonText}>Bayar</Text>
                    </TouchableOpacity>
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
                    <Text style={[styles.sectionTitle, { marginLeft: 0, color: colors.green5 }]}>Info Terbaru</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        onTouchStart={(e) => {
                            // This helps on Android to claim the touch event
                            e.stopPropagation();
                        }}
                    >
                        {newsItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.newsCard, { backgroundColor: colors.backgroundCard }]}
                                onPress={() => handleNewsClick(item.id)}
                            >
                                <View style={[styles.newsBadge, { backgroundColor: colors.accent }]}>
                                    <Text style={[styles.newsBadgeText, { color: colors.green5 }]}>{item.category || 'PENGUMUMAN'}</Text>
                                </View>
                                <Text style={[styles.newsTitle, { color: colors.green5 }]} numberOfLines={2}>{item.title}</Text>
                                <Text style={{ fontSize: 11, color: colors.green4, marginBottom: 8 }}>
                                    <Ionicons name="calendar-outline" size={10} color={colors.green4} /> {item.date}
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
