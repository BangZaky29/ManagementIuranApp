import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: {
    name: React.ComponentProps<typeof Ionicons>['name'];
    size?: number;
    color: string;
    style?: StyleProp<ViewStyle>;
}) {
    return <Ionicons name={name} size={size} color={color} style={style} />;
}
