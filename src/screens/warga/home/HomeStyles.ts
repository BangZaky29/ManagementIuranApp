import { StyleSheet, Platform, Dimensions } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

const { width } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 120, // Extra padding for floating tab bar
    },
    // Header Section
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 10,
    },
    headerGreeting: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    headerName: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.textPrimary,
        marginTop: -2,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.primary + '30',
        overflow: 'hidden',
    },

    // Weather Widget (Improved: Glassmorphic look)
    weatherCard: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0px 10px 25px rgba(0,0,0,0.06)',
            }
        }),
    },
    weatherGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceSubtle, // Could be replaced with actual gradient if available
    },
    weatherInfo: {
        flex: 1,
    },
    weatherTemp: {
        fontSize: 36,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -1,
    },
    weatherLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    weatherCondition: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '700',
        opacity: 0.7,
    },

    // Bill Summary (Improved: Vibrant & Clean)
    billCard: {
        marginHorizontal: 20,
        marginBottom: 25,
        padding: 20,
        backgroundColor: colors.surface,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: colors.danger,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.12,
                shadowRadius: 15,
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: '0px 12px 20px rgba(220, 53, 69, 0.12)',
            }
        }),
    },
    billHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 6,
        backgroundColor: colors.danger,
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
    },
    billTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    billLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    billAmount: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.danger,
    },
    payButtonSmall: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: colors.danger,
        borderRadius: 16,
        elevation: 4,
        shadowColor: colors.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    payButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },

    // Quick Actions (Modern Grid)
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    viewAllLink: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    actionButton: {
        width: (width - 30) / 3 - 10, // Better spacing for 3 columns
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(0,0,0,0.04)',
            }
        }),
    },
    gatedIcon: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.surface,
        borderRadius: 10,
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionText: {
        fontSize: 13,
        color: colors.textPrimary,
        textAlign: 'center',
        fontWeight: '600',
    },

    // News (Premium Carousel Look)
    newsContainer: {
        paddingBottom: 20,
    },
    newsList: {
        paddingLeft: 20,
        paddingRight: 5,
    },
    newsCard: {
        width: 300,
        backgroundColor: colors.surface,
        borderRadius: 24,
        marginRight: 18,
        padding: 0, // Content handled by inner container
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 6px 15px rgba(0,0,0,0.06)',
            }
        }),
    },
    newsImageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: colors.surfaceSubtle,
    },
    newsImage: {
        width: '100%',
        height: '100%',
    },
    newsBody: {
        padding: 16,
    },
    newsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: colors.primary + '15',
        borderRadius: 8,
        marginBottom: 10,
    },
    newsBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    newsTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 8,
        lineHeight: 22,
    },
    newsMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    newsDate: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
        marginLeft: 4,
    },
    newsContent: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },

    // Banner Styles
    bannerContainerHome: {
        marginHorizontal: 20,
        marginBottom: 30,
        height: 180,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: colors.primarySubtle,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', // Darker overlay for text legibility
        padding: 24,
        justifyContent: 'flex-end',
    },
    bannerTag: {
        backgroundColor: colors.warning,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    bannerTagText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#000',
        textTransform: 'uppercase',
    },
    bannerTitleText: {
        fontSize: 24,
        fontWeight: '900',
        color: 'white',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    bannerSubtitleText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
        fontWeight: '500',
    },
});
