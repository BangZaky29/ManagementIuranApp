import { StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const PaymentDetailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: Colors.green1,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 12,
    },
    billPeriod: {
        fontSize: 14,
        color: Colors.green4,
        marginBottom: 8,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    rowLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.green5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green3,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        marginLeft: 8,
        color: '#E65100',
        fontSize: 13,
    },
    methodContainer: {
        gap: 12,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    methodActive: {
        borderColor: Colors.green3,
        backgroundColor: '#F1F8E9',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.green4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.green3,
    },
    methodName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    methodDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    footerTotal: {
        flex: 1,
    },
    footerLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    footerAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
    },
});
