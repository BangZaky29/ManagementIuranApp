import { Redirect } from 'expo-router';

export default function SecurityIndex() {
    return <Redirect href="/security/(tabs)" />;
}
