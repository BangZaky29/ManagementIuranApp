import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4,
        opacity: 0.6
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        backgroundColor: colors.surface,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    settingLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    settingSubLabel: { fontSize: 13, opacity: 0.7, lineHeight: 18 },
    subSectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
        marginLeft: 4,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'stretch', // Membuat isi kiri dan tombol play sama tinggi
        marginBottom: 10,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        minHeight: 64,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        flex: 1,
    },
    optionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        flexShrink: 1
    },
    playButton: {
        width: 54,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.05)',
    },
    infoBox: {
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    infoText: { flex: 1, fontSize: 13, lineHeight: 18, opacity: 0.7 },
    overlayContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000
    },
    loadingToast: {
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    overlayText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
    sosSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 12,
        marginLeft: 4,
        gap: 8
    },
    durationContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    durationLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4
    },
    durationPresets: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8
    },
    durationChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent'
    },
    durationChipText: {
        fontSize: 14,
        fontWeight: '600'
    }
});