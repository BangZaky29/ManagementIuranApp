import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 16,
        paddingBottom: 15,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    filterContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: colors.textPrimary,
        ...Platform.select({
            web: {
                outlineWidth: 0,
            }
        }),
    },
    filterRow: {
        flexDirection: 'row',
        gap: 10,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    filterTextActive: {
        color: colors.textWhite,
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: colors.textSecondary,
        marginTop: 10,
    },

    // Item Styles (Refined for Card Look)
    itemContainer: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
            }
        }),
    },
    itemPeriod: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    itemDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'right',
        marginBottom: 2,
    },
    itemStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
    },

    // Expanded View Styles
    expandedContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingVertical: 12,
        backgroundColor: colors.primarySubtle,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.primary + '20',
    },
    downloadText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
