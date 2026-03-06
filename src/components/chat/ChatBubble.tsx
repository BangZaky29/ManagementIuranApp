import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../theme/AppTheme';

interface ChatBubbleProps {
    message: string;
    isOwnMessage: boolean;
    time: string;
    senderName?: string;
    colors: ThemeColors;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isOwnMessage, time, senderName, colors }) => {
    return (
        <View style={[
            styles.container,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
        ]}>
            <View style={[
                styles.bubble,
                {
                    backgroundColor: isOwnMessage ? colors.primary : colors.surface,
                    borderBottomRightRadius: isOwnMessage ? 0 : 16,
                    borderBottomLeftRadius: isOwnMessage ? 16 : 0,
                }
            ]}>
                {!isOwnMessage && senderName && (
                    <Text style={[styles.senderName, { color: colors.primary }]}>
                        {senderName}
                    </Text>
                )}

                {message.startsWith('[IMAGE]') ? (
                    <TouchableOpacity onPress={() => Linking.openURL(message.replace('[IMAGE]', ''))}>
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
                        <Ionicons name="document-text" size={32} color={isOwnMessage ? colors.textWhite : colors.primary} />
                        <Text style={[styles.documentText, { color: isOwnMessage ? colors.textWhite : colors.textPrimary }]} numberOfLines={2}>
                            {message.replace('[DOCUMENT]', '').split('|')[1] || 'Dokumen'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={[
                        styles.messageText,
                        { color: isOwnMessage ? colors.textWhite : colors.textPrimary }
                    ]}>
                        {message}
                    </Text>
                )}

                <Text style={[
                    styles.timeText,
                    { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                ]}>
                    {time}
                </Text>
            </View>
        </View>
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
    timeText: {
        fontSize: 11,
        alignSelf: 'flex-end',
        marginTop: 4,
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
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
        width: 220,
    },
    documentText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    }
});
