import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

export const IuranStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    // Billing Card
    billingCard: {
        padding: 20,
        backgroundColor: Colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.green2,
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: Colors.green3,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(120, 197, 28, 0.15)',
            }
        }),
    },
    billingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    monthText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    amountText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.green5,
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
        color: Colors.green4,
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
        borderColor: Colors.green2,
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    methodButtonActive: {
        backgroundColor: '#F1F8E9',
        borderColor: Colors.green3,
        borderWidth: 1.5,
    },
    methodButtonText: {
        fontSize: 12,
        color: Colors.green5,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    historyItem: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
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
        color: Colors.green5,
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    historyAmount: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.green5,
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
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    detailLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 8,
        backgroundColor: Colors.green1,
        borderRadius: 8,
    },
    downloadText: {
        fontSize: 12,
        color: Colors.green5,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
});
