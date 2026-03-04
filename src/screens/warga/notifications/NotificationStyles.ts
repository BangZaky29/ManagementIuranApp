import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerRight: {
        paddingRight: 16,
    },
    markAllText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1.5,
        borderLeftWidth: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contentContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    dateText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    bodyText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    // Filter Styles
    filterContainer: {
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
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
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: colors.textWhite,
    },
    // Footer Styles
    footerContainer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loadMoreButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: colors.primarySubtle,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    loadMoreText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    showLessButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: colors.surfaceSubtle,
    },
    showLessText: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 13,
    }
});
