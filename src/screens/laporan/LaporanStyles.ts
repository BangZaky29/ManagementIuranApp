import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

export const LaporanStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },

    // Filters
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    filterTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    filterTabActive: {
        backgroundColor: Colors.green5,
        borderColor: Colors.green5,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.green5,
    },
    filterTextActive: {
        color: Colors.white,
    },

    // Report List
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
            }
        }),
    },
    reportIconCard: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F8E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 4,
    },
    reportMeta: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.green3,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: Colors.green3,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(120, 197, 28, 0.4)',
                cursor: 'pointer',
            }
        }),
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: Colors.textSecondary,
    },
});
