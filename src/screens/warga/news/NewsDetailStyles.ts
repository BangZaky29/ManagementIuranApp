import { StyleSheet, Platform, StatusBar } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 100,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: colors.primarySubtle,
        borderRadius: 20,
        marginBottom: 16,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
        lineHeight: 32,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    date: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 24,
        opacity: 0.5,
    },
    content: {
        fontSize: 16,
        color: colors.textPrimary,
        lineHeight: 26,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
