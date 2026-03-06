import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/AppTheme';

interface ChatBubbleProps {
    id: string;
    message: string;
    isOwnMessage: boolean;
    time: string;
    senderName?: string;
    status?: 'sending' | 'sent' | 'read';
    onImagePress?: (imageUrl: string) => void;

    // V6 Features
    onLongPress?: (id: string, message: string, isOwnMessage: boolean) => void;
    onPress?: (id: string) => void;
    isSelected?: boolean;
    isSelectionMode?: boolean;
    isEdited?: boolean;

    colors: ThemeColors;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
    id, message, isOwnMessage, time, senderName, status, onImagePress,
    onLongPress, onPress, isSelected, isSelectionMode, isEdited, colors
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={() => onLongPress && onLongPress(id, message, isOwnMessage)}
            onPress={() => onPress && onPress(id)}
            style={[
                styles.container,
                { backgroundColor: isSelected ? (isOwnMessage ? 'rgba(0, 150, 136, 0.2)' : 'rgba(0,0,0,0.05)') : 'transparent' },
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
            ]}
        >
            {isSelectionMode && (
                <View style={styles.selectionCheckmark}>
                    <Ionicons
                        name={isSelected ? "checkmark-circle" : "radio-button-off"}
                        size={24}
                        color={isSelected ? colors.primary : colors.textSecondary}
                    />
                </View>
            )}
            <View style={[
                styles.bubble,
                {
                    backgroundColor: isOwnMessage ? colors.primary : colors.surfaceSubtle,
                    borderBottomRightRadius: isOwnMessage ? 0 : 16,
                    borderBottomLeftRadius: isOwnMessage ? 16 : 0,
                    marginLeft: isSelectionMode ? (!isOwnMessage ? 34 : 0) : 0,
                }
            ]}>
                {!isOwnMessage && senderName && (
                    <Text style={[styles.senderName, { color: colors.primary }]}>
                        {senderName}
                    </Text>
                )}

                {message.startsWith('[IMAGE]') ? (
                    <TouchableOpacity onPress={() => {
                        const url = message.replace('[IMAGE]', '');
                        if (onImagePress) {
                            onImagePress(url);
                        } else {
                            Linking.openURL(url);
                        }
                    }}>
                        <Image
                            source={{ uri: message.replace('[IMAGE]', '') }}
                            style={styles.imageContent}
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                ) : message.startsWith('[DOCUMENT]') ? (
                    <TouchableOpacity
                        onPress={() => Linking.openURL(message.replace('[DOCUMENT]', '').split('|')[0])}
                        style={[styles.documentContent, { backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <View style={[styles.documentIconContainer, { backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.08)' }]}>
                            <Ionicons name="document-text" size={24} color={isOwnMessage ? colors.textWhite : colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.documentText, { color: isOwnMessage ? colors.textWhite : colors.textPrimary }]} numberOfLines={1}>
                                {message.replace('[DOCUMENT]', '').split('|')[1] || 'Dokumen Terlampir'}
                            </Text>
                            <Text style={{ fontSize: 11, color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.textSecondary, marginTop: 2 }}>
                                Ketuk untuk membuka file
                            </Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <Text style={[
                        styles.messageText,
                        { color: isOwnMessage ? colors.textWhite : colors.textPrimary }
                    ]}>
                        {message}
                    </Text>
                )}

                <View style={styles.timeContainer}>
                    {isEdited && (
                        <Text style={[
                            styles.editedText,
                            { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                        ]}>
                            (Diedit)
                        </Text>
                    )}
                    <Text style={[
                        styles.timeText,
                        { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                    ]}>
                        {time}
                    </Text>
                    {isOwnMessage && status && (
                        <View style={{ marginLeft: 4 }}>
                            {status === 'sending' && (
                                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
                            )}
                            {status === 'sent' && (
                                <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.7)" />
                            )}
                            {status === 'read' && (
                                <Ionicons name="checkmark-done" size={14} color="#4FC3F7" />
                            )}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        marginVertical: 4,
        flexDirection: 'row',
    },
    ownMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },
    selectionCheckmark: {
        position: 'absolute',
        left: 16,
        alignSelf: 'center',
        zIndex: 10,
    },
    bubble: {
        maxWidth: '80%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    senderName: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    timeText: {
        fontSize: 11,
    },
    editedText: {
        fontSize: 10,
        fontStyle: 'italic',
        marginRight: 4,
    },
    imageContent: {
        width: 220,
        height: 220,
        borderRadius: 8,
        marginVertical: 4,
    },
    documentContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        marginVertical: 4,
        width: 240,
    },
    documentIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    documentText: {
        fontSize: 14,
        fontWeight: 'bold',
    }
});
