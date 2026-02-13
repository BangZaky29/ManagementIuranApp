import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionHeader: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    addButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    cardSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFF',
    },
    cardBody: {
        marginBottom: 12,
    },
    cardText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    tokenContainer: {
        marginTop: 8,
        backgroundColor: '#E8F5E9',
        padding: 8,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tokenLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primary,
        marginRight: 8,
    },
    tokenValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 2,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 8,
        alignItems: 'flex-end',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteText: {
        fontSize: 12,
        color: Colors.danger,
        marginLeft: 4,
    },
    formContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: Colors.primary,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 14,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    saveButton: {
        backgroundColor: Colors.primary,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    buttonTextCancel: {
        color: '#666',
        fontWeight: 'bold',
    },
    // Role Selector Styles
    roleContainer: {
        marginBottom: 16,
    },
    roleLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: Colors.textSecondary,
    },
    roleSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    roleOptionActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    roleText: {
        marginLeft: 6,
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    roleTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    roleBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    roleBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: '#999',
    },
});
