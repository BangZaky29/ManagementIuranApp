import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const ReportDetailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: Colors.green5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.green5,
        marginBottom: 8,
        lineHeight: 32,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    categoryIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.green1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    category: {
        fontSize: 14,
        color: Colors.green4,
        fontWeight: '700',
    },
    description: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 24,
        marginBottom: 24,
    },
    imageContainer: {
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        backgroundColor: '#F9FAFB',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 4 },
        }),
    },
    image: {
        width: '100%',
        backgroundColor: '#F3F4F6',
    },

    // Timeline
    timelineSection: {
        marginTop: 8,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.green5,
        marginLeft: 8,
    },
    timelineWrapper: {
        backgroundColor: '#F9FAFB',
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    timelineItem: {
        flexDirection: 'row',
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: 16,
        width: 30,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: Colors.white,
    },
    dotActive: {
        backgroundColor: Colors.green3,
        shadowColor: Colors.green3,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    dotInactive: {
        backgroundColor: '#E5E7EB',
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#E5E7EB',
        position: 'absolute',
        top: 20,
        bottom: 0,
    },
    lineActive: {
        backgroundColor: Colors.green3,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 32,
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Change to flex-start for multi-line titles
        marginBottom: 6,
    },
    timelineTitle: {
        flex: 1, // Allow title to take available space and wrap
        fontSize: 15, // Slightly smaller for better fit
        fontWeight: '700',
        color: Colors.green5,
        marginRight: 12, // Gap between title and date
    },
    timelineDate: {
        fontSize: 10, // Slightly smaller
        color: '#9CA3AF',
        fontWeight: '600',
        marginTop: 2, // Align better with top of title
    },
    timelineDesc: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
    },
    rejectionReasonBox: {
        marginTop: 12,
        backgroundColor: '#FEF2F2',
        padding: 14,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.danger,
    },
    rejectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    rejectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.danger,
        marginLeft: 6,
    },
    rejectionText: {
        fontSize: 13,
        color: '#334155',
        lineHeight: 18,
        fontWeight: '500',
    },
    proofButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#DCFCE7',
        alignSelf: 'flex-start',
    },
    proofButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.green5,
        marginLeft: 8,
    },
});
