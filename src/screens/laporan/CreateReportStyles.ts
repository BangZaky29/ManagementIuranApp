import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export const CreateReportStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    content: {
        padding: 20,
    },
    formCard: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 24,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: Colors.green5,
        marginBottom: 8,
        fontWeight: '600',
        paddingLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.green5,
        backgroundColor: '#FAFAFA',
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    dropdownList: {
        marginTop: 8,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.green2,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 14,
        color: Colors.green5,
    },
    textArea: {
        minHeight: 120,
    },
    uploadArea: {
        borderWidth: 1,
        borderColor: Colors.green3,
        borderStyle: 'dashed',
        borderRadius: 12,
        height: 120,
        backgroundColor: '#F1F8E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 13,
        color: Colors.green4,
    },
});
