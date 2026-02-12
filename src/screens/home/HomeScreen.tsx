import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useHomeViewModel } from './HomeViewModel';
import { HomeStyles as styles } from './HomeStyles';
import { CustomAlertModal } from '../../components/CustomAlertModal';

export default function HomeScreen() {
    const {
        userName,
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />

            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={[styles.headerTitleContainer, { marginLeft: 0 }]}>
                    <Text style={styles.headerGreeting}>Halo,</Text>
                    <Text style={styles.headerName}>{userName}!</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ marginRight: 12, padding: 4 }}
                        onPress={() => handleNavigation()} // Triggers "Coming Soon" alert
                    >
                        <Ionicons name="notifications-outline" size={24} color={Colors.green5} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileImage} onPress={() => handleNavigation('/(tabs)/profil')}>
                        <Ionicons name="person" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Weather Widget (New) */}
                <View style={styles.weatherCard}>
                    <View style={styles.weatherGradient}>
                        <View style={styles.weatherInfo}>
                            <Text style={styles.weatherTemp}>{weather.temp}</Text>
                            <Text style={styles.weatherLocation}>
                                <Ionicons name="location-sharp" size={12} color={Colors.green4} /> {weather.location}
                            </Text>
                        </View>
                        <Ionicons name="partly-sunny" size={48} color="#FFB300" />
                    </View>
                </View>

                {/* Bill Summary Widget (New Priority Feature) */}
                <View style={styles.billCard}>
                    <View style={styles.billTextContainer}>
                        <Text style={styles.billLabel}>Tagihan Belum Dibayar</Text>
                        <Text style={styles.billAmount}>{billSummary.total}</Text>
                        <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Jatuh tempo: {billSummary.dueDate}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.payButtonSmall}
                        onPress={() => handleNavigation('/(tabs)/iuran')}
                    >
                        <Text style={styles.payButtonText}>Bayar</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions Grid */}
                <Text style={styles.sectionTitle}>Layanan Warga</Text>
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
                            <Text style={styles.actionText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Latest News */}
                <View style={styles.newsContainer}>
                    <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>Info Terbaru</Text>
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
                                style={styles.newsCard}
                                onPress={() => handleNewsClick(item.id)}
                            >
                                <View style={styles.newsBadge}>
                                    <Text style={styles.newsBadgeText}>{item.category || 'PENGUMUMAN'}</Text>
                                </View>
                                <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                                <Text style={{ fontSize: 11, color: Colors.green4, marginBottom: 8 }}>
                                    <Ionicons name="calendar-outline" size={10} color={Colors.green4} /> {item.date}
                                </Text>
                                <Text style={styles.newsContent} numberOfLines={3}>{item.content}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

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
