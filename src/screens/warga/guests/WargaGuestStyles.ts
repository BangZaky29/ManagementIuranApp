import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4F8' },

    // Header Area
    header: {
        backgroundColor: '#FFF', paddingHorizontal: 20, paddingBottom: 16,
        paddingTop: Platform.OS === 'android' ? 48 : 16,
        borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#00695C', marginTop: 8 },
    subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
    addButton: {
        backgroundColor: '#00695C', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6,
        marginBottom: 8
    },
    addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

    // List
    listContainer: { padding: 16, paddingBottom: 100 },

    // Card
    card: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
        borderLeftWidth: 4, borderLeftColor: '#00695C',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    guestName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    guestTypeBadge: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4, alignSelf: 'flex-start'
    },
    guestTypeText: { fontSize: 11, fontWeight: 'bold', color: '#FFF', textTransform: 'uppercase' },

    pinContainer: {
        alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 12, borderWidth: 1, borderColor: '#A5D6A7'
    },
    pinLabel: { fontSize: 10, color: '#2E7D32', fontWeight: 'bold', marginBottom: 2 },
    pinValue: { fontSize: 18, color: '#1B5E20', fontWeight: '900', letterSpacing: 2 },

    detailsRow: { flexDirection: 'row', marginTop: 16, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12 },
    detailCol: { flex: 1 },
    detailLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
    detailValue: { fontSize: 13, fontWeight: '600', color: '#111' },

    timelineRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timelineText: { fontSize: 11, color: '#666' },

    // Empty State
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 16 },
    emptySubtitle: { fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '90%',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },

    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
    input: {
        backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14,
        fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#EEE'
    },

    typeSelector: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    typeBtn: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEE'
    },
    typeBtnActive: { backgroundColor: '#E0F2F1', borderColor: '#00695C' },
    typeText: { fontSize: 13, color: '#666', textTransform: 'capitalize' },
    typeTextActive: { color: '#00695C', fontWeight: 'bold' },

    submitBtn: {
        backgroundColor: '#00695C', paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 8
    },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    cancelBtnText: { color: '#888', fontSize: 15, fontWeight: '600' }
});
