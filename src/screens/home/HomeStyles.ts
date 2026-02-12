import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export const HomeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 10,
    },
    headerGreeting: {
        fontSize: 16,
        color: Colors.green4,
    },
    headerName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: Colors.green2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Weather Widget
    weatherCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderColor: Colors.green2,
        borderWidth: 1,
    },
    weatherGradient: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F5E9',
    },
    weatherInfo: {
        flexDirection: 'column',
    },
    weatherTemp: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    weatherLocation: {
        fontSize: 14,
        color: Colors.green4,
        marginTop: 2,
    },

    // Bill Summary
    billCard: {
        marginHorizontal: 20,
        marginBottom: 25,
        padding: 20,
        backgroundColor: Colors.white,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Platform.select({
            ios: {
                shadowColor: Colors.danger,
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
        borderLeftColor: Colors.danger, // Red accent for unpaid
    },
    billTextContainer: {
        flex: 1,
    },
    billLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    billAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.danger,
    },
    payButtonSmall: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: Colors.danger,
        borderRadius: 20,
    },
    payButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },

    // Quick Actions
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
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
    actionText: {
        fontSize: 12,
        color: Colors.textPrimary,
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
        backgroundColor: Colors.white,
        borderRadius: 15,
        marginRight: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: Colors.green1,
        ...Platform.select({
            ios: {
                shadowColor: Colors.green5,
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
    newsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: Colors.green2,
        borderRadius: 8,
        marginBottom: 10,
    },
    newsBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 6,
    },
    newsContent: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
});
