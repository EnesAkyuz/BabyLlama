import { createStackNavigator } from '@react-navigation/stack';
import BabyScreen from '../pages/baby';
import RecordAudio from '../pages/audiorecord';
export default function BabyNav() {
    const BabyNav=createStackNavigator();
    return(
        <BabyNav.Navigator
            screenOptions={{
                headerShown:false,
            }}
        >
            <BabyNav.Screen name="BabyPage" component={BabyScreen} />
            <BabyNav.Screen name='RecordAudio' component={RecordAudio}/>
        </BabyNav.Navigator>
    )
}