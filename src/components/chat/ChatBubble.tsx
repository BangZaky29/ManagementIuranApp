import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
                <Text style={[
                    styles.messageText,
                    { color: isOwnMessage ? colors.textWhite : colors.textPrimary }
                ]}>
                    {message}
                </Text>
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
});
