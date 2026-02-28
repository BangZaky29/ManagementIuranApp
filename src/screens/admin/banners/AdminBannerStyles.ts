import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF8' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EEE',
        backgroundColor: '#FFF'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },

    listContent: { padding: 20, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden',
        borderWidth: 1, borderColor: '#EEE',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    bannerImage: { width: '100%', height: 160, backgroundColor: '#EEE' },
    cardBody: { padding: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bannerTitle: { fontSize: 16, fontWeight: '700', color: '#333', flex: 1, marginRight: 10 },

    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12, gap: 5
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    actions: { flexDirection: 'row', gap: 15 },

    fab: {
        position: 'absolute', bottom: 30, right: 20,
        backgroundColor: '#1B5E20', width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center', elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4
    },

    // Modal Styles
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },

    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
    input: {
        backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15,
        borderWidth: 1, borderColor: '#EEE'
    },

    imagePickerPlaceholder: {
        width: '100%', height: 160, backgroundColor: '#F0F4F0', borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', borderStyle: 'solid',
        borderWidth: 1.5, borderColor: '#A5D6A7', marginBottom: 12, overflow: 'hidden'
    },
    pickedImage: { width: '100%', height: '100%' },
    imagePickerLabel: { fontSize: 13, color: '#2E7D32', fontWeight: '600', marginTop: 8 },

    pickerActionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    pickerBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#E8F5E9', paddingVertical: 12, borderRadius: 12, gap: 8,
        borderWidth: 1, borderColor: '#A5D6A7'
    },
    pickerBtnText: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },

    submitBtn: {
        backgroundColor: '#1B5E20', borderRadius: 12, padding: 16, alignItems: 'center',
        marginTop: 10
    },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    dateInputRow: { flexDirection: 'row', gap: 12 },
    dateInputBtn: {
        flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: '#EEE', flexDirection: 'row', alignItems: 'center', gap: 10
    },
    dateInputText: { fontSize: 14, color: '#333', fontWeight: '500' },
    dateValueText: { fontSize: 14, color: '#1B5E20', fontWeight: 'bold' },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#CCC', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },

    pickerCircle: {
        width: 70, height: 70, borderRadius: 35, backgroundColor: '#E8F5E9',
        justifyContent: 'center', alignItems: 'center', marginBottom: 10
    },
    pickerText: { fontSize: 14, fontWeight: '600', color: '#333' }
});
