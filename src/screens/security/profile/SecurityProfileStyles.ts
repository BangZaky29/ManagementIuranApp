import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // Light blue background
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },

    // Header Area (Aligned with Guest Book)
    header: {
        backgroundColor: colors.surface, paddingHorizontal: 20, paddingBottom: 16,
        paddingTop: Platform.OS === 'android' ? 48 : 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.primary },

    // Header Section
    headerCard: {
        alignItems: 'center',
        backgroundColor: colors.surface,
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
        backgroundColor: colors.primarySubtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: colors.border,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary, // Security Blue
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: colors.primary,
        backgroundColor: colors.primarySubtle,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },

    // Info Section
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 12,
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceSubtle,
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primarySubtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '500',
    },

    // Menu Actions
    menuContainer: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.primary,
        marginLeft: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: colors.dangerBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.danger + '40', // transparent danger border
        marginTop: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.danger,
        marginLeft: 8,
    },

    versionText: {
        textAlign: 'center',
        marginTop: 24,
        fontSize: 12,
        color: colors.textSecondary,
    },
});
