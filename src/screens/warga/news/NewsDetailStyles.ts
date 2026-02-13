import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const NewsDetailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.green1,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 100,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.green2,
        borderRadius: 20,
        marginBottom: 16,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.green5,
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
        color: Colors.green4,
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.green2,
        marginBottom: 24,
        opacity: 0.5,
    },
    content: {
        fontSize: 16,
        color: Colors.textPrimary,
        lineHeight: 26,
    },
});
