import { createStackNavigator } from '@react-navigation/stack';
import ParentScreen from '../pages/parent';
import ChatScreenYou from '../pages/chatWYou';
export default function ParentNav() {
    const ParentStack=createStackNavigator();
    return(
        <ParentStack.Navigator
            screenOptions={{
                headerShown:false,
            }}
        >
            <ParentStack.Screen name="ParentPage" component={ParentScreen} />
            <ParentStack.Screen name="Journal" component={ChatScreenYou} />
          </ParentStack.Navigator>
    )
}