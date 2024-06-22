import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import journals from '../db/journal_entries.json'
export default function ParentScreen({ navigation }) {
    return (
        <SafeAreaView>
            <TouchableOpacity style={styles.addBtn}>
                <Text>Add new journal entry</Text>
            </TouchableOpacity>

            <View>
                <Text style={styles.text}>Previous Journal Entries</Text>
                 {journals.map((entry) => {
                    return (
                        <TouchableOpacity style={styles.taskContainer} key={entry.id}>
                            <Text style={styles.taskText}>{entry.transcription}</Text>
                            <Text>{entry.date}</Text>
                        </TouchableOpacity>)
                })}
            </View>
            <View>
                <Text style={styles.text}>Mood Trends</Text>
            </View>

            <TouchableOpacity style={styles.helpButton} onPress={()=>navigation.navigate("ChatWYou")}>
                <Text style={styles.helpButtonText}>Find an article</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    addBtn: {
    width: 250,
    padding: 15,
    backgroundColor: 'skyblue',
    borderRadius: 25,
    alignItems: 'center',
    alignSelf:'center',
    justifyContent:'center'
    }, 
    taskContainer: {
    flexDirection: 'column',
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
    text: {
        fontSize: 25,
        fontWeight: 700,
        marginLeft: 10
    },
    helpButton: {
    position: 'absolute',
    bottom: 0,  // Distance from the bottom of the screen
    width: 250,
    padding: 15,
    backgroundColor: 'skyblue',
    borderRadius: 25,
    alignItems: 'center',
    alignSelf:'center',
    justifyContent:'center'
    },
    helpButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign:'center'
    },
})