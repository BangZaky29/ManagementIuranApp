import { StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerRight: {
        paddingRight: 16,
    },
    markAllText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
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
        color: Colors.textPrimary,
        flex: 1,
        marginRight: 8,
    },
    dateText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    bodyText: {
        fontSize: 14,
        color: Colors.textSecondary,
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
        color: Colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
