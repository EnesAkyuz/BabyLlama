import { TextInput, View, TouchableOpacity,Button, Text, SafeAreaView, StyleSheet, Alert  } from "react-native"
import { useState } from "react"
import notifications from "../db/notifications.json"

export default function NotificationsScreen({ navigation }) { 
    const [tab, setTab] = useState('Notifications');
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [frequency, setFrequency] = useState('');
//     const saveNotification = async () => {
//     const newNotification = {
//       title,
//       time,
//       frequency,
//     };

//     try {
//       const path = `${RNFS.DocumentDirectoryPath}/db/new_notifications.json`;
//       let notifications = [];

//       // Check if the file exists
//       const fileExists = await RNFS.exists(path);

//       if (fileExists) {
//         // Read existing notifications
//         const fileContents = await RNFS.readFile(path);
//         notifications = JSON.parse(fileContents);
//       }

//       // Add new notification
//       notifications.push(newNotification);

//       // Save updated notifications back to file
//       await RNFS.writeFile(path, JSON.stringify(notifications, null, 2));
//       Alert.alert('Success', 'Notification saved successfully');

//       // Clear the form
//       setTitle('');
//       setTime('');
//       setFrequency('');
//     } catch (error) {
//       console.error('Failed to save notification', error);
//       Alert.alert('Error', 'Failed to save notification');
//     }
//   };
    return (
        <SafeAreaView>
            <View style={styles.tabs}>
            <TouchableOpacity onPress={()=>setTab('Notifications')}>
                <Text style={tab==='Notifications'?styles.textSelected:styles.text}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setTab('Reminder')}>
                <Text style={tab==='Reminder'?styles.textSelected:styles.text}>Set a reminder</Text>
                </TouchableOpacity>
            </View>
            {
                tab === 'Notifications' && notifications.map((notification) => {
                    return(
                    <TouchableOpacity style={styles.taskContainer} key={notification.id}>
                    <Text style={styles.taskText}>{notification.description}</Text>
                    </TouchableOpacity>)
                })
            }
            {tab === 'Reminder' && 
                <View>
        <Text style={styles.label}>Notification Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter notification title"
            />

            <Text style={styles.label}>Time</Text>
            <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="Enter time"
            />

            <Text style={styles.label}>Repeat Frequency</Text>
            <TextInput
                style={styles.input}
                value={frequency}
                onChangeText={setFrequency}
                placeholder="Enter repeat frequency"
            />

            <Button title="Save Notification" />
                        </View>
                    }

        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    tabs: {
        display: 'flex', 
        flexDirection: 'row', 
        gap: 20, 
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    text:{
        fontSize: 20, 
        color:'lightgray'
    }, 
    textSelected: {
        fontSize:20,
    }, 
    taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 1,  // Adds shadow for Android
    shadowColor: '#000',  // Adds shadow for iOS
    shadowOffset: { width: 0, height: 2 },  // Adds shadow for iOS
    shadowOpacity: 0.1,  // Adds shadow for iOS
    shadowRadius: 4,  // Adds shadow for iOS
  },
})