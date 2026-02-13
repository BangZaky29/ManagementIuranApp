import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

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
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: Colors.green3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: Colors.green3,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
        width: '100%',
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.green2,
        marginHorizontal: 4,
    },
    stepDotActive: {
        backgroundColor: Colors.primary,
        width: 20,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },

    // Verified User Card
    verifiedCard: {
        backgroundColor: Colors.green1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    verifiedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    verifiedTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
        marginLeft: 8,
    },
    verifiedRow: {
        marginBottom: 8,
    },
    verifiedLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    verifiedValue: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    roleBadge: {
        backgroundColor: Colors.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    roleBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },

    button: {
        marginTop: 16,
        marginBottom: 16,
    },
    backToLoginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    backToLoginText: {
        color: Colors.textSecondary,
        marginRight: 4,
    },
    loginLink: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    passwordStrengthContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingLeft: 4,
    },
    passwordStrengthText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    passwordStrengthValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    inputHelper: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 4,
        marginBottom: 12,
        marginTop: -8,
        fontStyle: 'italic',
    }
});
