import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
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
        backgroundColor: colors.surfaceSubtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.textPrimary,
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
        backgroundColor: colors.primarySubtle,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    category: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '700',
    },
    description: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 24,
        marginBottom: 24,
    },
    imageContainer: {
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceSubtle,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 4 },
        }),
    },
    image: {
        width: '100%',
        backgroundColor: colors.surfaceSubtle,
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
        color: colors.textPrimary,
        marginLeft: 8,
    },
    timelineWrapper: {
        backgroundColor: colors.surface,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
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
        borderColor: colors.surface,
    },
    dotActive: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    dotInactive: {
        backgroundColor: colors.border,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: colors.border,
        position: 'absolute',
        top: 20,
        bottom: 0,
    },
    lineActive: {
        backgroundColor: colors.primary,
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
        color: colors.textPrimary,
        marginRight: 12, // Gap between title and date
    },
    timelineDate: {
        fontSize: 10, // Slightly smaller
        color: colors.textSecondary,
        fontWeight: '600',
        marginTop: 2, // Align better with top of title
    },
    timelineDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    rejectionReasonBox: {
        marginTop: 12,
        backgroundColor: colors.dangerBg,
        padding: 14,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: colors.danger,
    },
    rejectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    rejectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.danger,
        marginLeft: 6,
    },
    rejectionText: {
        fontSize: 13,
        color: colors.textPrimary,
        lineHeight: 18,
        fontWeight: '500',
    },
    proofButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.successBg,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignSelf: 'flex-start',
    },
    proofButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.success,
        marginLeft: 8,
    },
});
