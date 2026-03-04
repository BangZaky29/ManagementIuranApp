import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    subtitle: { fontSize: 13, color: colors.textSecondary },
    addButton: {
        backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6
    },
    addButtonText: { color: colors.textWhite, fontWeight: 'bold', fontSize: 13 },

    // Tab Bar
    tabBar: {
        flexDirection: 'row', paddingHorizontal: 16, backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 12
    },
    filterChip: {
        paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
        backgroundColor: colors.surfaceSubtle, marginRight: 10, borderWidth: 1, borderColor: colors.border
    },
    filterChipActive: {
        backgroundColor: colors.primarySubtle, borderColor: colors.primary
    },
    filterText: {
        fontSize: 14, color: colors.textSecondary, fontWeight: '600'
    },
    filterTextActive: {
        color: colors.primary, fontWeight: 'bold'
    },

    // Summary Card
    summaryCard: {
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
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
        backgroundColor: colors.border,
        marginHorizontal: 8,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // List
    listContainer: { padding: 16, paddingBottom: 100 },

    // Card
    card: {
        backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12,
        borderLeftWidth: 4, borderLeftColor: colors.status.selesai.text,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    guestName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    guestTypeBadge: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4, alignSelf: 'flex-start'
    },
    guestTypeText: { fontSize: 11, fontWeight: 'bold', color: colors.textWhite, textTransform: 'capitalize' },
    timeText: { fontSize: 12, color: colors.textSecondary },

    detailsRow: { flexDirection: 'row', marginTop: 16, backgroundColor: colors.surfaceSubtle, padding: 12, borderRadius: 12 },
    detailCol: { flex: 1 },
    detailLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
    detailValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },

    checkoutBtn: {
        backgroundColor: colors.danger + '1A', paddingVertical: 10, borderRadius: 10,
        alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center', gap: 6
    },
    checkoutBtnText: { color: colors.danger, fontWeight: 'bold', fontSize: 14 },

    // Empty State
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginTop: 16 },
    emptySubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '90%',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 20 },
    headerRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10
    },

    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
    input: {
        backgroundColor: colors.surfaceSubtle, borderRadius: 12, padding: 14,
        fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border
    },

    typeSelector: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    typeBtn: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border
    },
    typeBtnActive: { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
    typeText: { fontSize: 13, color: colors.textSecondary, textTransform: 'capitalize' },
    typeTextActive: { color: colors.primary, fontWeight: 'bold' },

    submitBtn: {
        backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12,
        alignItems: 'center', marginTop: 8
    },
    submitBtnText: { color: colors.textWhite, fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
    cancelBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },

    floatingAddBtn: {
        position: 'absolute',
        bottom: 90, // Above the tab bar
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
            android: { elevation: 6 },
        }),
    },

    // Resident Search Modal
    pickerButton: {
        backgroundColor: colors.surfaceSubtle, borderRadius: 12, padding: 14,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border
    },
    pickerButtonText: { fontSize: 15, color: colors.textPrimary },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surfaceSubtle, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
        marginBottom: 16, borderWidth: 1, borderColor: colors.border
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
    residentListItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.surfaceSubtle
    },
    residentAvatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySubtle,
        justifyContent: 'center', alignItems: 'center'
    },
    residentAvatarImg: {
        width: 40, height: 40, borderRadius: 20
    },
    residentName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    residentBlock: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

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
        backgroundColor: colors.surfaceSubtle,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center'
    },
    pinDigitBoxActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySubtle
    },
    pinDigitText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary
    },
    hiddenPinInput: {
        position: 'absolute',
        opacity: 0,
        width: '100%',
        height: '100%'
    },
    pinInfoText: {
        textAlign: 'center',
        color: colors.textSecondary,
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
        backgroundColor: colors.surfaceSubtle,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border
    },
    showMoreText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary
    }
});
