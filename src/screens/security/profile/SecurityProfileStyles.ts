import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8', // Light blue background
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },

    // Header Section
    headerCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
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
        }),
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#BBDEFB',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0D47A1', // Security Blue
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#1976D2',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },

    // Info Section
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0D47A1',
        marginBottom: 12,
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
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
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },

    // Menu Actions
    menuContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#BBDEFB', 
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingVertical: 18, 
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#0D47A1', 
        marginLeft: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFEBEE', 
        borderRadius: 16,
        zIndex: 10,
        elevation: 5,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C62828', 
        marginLeft: 8,
    },

    versionText: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 12,
        color: '#999',
    },
});
