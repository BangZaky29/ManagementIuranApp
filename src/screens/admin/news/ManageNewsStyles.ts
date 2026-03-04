
import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Space for FAB
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Card
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryBadge: {
        backgroundColor: colors.primarySubtle,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 10,
        color: colors.primary,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    dateText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    contentPreview: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    imagePreview: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: colors.surfaceSubtle,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 12,
        padding: 4,
    },

    // FAB
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 100,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 100,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    formContainer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: colors.surfaceSubtle,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    imagePickerContainer: {
        position: 'relative',
        height: 180,
        backgroundColor: colors.surfaceSubtle,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderStyle: 'dashed',
        overflow: 'hidden',
        marginBottom: 8,
    },
    imagePickerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageActionOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        flexDirection: 'row',
        padding: 10,
        gap: 10,
    },
    imageActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    removeImageButton: {
        backgroundColor: 'rgba(255, 68, 68, 0.9)',
    },
    replaceImageButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    imageActionText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    checkboxLabel: {
        marginLeft: 12,
        fontSize: 16,
        color: colors.textPrimary,
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        color: colors.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        marginTop: 40,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 12,
    },
});
