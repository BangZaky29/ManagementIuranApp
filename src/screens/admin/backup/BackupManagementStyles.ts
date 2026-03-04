import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF8' },

    // Summary
    summaryContainer: {
        marginHorizontal: 20, marginTop: 20, backgroundColor: '#FFF',
        borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    summaryTitle: { fontSize: 16, fontWeight: '800', color: '#1B5E20', marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    summaryCard: {
        flex: 1, alignItems: 'center', padding: 10,
        backgroundColor: '#F8FAF8', borderRadius: 10, marginHorizontal: 4,
    },
    summaryValue: { fontSize: 20, fontWeight: '800', color: '#1B5E20' },
    summaryLabel: { fontSize: 10, color: '#888', marginTop: 2, fontWeight: '500' },
    summaryTotal: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    summaryTotalLabel: { fontSize: 14, color: '#666' },
    summaryTotalValue: { fontSize: 18, fontWeight: '800', color: '#1B5E20' },

    // Filter
    filterContainer: {
        marginHorizontal: 20, marginTop: 16,
    },
    filterLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
    filterRow: { flexDirection: 'row', gap: 8 },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, backgroundColor: '#FFF',
        borderWidth: 1, borderColor: '#E0E0E0',
    },
    filterChipActive: {
        backgroundColor: '#1B5E20', borderColor: '#1B5E20',
    },
    filterChipText: { fontSize: 12, fontWeight: '600', color: '#666' },
    filterChipTextActive: { color: '#FFF' },

    // Download Section
    downloadSection: {
        marginHorizontal: 20, marginTop: 20,
    },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 10 },
    downloadRow: { flexDirection: 'row', gap: 12 },
    downloadBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 14, borderRadius: 14,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    pdfBtn: { backgroundColor: '#C62828' },
    excelBtn: { backgroundColor: '#1B5E20' },
    downloadBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

    // Backup Section (future)
    backupSection: {
        marginHorizontal: 20, marginTop: 20, backgroundColor: '#FFF',
        borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0',
    },
    backupTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 4 },
    backupSubtitle: { fontSize: 12, color: '#999', marginBottom: 12 },
    backupBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, paddingVertical: 14, borderRadius: 14,
        backgroundColor: '#4285F4',
        ...Platform.select({
            ios: { shadowColor: '#4285F4', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    backupBtnDisabled: { backgroundColor: '#CCC' },
    backupBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

    // Auto backup toggle
    autoBackupRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    autoBackupLabel: { fontSize: 13, color: '#555', fontWeight: '600' },
    autoBackupBadge: {
        backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    autoBackupBadgeText: { fontSize: 10, color: '#E65100', fontWeight: '700' },

    // Data preview
    previewSection: {
        marginHorizontal: 20, marginTop: 20, marginBottom: 100,
    },
    previewHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10,
    },
    previewCount: { fontSize: 12, color: '#999' },
    previewCard: {
        backgroundColor: '#FFF', borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 8,
    },
    previewName: { fontSize: 14, fontWeight: '700', color: '#333' },
    previewDetail: { fontSize: 12, color: '#888', marginTop: 2 },
    previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    previewAmount: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '700' },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
});
