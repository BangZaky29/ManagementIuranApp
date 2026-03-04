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
        paddingVertical: 15,
        backgroundColor: colors.surface,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 10,
    },
    headerGreeting: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    headerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: colors.primarySubtle,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Weather Widget
    weatherCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderColor: colors.border,
        borderWidth: 1,
        backgroundColor: colors.surface,
    },
    weatherGradient: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceSubtle,
    },
    weatherInfo: {
        flexDirection: 'column',
    },
    weatherTemp: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    weatherLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },

    // Bill Summary
    billCard: {
        marginHorizontal: 20,
        marginBottom: 25,
        padding: 20,
        backgroundColor: colors.surface,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: colors.danger,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(220, 53, 69, 0.15)',
            }
        }),
        borderLeftWidth: 5,
        borderLeftColor: colors.danger, // Red accent for unpaid
    },
    billTextContainer: {
        flex: 1,
    },
    billLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    billAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.danger,
    },
    payButtonSmall: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.danger,
        borderRadius: 20,
    },
    payButtonText: {
        color: colors.textWhite,
        fontWeight: 'bold',
        fontSize: 12,
    },

    // Quick Actions
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginHorizontal: 20,
        marginBottom: 15,
        marginTop: 10,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    actionButton: {
        width: (width - 60) / 3, // 3 columns
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 55,
        height: 55,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
            }
        }),
    },
    gatedIcon: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: colors.surface,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    actionText: {
        fontSize: 12,
        color: colors.textPrimary,
        textAlign: 'center',
        fontWeight: '500',
    },

    // News
    newsContainer: {
        paddingLeft: 20,
        paddingBottom: 20,
    },
    newsCard: {
        width: 280,
        backgroundColor: colors.surface,
        borderRadius: 15,
        marginRight: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
            }
        }),
    },
    newsCardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    newsThumb: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: colors.surfaceSubtle,
    },
    newsThumbPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    newsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.primarySubtle,
        borderRadius: 8,
        marginBottom: 10,
    },
    newsBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 6,
    },
    newsContent: {
        fontSize: 12,
        color: colors.textSecondary,
    },

    // Banner Styles
    bannerContainerHome: {
        marginHorizontal: 20,
        marginBottom: 25,
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: colors.primarySubtle,
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
        backgroundColor: colors.warning,
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
        color: colors.textWhite,
        marginBottom: 4,
    },
    bannerSubtitleText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 18,
    },
});
