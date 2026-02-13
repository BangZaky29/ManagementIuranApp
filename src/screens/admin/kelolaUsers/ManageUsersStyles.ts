import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Space for FAB
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Filter & Search
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#F5F7FA', // Match background
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: Colors.textPrimary,
    },

    // Card Styles
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    clusterName: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    cardSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardBody: {
        backgroundColor: '#F9FAFB',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    cardText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    tokenContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#EBEBEB',
    },
    tokenLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginRight: 8,
    },
    tokenValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 12,
        marginTop: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 8,
    },
    editButton: {
        backgroundColor: '#E3F2FD',
    },
    deleteButton: {
        backgroundColor: '#FEE2E2',
    },
    editText: {
        color: '#1565C0',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    deleteText: {
        color: Colors.danger,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },

    // FAB
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 100, // Raised to avoid tab bar obstruction
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 100,
    },

    // Modal Form
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    formContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: Colors.textPrimary,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    roleContainer: {
        marginBottom: 24,
    },
    roleLabel: {
        fontSize: 14,
        marginBottom: 8,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    roleSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    roleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
    },
    roleOptionActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    roleText: {
        marginLeft: 8,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    roleTextActive: {
        color: '#FFF',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F7FA',
    },
    saveButton: {
        backgroundColor: Colors.primary,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonTextCancel: {
        color: Colors.textSecondary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        marginTop: 40,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
});
