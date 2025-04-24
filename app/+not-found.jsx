import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { TailwindProvider } from 'tailwindcss-react-native';

export default function NotFoundScreen() {
  return (
    <TailwindProvider platform="native">
      <>
        <Stack.Screen options={{ title: 'Oops!' }} />
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-xl font-bold text-center">
            This screen doesn't exist.
          </Text>
          <Link href="/" className="mt-4 py-4">
            <Text className="text-teal-500 text-lg text-center">
              Go to home screen!
            </Text>
          </Link>
        </View>
      </>
    </TailwindProvider>
  );
}