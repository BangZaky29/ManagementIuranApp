import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    // Billing Card
    billingCard: {
        padding: 20,
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
            }
        }),
    },
    billingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Changed from flex-start to center
        marginBottom: 10,
    },
    monthText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    amountText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    methodContainer: {
        marginTop: 15,
        marginBottom: 15,
    },
    methodLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    methodSelector: {
        flexDirection: 'row',
        gap: 10,
    },
    methodButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
    methodButtonActive: {
        backgroundColor: colors.primarySubtle,
        borderColor: colors.primary,
        borderWidth: 1.5,
    },
    methodButtonText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },

    // History Section
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 5,
    },

    historyItem: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    historyMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    historyPeriod: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    historyAmount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'right',
        marginBottom: 4,
    },
    historyStatus: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'right',
    },

    // Expanded Details
    expandedContainer: {
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    detailLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 8,
        backgroundColor: colors.primarySubtle,
        borderRadius: 8,
    },
    downloadText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 12,
    },
    summaryCard: {
        backgroundColor: colors.primary,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        // Premium Shadow
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 15,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    summaryMonth: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryTotal: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 6,
    },
    summaryLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    dueDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
    },
    dueDateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    selectAllText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '700',
    },
    feeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.surface,
    },
    feeCardContainer: {
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    feeCardSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    feeCardPaid: {
        opacity: 0.7,
        backgroundColor: colors.background,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    itemCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
    },
    feeInfo: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
    },
    feeName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    feeMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    feeStatus: {
        fontSize: 12,
        fontWeight: '500',
    },
    feeAmount: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.primary,
    },
    expandedBox: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    itemsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    itemStatusLabel: {
        fontSize: 11,
        marginTop: 2,
        opacity: 0.7,
    },
    itemAmountText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 4,
    },
    periodCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    periodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
    },
    periodMonth: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    periodStatus: {
        fontSize: 12,
    },
    periodAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.primary,
    },
    historyItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    historyItemSub: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 2,
    },
    payContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    payInfo: {
        flex: 1,
        marginLeft: 8,
    },
    payInfoLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    payInfoAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
    },
    payBtn: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 18,
    },
    payBtnDisabled: {
        backgroundColor: colors.border,
        opacity: 0.5,
    },
    payBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: colors.surface,
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.textPrimary,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
});
