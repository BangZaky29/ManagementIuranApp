import { StyleSheet, Platform, StatusBar } from 'react-native';
import { ThemeColors } from '../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        height: Platform.OS === 'android' ? 80 : 60,
        backgroundColor: colors.surface,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginLeft: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: colors.surfaceSubtle,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    filterTextActive: {
        color: colors.textWhite,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    reportCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
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
        borderBottomColor: colors.surfaceSubtle,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        backgroundColor: colors.primarySubtle,
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
        color: colors.textPrimary,
    },
    dateText: {
        fontSize: 11,
        color: colors.textSecondary,
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
        color: colors.textPrimary,
        marginBottom: 2,
    },
    reportDesc: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
    },
    imagePreview: {
        width: '100%',
        height: 180,
        marginTop: 10,
        borderRadius: 8,
        backgroundColor: colors.surfaceSubtle,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: colors.surfaceSubtle,
        padding: 8,
        borderRadius: 6,
    },
    locationText: {
        fontSize: 11,
        color: colors.primary,
        marginLeft: 4,
        flex: 1,
    },
    categoryTag: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primarySubtle,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8,
    },
    categoryText: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceSubtle,
        backgroundColor: colors.surface,
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
        backgroundColor: colors.primary,
    },
    btnGreen: {
        backgroundColor: colors.success,
    },
    btnText: {
        color: colors.textWhite,
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
        color: colors.textSecondary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#AAA',
        marginTop: 6,
    },
    loadMoreBtn: {
        backgroundColor: colors.surface,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 10,
        marginHorizontal: 16,
    },
    loadMoreText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    // Rejection UI
    rejectionBox: {
        marginTop: 10,
        backgroundColor: colors.danger + '10',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
    },
    rejectionLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.danger,
        marginBottom: 2,
    },
    rejectionText: {
        fontSize: 12,
        color: colors.textPrimary,
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
        backgroundColor: colors.surface,
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
        color: colors.textPrimary,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: colors.textPrimary,
        backgroundColor: colors.surfaceSubtle,
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
        backgroundColor: colors.surfaceSubtle,
    },
    btnConfirm: {
        backgroundColor: colors.danger,
    },
});
