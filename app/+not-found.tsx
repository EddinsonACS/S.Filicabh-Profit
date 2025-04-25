import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { TailwindProvider } from 'tailwindcss-react-native';

export default function NotFoundScreen(): JSX.Element {
  return (
    <TailwindProvider platform="native">
      <>
        <Stack.Screen options={{ title: 'Oops!' }} />
        <View className="flex-1 bg-[#F9F8FD] justify-center items-center p-5">
          <Text className="text-xl font-bold text-center">
            Esta Pagina no Existe.
          </Text>
          <Link href="/" className="mt-4 py-4">
            <Text className="text-blue-600 text-lg text-center">
              Vuelve al Inicio!
            </Text>
          </Link>
        </View>
      </>
    </TailwindProvider>
  );
}