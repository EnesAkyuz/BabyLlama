import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DashboardNav from './navigation/dashboardNav';
import ParentNav from './navigation/parentNav';
import BabyNav from './navigation/babyNav';

export default function App() {
  const Tab = createBottomTabNavigator();
  const dashboardName = "Dashboard";
  const parentName = "Parent";
  const babyName = 'Baby';

  return (
    <NavigationContainer>
            <Tab.Navigator
        initialRouteName={dashboardName}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let rn = route.name;

            if (rn === dashboardName) {
              iconName = focused ? 'home' : 'home-outline';

            } else if (rn === parentName) {
              iconName = focused ? 'book' : 'book-outline';
            } else if (rn === babyName) {
              iconName=focused?'body' : 'body-outline'
            }      
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor:'#7455f6', 
          tabBarInactiveTintColor:"black",
          tabBarLabelStyle:{
            paddingBottom: 5,
            fontSize: 10
          },
          tabBarStyle:[
            {
              display: 'flex'
            },
            null
          ], 
          headerShown:false,
        })}>

        <Tab.Screen name={dashboardName} component={DashboardNav} />
        <Tab.Screen name={babyName} component={BabyNav} />
        <Tab.Screen name={parentName} component={ParentNav} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
