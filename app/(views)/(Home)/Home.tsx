import SalesChart from '@/components/Home/SalesChart';
import TopProductList from '@/components/Home/TopProductList';
import { View, ScrollView } from 'react-native';

export default function HomeScree() {
  return (
    <View className="flex-1 bg-[#F9F8FD] justify-center">
      <ScrollView className='mt-16'>
        <SalesChart />
        <TopProductList />
      </ScrollView>
    </View>
  );
};

