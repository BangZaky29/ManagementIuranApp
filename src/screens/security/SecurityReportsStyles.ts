import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '../../constants/Colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        height: Platform.OS === 'android' ? 80 : 60,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0D47A1',
        marginLeft: 12,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#0D47A1',
    },
    filterText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFF',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    reportCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 10,
    },
    userName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    dateText: {
        fontSize: 11,
        color: '#999',
        marginTop: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardBody: {
        padding: 12,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    reportDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    imagePreview: {
        width: '100%',
        height: 180,
        marginTop: 10,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#F8F9FA',
        padding: 8,
        borderRadius: 6,
    },
    locationText: {
        fontSize: 11,
        color: '#0D47A1',
        marginLeft: 4,
        flex: 1,
    },
    categoryTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8EAF6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8,
    },
    categoryText: {
        fontSize: 10,
        color: '#3F51B5',
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        backgroundColor: '#FAFBFC',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    btnBlue: {
        backgroundColor: '#0D47A1',
    },
    btnGreen: {
        backgroundColor: '#2E7D32',
    },
    btnText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#999',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#AAA',
        marginTop: 6,
    },
});
