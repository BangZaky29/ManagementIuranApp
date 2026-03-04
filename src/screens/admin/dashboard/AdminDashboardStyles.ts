import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../../../theme/AppTheme';

const { width } = Dimensions.get('window');

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    welcomeSection: {
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        width: (width - 50) / 2,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        flexDirection: 'column',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    cardCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '500',
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
});
