import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export const ReportDetailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
        color: Colors.green4,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },
    description: {
        fontSize: 15,
        color: Colors.textPrimary,
        lineHeight: 22,
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: Colors.green1,
    },

    // Timeline
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 16,
    },
    timelineContainer: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        paddingBottom: 0,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
        width: 16,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 1,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#E0E0E0',
        marginTop: 4,
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 2,
    },
    timelineDate: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    timelineDesc: {
        fontSize: 13,
        color: Colors.textPrimary,
        lineHeight: 18,
    },
});
