import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import events from "../db/parent_events.json"
const Box = ({ isPlus }) => {
  return (
    <View style={styles.box}>
      {isPlus && <Text style={styles.plusText}>+</Text>}
    </View>
  );
};
export default function DashboardScreen({ navigation }) {
    const tasks=[{id:1, description:'play with baby', completed:false}, {id:2, description:'feed baby', completed:false}]
    return (
        <SafeAreaView style={{flex:1}}>
            <View style={{flexDirection:'row',  alignItems: 'center',justifyContent: 'flex-end',paddingHorizontal: 10}}>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 10 }}></TouchableOpacity>
          <TouchableOpacity style={{ flex: 0, paddingVertical: 10, paddingHorizontal: 10 }} onPress={()=>navigation.navigate('Notifications')}>
            < MaterialCommunityIcons name='bell-outline' size={30} color={'black'} />
          </TouchableOpacity>
            </View>
            <View style={styles.circle}>
                <Text style={styles.text}>Baby Llama is 15 days old.</Text>
            </View>
            <View style={styles.horizontalScrollViewContainer}>
            <ScrollView horizontal contentContainerStyle={styles.horizontalScrollView}
        showsHorizontalScrollIndicator={true}>
                <Box isPlus />
                {[...Array(10)].map((_, index) => (
                <Box key={index} />
                ))}
            </ScrollView>
</View>
            <View>
                <Text style={{fontSize:25, fontWeight:700, marginLeft:10}}>Tasks</Text>
                {tasks.map((task) => {
                    const isSelected=task.completed
                    return(
                    <TouchableOpacity style={styles.taskContainer} key={task.id}>
                    <View style={[styles.circle2, isSelected && styles.circleSelected]}>
                        {isSelected && <View style={styles.innerCircle} />}
                    </View>
                    <Text style={styles.taskText}>{task.description}</Text>
                    </TouchableOpacity>)
                })}
            </View>
            
            <View>
                <Text style={{fontSize:25, fontWeight:700, marginLeft:10}}>Parent Events Near You</Text>
                {events.map((event) => {
                    return (
                        <TouchableOpacity style={styles.taskContainer} key={event.id}>
                            <Text style={styles.taskText}>{event.name}</Text>
                        </TouchableOpacity>)
                })}
            </View>
            <TouchableOpacity style={styles.helpButton} onPress={()=>navigation.navigate("ChatWGPT")}>
                <Text style={styles.helpButtonText}>Chat with AI Helper</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 200,  // Adjust the size of the circle as needed
    height: 200,
    borderRadius: 100,  // This makes the view a circle
    backgroundColor: 'skyblue',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf:'center'
  },
  text: {
    fontSize: 24,  // Adjust the size of the text as needed
    fontWeight: 'bold',
    color: 'white',
    textAlign:'center'
  },
    helpButton: {
    position: 'absolute',
    bottom: 20,  // Distance from the bottom of the screen
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
  circle2: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'gray',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleSelected: {
    borderColor: 'green',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
  },
  taskText: {
    fontSize: 18,
    },
    horizontalScrollViewContainer: {
    height: 80, // Adjust the height as needed
    justifyContent: 'center',
  },
    horizontalScrollView: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 10,
    },
    box: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});