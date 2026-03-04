import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dropdownText: {
        fontSize: 13,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    dropdownLabel: {
        fontSize: 10,
        color: colors.textSecondary,
        marginBottom: 2,
    },

    // Modal Selection
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
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
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    modalClose: {
        padding: 4,
    },
    modalItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    modalItemActive: {
        backgroundColor: colors.primarySubtle,
    },
    modalItemTextActive: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: colors.surface,
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
        color: colors.textPrimary,
        marginBottom: 2,
    },
    dateText: {
        fontSize: 10,
        color: colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        marginLeft: 8,
    },
    statusText: {
        color: colors.textWhite,
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
        color: colors.textPrimary,
        marginBottom: 4,
    },
    reportCategory: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: 8,
    },
    reportDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    reportImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 12,
        backgroundColor: colors.surfaceSubtle,
    },
    reportLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    locationText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
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
        color: colors.textWhite,
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
        color: colors.textSecondary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    headerBubble: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    bubbleText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    paginationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    paginationBtnText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
});
