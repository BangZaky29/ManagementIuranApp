import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
    },
    topCircle: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: Colors.green2,
        opacity: 0.4,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        elevation: 2,
    },
    titleContainer: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    subtitleText: {
        fontSize: 14,
        color: Colors.green4,
    },

    // Step Indicator
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.green2,
    },
    stepDotActive: {
        backgroundColor: Colors.primary,
        width: 24, // Elongated when active
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: Colors.green2,
        marginHorizontal: 8,
    },
    stepLineActive: {
        backgroundColor: Colors.primary,
    },

    formContainer: {
        width: '100%',
    },
    infoBox: {
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    actionButton: {
        marginTop: 16,
        marginBottom: 16,
    },

    // Verified User Card
    verifiedCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.green2,
        shadowColor: Colors.green3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    verifiedTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 8,
    },
    verifiedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    verifiedLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    verifiedValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'right',
        flex: 1,
        marginLeft: 8,
    },
    roleBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },

    backStepButton: {
        alignItems: 'center',
        padding: 10,
    },
    backStepText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },

    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    loginText: {
        color: Colors.textSecondary,
        fontSize: 15,
    },
    loginLink: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
});
