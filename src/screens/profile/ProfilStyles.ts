import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

export const ProfilStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },

    // Header Section
    headerCard: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
            }
        }),
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F1F8E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: Colors.green1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: Colors.green4,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },

    // Info Section
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 12,
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.green1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: Colors.textPrimary,
        fontWeight: '500',
    },

    // Menu Actions
    menuContainer: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        // padding: 8, // Removed padding inside card for cleaner edge-to-edge feel if desired, 
        // but the image shows items inside a card. keeping padding but removing inner padding 
        // so the border radius clips.
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginBottom: 24,
        borderWidth: 1, // Added border to match image style usually seen in settings
        borderColor: Colors.green5, // Darker border as per image hint (black/dark green border)
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingVertical: 18, // Slightly taller
        // borderBottomWidth: 1, // Optional divider
        // borderBottomColor: '#F5F5F5',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.green5, // Dark green text
        marginLeft: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFE5E7', // Pinkish background matching the image
        borderRadius: 16,
        zIndex: 10,
        elevation: 5,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF5252', // Red/Pink text
        marginLeft: 8,
    },

    versionText: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 12,
        color: Colors.textSecondary,
    },
});
