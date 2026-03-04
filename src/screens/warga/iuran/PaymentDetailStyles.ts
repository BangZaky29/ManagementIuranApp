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
        paddingTop: Platform.OS === 'android' ? 50 : 20,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    content: {
        padding: 20,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    billPeriod: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 8,
        fontWeight: '600',
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
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
            }
        })
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    rowLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primarySubtle,
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.primary + '20', // subtle border
    },
    infoText: {
        marginLeft: 8,
        color: colors.primary,
        fontSize: 13,
        flex: 1,
    },
    methodContainer: {
        gap: 12,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    methodActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySubtle,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    methodInfo: {
        flex: 1,
        marginLeft: 12,
    },
    methodName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    methodDesc: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 20,
            }
        })
    },
    footerTotal: {
        flex: 1,
    },
    footerLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    footerAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    backBtn: {
        padding: 8,
        marginRight: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrThumb: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: colors.background,
    },
    methodHolder: {
        fontSize: 11,
        color: colors.primary,
        fontWeight: '500',
        marginTop: 2,
    },
    radioChecked: {
        borderColor: colors.primary,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMethod: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emptyMethodTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: 10,
    },
    emptyMethodSub: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    }
});
