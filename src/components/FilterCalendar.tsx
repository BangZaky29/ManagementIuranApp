import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface FilterCalendarProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (date: Date) => void;
    selectedDate: Date | null;
}

export const FilterCalendar: React.FC<FilterCalendarProps> = ({ visible, onClose, onSelectDate, selectedDate }) => {
    const [viewYear, setViewYear] = useState((selectedDate || new Date()).getFullYear());

    const handlePrevYear = () => setViewYear(viewYear - 1);
    const handleNextYear = () => setViewYear(viewYear + 1);

    const handleMonthClick = (monthIndex: number) => {
        // Create date for 1st of selected month/year
        const newDate = new Date(viewYear, monthIndex, 1);
        onSelectDate(newDate);
        onClose();
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    const renderMonthGrid = () => {
        return monthNames.map((month, index) => {
            const isSelected = selectedDate &&
                selectedDate.getMonth() === index &&
                selectedDate.getFullYear() === viewYear;

            return (
                <TouchableOpacity
                    key={index}
                    style={[styles.monthCell, isSelected && styles.selectedMonth]}
                    onPress={() => handleMonthClick(index)}
                >
                    <Text style={[styles.monthText, isSelected && styles.selectedMonthText]}>{month}</Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handlePrevYear}>
                            <Ionicons name="chevron-back" size={24} color={Colors.green5} />
                        </TouchableOpacity>
                        <Text style={styles.yearTitle}>{viewYear}</Text>
                        <TouchableOpacity onPress={handleNextYear}>
                            <Ionicons name="chevron-forward" size={24} color={Colors.green5} />
                        </TouchableOpacity>
                    </View>

                    {/* Grid */}
                    <View style={styles.grid}>
                        {renderMonthGrid()}
                    </View>

                    {/* Footer */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Tutup</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 320,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    yearTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    monthCell: {
        width: '30%',
        aspectRatio: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.green1,
        backgroundColor: '#FAFAFA',
    },
    selectedMonth: {
        backgroundColor: Colors.green3,
        borderColor: Colors.green3,
    },
    monthText: {
        fontSize: 14,
        color: Colors.green5,
        fontWeight: '500',
    },
    selectedMonthText: {
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 10,
        alignItems: 'center',
        padding: 10,
    },
    closeText: {
        color: Colors.textSecondary,
        fontWeight: '500',
    }
});
