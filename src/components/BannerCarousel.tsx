import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, Dimensions,
    FlatList, TouchableOpacity, Linking, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Banner } from '../services/banner';
import { Colors } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - 40; // Account for 20 margin on both sides

interface BannerCarouselProps {
    banners: Banner[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<any>(null);

    // Auto-slide logic
    useEffect(() => {
        if (banners.length <= 1) return;

        timerRef.current = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= banners.length) {
                nextIndex = 0;
            }

            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true
            });
            setActiveIndex(nextIndex);
        }, 5000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activeIndex, banners.length]);

    const handleBannerClick = async (targetUrl: string | null) => {
        if (!targetUrl) return;

        try {
            // Ensure URL has a protocol
            let url = targetUrl;
            if (!url.startsWith('http') && !url.startsWith('wa.me')) {
                // If it's just a domain or simple text, we don't open it
                return;
            }

            // Handle wa.me links specifically if needed, but openURL handles it usually
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                // Fallback for some devices where canOpenURL might fail but openURL works
                await Linking.openURL(url);
            }
        } catch (err) {
            console.error("Error opening link:", err);
        }
    };

    const renderItem = ({ item }: { item: Banner }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bannerItem}
            onPress={() => handleBannerClick(item.target_url)}
        >
            <Image source={{ uri: item.image_url }} style={styles.bannerImage} />
            <View style={styles.bannerOverlay}>
                <View style={styles.bannerTag}>
                    <Text style={styles.bannerTagText}>INFO WARGA</Text>
                </View>
                <Text style={styles.bannerTitleText} numberOfLines={1}>{item.title}</Text>
                {item.description && (
                    <Text style={styles.bannerSubtitleText} numberOfLines={2}>{item.description}</Text>
                )}

                {item.target_url && (
                    <TouchableOpacity
                        style={styles.bannerActionBtn}
                        onPress={() => handleBannerClick(item.target_url)}
                    >
                        <Text style={styles.bannerActionText}>Lihat Selengkapnya</Text>
                        <Ionicons name="chevron-forward" size={12} color="#000" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    if (banners.length === 0) {
        // Fallback or "Coming Soon" if no active banners
        return (
            <View style={styles.bannerItemPlaceholder}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=500&auto=format&fit=crop' }}
                    style={styles.bannerImage}
                />
                <View style={[styles.bannerOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                    <View style={styles.bannerTag}>
                        <Text style={styles.bannerTagText}>Warga Lokal</Text>
                    </View>
                    <Text style={styles.bannerTitleText}>Selamat Datang di Warlok</Text>
                    <Text style={styles.bannerSubtitleText}>Dapatkan info terbaru seputar lingkungan Anda.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={banners}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const index = Math.round(x / CAROUSEL_WIDTH);
                    if (index !== activeIndex) {
                        setActiveIndex(index);
                    }
                }}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id}
            />

            {/* Pagination Dots */}
            {banners.length > 1 && (
                <View style={styles.pagination}>
                    {banners.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                activeIndex === i ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 25,
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#E8F5E9',
    },
    bannerItem: {
        width: CAROUSEL_WIDTH,
        height: 160,
    },
    bannerItemPlaceholder: {
        marginHorizontal: 20,
        marginBottom: 25,
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20,
        justifyContent: 'center',
    },
    bannerTag: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    bannerTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
    },
    bannerTitleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    bannerSubtitleText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    bannerActionBtn: {
        backgroundColor: '#FFD700',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    bannerActionText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#000',
        marginRight: 4,
    },
    pagination: {
        position: 'absolute',
        bottom: 12,
        flexDirection: 'row',
        alignSelf: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        backgroundColor: '#FFF',
        width: 14,
    },
    inactiveDot: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    }
});
