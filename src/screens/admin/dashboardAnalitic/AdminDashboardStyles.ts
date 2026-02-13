import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../../constants/Colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
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
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        width: (width - 50) / 2, // 2 columns with spacing
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
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    cardCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: Colors.green4, // Using a subtly colored text for subtitle
        fontWeight: '500',
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
});
