import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import journals from '../db/journal_entries.json'
const Bar = ({ label, fill }) => {
  return (
    <View style={styles.barContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${fill}%` }]} />
      </View>
    </View>
  );
};
export default function ParentScreen({ navigation }) {
    return (
      <SafeAreaView style={{ height: '100%', backgroundColor:'white'}}>
        <Text style={styles.text}>Mom's Corner</Text>
        <View style={{padding:20, borderRadius:20, borderWidth:1, margin:5, borderColor:'#757EFA'}}>
          <Text style={{ fontSize: 20, marginBottom:5 }}>You may be experiencing postpartum depression.</Text>
          <Text>1 in 5 women feel the same</Text>
        </View>
        <Text style={styles.text}>Emotional Tracker</Text>
            <ScrollView contentContainerStyle={styles.container}>
            <Bar label="Anxiety" fill={70} />
            <Bar label="Sadness" fill={50} />
            <Bar label="Self-doubt" fill={90} />
            <Bar label="Happiness" fill={30} />
            <Bar label="Anger" fill={80} />
            </ScrollView>

            <TouchableOpacity style={styles.helpButton} onPress={()=>navigation.navigate('Journal')}>
                <Text style={styles.helpButtonText}>Add Journal Story</Text>
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
    bottom: 10,  // Distance from the bottom of the screen
    width: 250,
    padding: 15,
    backgroundColor: '#9CA8FB',
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
    barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    
  },
  label: {
    width: 80,
    fontSize: 16,
    marginLeft: 8,
  },
  bar: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight:10
  },
  fill: {
    height: '100%',
    backgroundColor: '#757EFA',
    },
})