import { createStackNavigator } from '@react-navigation/stack';
import BabyScreen from '../pages/baby';
export default function BabyNav() {
    const BabyNav=createStackNavigator();
    return(
        <BabyNav.Navigator
            screenOptions={{
                headerShown:false,
            }}
        >
            <BabyNav.Screen name="BabyPage" component={BabyScreen} />
        </BabyNav.Navigator>
    )
}