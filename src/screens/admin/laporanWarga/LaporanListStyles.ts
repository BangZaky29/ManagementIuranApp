import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Extra padding for floating tab bar
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Filter
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    dropdownButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dropdownText: {
        fontSize: 13,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    dropdownLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginBottom: 2,
    },

    // Modal Selection
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    modalClose: {
        padding: 4,
    },
    modalItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        fontSize: 14,
        color: Colors.textPrimary,
    },
    modalItemActive: {
        backgroundColor: '#F0F7FF',
    },
    modalItemTextActive: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    dateText: {
        fontSize: 10,
        color: Colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        marginLeft: 8,
    },
    statusText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardBody: {
        marginBottom: 12,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    reportCategory: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
        marginBottom: 8,
    },
    reportDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    reportImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 12,
        backgroundColor: '#F0F0F0',
    },
    reportLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    locationText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 8,
    },
    actionText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
    },

});
