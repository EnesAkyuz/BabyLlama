import { SafeAreaView, ImageBackground, StyleSheet, TouchableOpacity, ActivityIndicator, View, Text, Button, ScrollView } from "react-native";
import background from '../assets/background.png';
import { Audio } from 'expo-av';
import { useState } from "react";
import { Asset } from 'expo-asset';
import axios from "axios";



const RecordAudio = () => {
    const [loading, setLoading] = useState(false);
    const [sound, setSound] = useState();
    const [pressed, setPressed] = useState(false);
    const [text, setText] = useState();
    async function playSound() {
     try {
    // Load the MP3 file from assets (adjust the path as per your project structure)
    const asset = Asset.fromModule(require('../assets/story.mp3'));
    await asset.downloadAsync();

    // Get the local URI of the downloaded asset
    const localUri = asset.localUri;

    // Now you can play the audio
    const { sound } = await Audio.Sound.createAsync(
      { uri: localUri },
      { shouldPlay: true }
    );
    // Optionally, set the sound to state or a variable for further control
    setSound(sound);

    // await sound.setVolumeAsync(1.0)
    // Play the sound
    await sound.playAsync();

  } catch (error) {
    console.error('Error playing local audio:', error);
  }
  }

    
    const generateStory = async () => {
        setLoading(true);
    try {
        const response = await axios.post("http://10.56.193.152:5000/lmnt-call", {
            timeout: 100000
        })
        console.log(response)
        setText(response.data.text)      
    } catch (error) {
      console.error('Failed to upload file or get response', error);
    }
        setPressed(true);
        setLoading(false);
  };

    return (
        <SafeAreaView style={styles.container}>
            
            <ImageBackground
                source={background}
                style={styles.background}
            >
                <ScrollView style={{ marginBottom: 80 }}>
                    {loading &&
                        <View style={{ justifyContent: 'center', flex: 1 }}>
                        <ActivityIndicator size='large' />
                        </View>
                    }
                {pressed &&
             <Button title="Play Sound" onPress={playSound} />}
                {text &&
                    <Text>{text}</Text>}
</ScrollView>
            <TouchableOpacity style={styles.helpButton} onPress={()=>generateStory()}>
                <Text style={styles.helpButtonText}>Generate Story</Text>
            </TouchableOpacity>
                </ImageBackground>
            
        </SafeAreaView>
    )
}
export default RecordAudio;

const styles = StyleSheet.create({
      container: {
    flex: 1,
    // backgroundColor: 'white',
    // justifyContent: 'center', 
    display:'flex',
    alignContent: 'center'
    },
       background: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
    justifyContent: 'center',
    },
    helpButton: {
    position: 'absolute',
    bottom: 20,  // Distance from the bottom of the screen
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
})