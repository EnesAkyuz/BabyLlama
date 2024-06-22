import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../pages/dashboard';
import ChatScreen from '../pages/chatwGPT';
import NotificationsScreen from '../pages/notifications';
export default function DashboardNav() {
    const DashboardStack=createStackNavigator();
    return(
        <DashboardStack.Navigator
            screenOptions={{
                headerShown:false,
            }}
        >
            <DashboardStack.Screen name="DashboardPage" component={DashboardScreen} />
            <DashboardStack.Screen name="Notifications" component={NotificationsScreen} />
            <DashboardStack.Screen name="ChatWGPT" component={ChatScreen} />
          </DashboardStack.Navigator>
    )
}