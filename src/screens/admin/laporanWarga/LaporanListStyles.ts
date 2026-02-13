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
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    filterScroll: {
        paddingRight: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    filterTextActive: {
        color: '#FFF',
    },

    // Card
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    dateText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
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

    // Detailed Modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    closeButton: {
        padding: 8,
        marginRight: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    modalContent: {
        flex: 1,
    },
    modalImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#F0F0F0',
    },
    modalBody: {
        padding: 20,
    },
    detailRow: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 24,
    },
    mapPlaceholder: {
        height: 150,
        backgroundColor: '#EEF2E3',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
});
