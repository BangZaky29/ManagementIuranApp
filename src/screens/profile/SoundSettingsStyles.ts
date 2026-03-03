import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants/Colors';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20 },
    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12
    },
    settingLabel: { fontSize: 16, fontWeight: '600' },
    settingSubLabel: { fontSize: 13, marginTop: 2 },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 4,
        opacity: 0.7
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 1,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        flex: 1,
    },
    optionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionLabel: { fontSize: 15 },
    playButton: {
        paddingHorizontal: 15,
        height: '100%',
        justifyContent: 'center',
        borderLeftWidth: 1,
        backgroundColor: '#00000005'
    },
    infoBox: {
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
        marginBottom: 40
    },
    infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
    overlayContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 999
    },
    loadingToast: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    overlayText: { color: '#FFF', fontWeight: 'bold' },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16
    }
});
