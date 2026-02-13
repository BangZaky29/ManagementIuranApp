import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const HistoryStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50, // Increased top padding
        paddingBottom: 15,
        backgroundColor: Colors.green1,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    filterContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: Colors.green5,
        ...Platform.select({
            web: {
                outlineWidth: 0,
            }
        }),
    },
    filterRow: {
        flexDirection: 'row',
        gap: 10,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.green2,
        backgroundColor: Colors.white,
    },
    filterButtonActive: {
        backgroundColor: Colors.green5,
        borderColor: Colors.green5,
    },
    filterText: {
        fontSize: 12,
        color: Colors.green5,
        fontWeight: '600',
    },
    filterTextActive: {
        color: Colors.white,
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: Colors.green4,
        marginTop: 10,
    },

    // Item Styles (Refined for Card Look)
    itemContainer: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
            }
        }),
    },
    itemPeriod: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 2,
    },
    itemDate: {
        fontSize: 12,
        color: Colors.green4,
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
        textAlign: 'right',
        marginBottom: 2,
    },
    itemStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
    },

    // Expanded View Styles
    expandedContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: Colors.green4, // Secondary text
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.green5,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingVertical: 12,
        backgroundColor: '#F1F8E9', // Light green background
        borderRadius: 12,
        width: '100%',
    },
    downloadText: {
        fontSize: 14,
        color: Colors.green5,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
