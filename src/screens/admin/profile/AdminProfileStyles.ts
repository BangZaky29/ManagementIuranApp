import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

const { width } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },

    // Header Card
    headerCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
        color: colors.textPrimary,
    },
    userRole: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        overflow: 'hidden',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Section
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
        color: colors.textPrimary,
    },
    infoCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
        color: colors.textSecondary,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
    },

    // Menu
    menuContainer: {
        borderRadius: 20,
        padding: 8,
        marginBottom: 24,
        borderWidth: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 16,
    },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.dangerBg,
        marginBottom: 24,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: colors.danger,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 40,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    // Used for both full screen edit and modal
    formContainer: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: colors.textPrimary,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: colors.textSecondary,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.surfaceSubtle,
        marginRight: 10,
    },
    buttonTextCancel: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 15,
    },
    saveButton: { // Re-using saveButton style name for consistency if used elsewhere, or just link to button
        backgroundColor: colors.primary,
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: { // used in modal
        color: colors.textWhite,
        fontWeight: 'bold',
        fontSize: 15,
    },
    saveButtonText: { // used in EditScreen if any
        color: colors.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
});
