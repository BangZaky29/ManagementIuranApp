import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        height: Platform.OS === 'android' ? 80 : 60,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0D47A1',
        marginLeft: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#0D47A1',
    },
    filterText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFF',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    reportCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 1 },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 10,
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    dateText: {
        fontSize: 11,
        color: '#999',
        marginTop: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardBody: {
        padding: 12,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    reportDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    imagePreview: {
        width: '100%',
        height: 180,
        marginTop: 10,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#F8F9FA',
        padding: 8,
        borderRadius: 6,
    },
    locationText: {
        fontSize: 11,
        color: '#0D47A1',
        marginLeft: 4,
        flex: 1,
    },
    categoryTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8EAF6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8,
    },
    categoryText: {
        fontSize: 10,
        color: '#3F51B5',
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        backgroundColor: '#FAFBFC',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    btnBlue: {
        backgroundColor: '#0D47A1',
    },
    btnGreen: {
        backgroundColor: '#2E7D32',
    },
    btnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#AAA',
        marginTop: 6,
    },
    loadMoreBtn: {
        backgroundColor: '#FFF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 10,
        marginHorizontal: 16,
    },
    loadMoreText: {
        color: '#0D47A1',
        fontSize: 14,
        fontWeight: 'bold',
    },
    // Rejection UI
    rejectionBox: {
        marginTop: 10,
        backgroundColor: '#FEF2F2',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#EF4444',
    },
    rejectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 2,
    },
    rejectionText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 16,
    },

    // Modal Styles (copied pattern from Admin)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#F9FAFB',
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnCancel: {
        backgroundColor: '#F3F4F6',
    },
    btnConfirm: {
        backgroundColor: '#EF4444',
    },
});
