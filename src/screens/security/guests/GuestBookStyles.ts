import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    subtitle: { fontSize: 13, color: '#666' },
    addButton: {
        backgroundColor: '#0D47A1', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6
    },
    addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    
    // Tab Bar
    tabBar: {
        flexDirection: 'row', paddingHorizontal: 16, backgroundColor: '#FFF',
        borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 12
    },
    filterChip: {
        paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#F5F5F5', marginRight: 10, borderWidth: 1, borderColor: '#EEE'
    },
    filterChipActive: {
        backgroundColor: '#E3F2FD', borderColor: '#0D47A1'
    },
    filterText: {
        fontSize: 14, color: '#666', fontWeight: '600'
    },
    filterTextActive: {
        color: '#0D47A1', fontWeight: 'bold'
    },

    // Summary Card
    summaryCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: '#EEE',
        marginHorizontal: 8,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },

    // List
    listContainer: { padding: 16, paddingBottom: 100 },

    // Card
    card: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
        borderLeftWidth: 4, borderLeftColor: '#4CAF50',
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
    guestTypeText: { fontSize: 11, fontWeight: 'bold', color: '#FFF', textTransform: 'capitalize' },
    timeText: { fontSize: 12, color: '#888' },

    detailsRow: { flexDirection: 'row', marginTop: 16, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12 },
    detailCol: { flex: 1 },
    detailLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
    detailValue: { fontSize: 13, fontWeight: '600', color: '#111' },

    checkoutBtn: {
        backgroundColor: '#FFEBEE', paddingVertical: 10, borderRadius: 10,
        alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center', gap: 6
    },
    checkoutBtnText: { color: '#C62828', fontWeight: 'bold', fontSize: 14 },

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
    headerRow: { 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: 10 
    },

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
    typeBtnActive: { backgroundColor: '#E3F2FD', borderColor: '#0D47A1' },
    typeText: { fontSize: 13, color: '#666', textTransform: 'capitalize' },
    typeTextActive: { color: '#0D47A1', fontWeight: 'bold' },

    submitBtn: {
        backgroundColor: '#0D47A1', paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 8
    },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    cancelBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },

    floatingAddBtn: {
        position: 'absolute',
        bottom: 90, // Above the tab bar
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#0D47A1',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
            android: { elevation: 6 },
        }),
    },

    // Resident Search Modal
    pickerButton: {
        backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: '#EEE'
    },
    pickerButtonText: { fontSize: 15, color: '#333' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
        marginBottom: 16, borderWidth: 1, borderColor: '#EEE'
    },
    searchInput: { flex: 1, fontSize: 15, color: '#333' },
    residentListItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0'
    },
    residentAvatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#90CAF9',
        justifyContent: 'center', alignItems: 'center'
    },
    residentAvatarImg: {
        width: 40, height: 40, borderRadius: 20
    },
    residentName: { fontSize: 15, fontWeight: '600', color: '#111' },
    residentBlock: { fontSize: 12, color: '#666', marginTop: 2 },

    // PIN Modal specific
    pinInputContainer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginVertical: 20,
        gap: 10
    },
    pinDigitBox: {
        width: 45,
        height: 55,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        borderWidth: 2,
        borderColor: '#EEE',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pinDigitBoxActive: {
        borderColor: '#0D47A1',
        backgroundColor: '#E3F2FD'
    },
    pinDigitText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    hiddenPinInput: {
        position: 'absolute',
        opacity: 0,
        width: '100%',
        height: '100%'
    },
    pinInfoText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginBottom: 10
    },
    
    // Show More
    showMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 4,
        gap: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE'
    },
    showMoreText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0D47A1'
    }
});
