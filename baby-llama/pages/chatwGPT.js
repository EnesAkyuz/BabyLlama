import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Image, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator,ImageBackground, Linking } from 'react-native';
import { Audio } from 'expo-av';
import ky from 'ky';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import background from '../assets/background.png';
import articles from '../assets/articles.png';
import cry from '../assets/cry.png';
import emergency from '../assets/emergency.png';
import journal from '../assets/journal.png';
import symptoms from '../assets/symptoms.png';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';


const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState();

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone is required!');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordingUri(uri);
    uploadRecording(uri);
  };

  const uploadText = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("text", input)
    try {
      const response = await axios.post("http://10.56.193.152:5000/upload-text", { text: input });
      const userMessage={type:'user', content:input}
      console.log(response.data.processedText)
      const newMessage = { type:'bot',content: response.data.processedText }
      setMessages([...messages, userMessage, newMessage])
      setInput("");
    } catch (error) {
      console.error('Failed to upload file or get response', error);
    } finally {
      setLoading(false);
    }
  }

  const uploadRecording = async (uri) => {
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    console.log(fileType)
    console.log(uri)
    const formData = new FormData();
    formData.append("audio", {
      uri,
      type: `audio.${fileType}`,
      name: `audio.${fileType}`,
    }
    )
    try {
      const response= await ky.post("http://10.56.193.152:5000/upload-audio", {
      body: formData,
    }).json();
      console.log(response)
      const userMessage={type:'user', content:response.userInput}
      const newMessage = { type: 'bot', content: response.processedText, audioVer:response.audioFile }
      setMessages([...messages, userMessage,newMessage])
    } catch (error) {
      console.error('Failed to upload file or get response', error);
    }
  };
  const handlePress = (imageName) => {
    alert(`You pressed ${imageName}`);
  };
  const chatOptions = () => {
    return (
      <View style={styles.contain}>
        <Text style={{ fontSize: 25, fontWeight: 700, alignSelf: 'flex-start',  marginLeft:20, marginBottom:5}}>How May I Help You Today?</Text>
        <Text style={{ fontSize: 20, alignSelf: 'flex-start', marginLeft:20 }}>Choose Action</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => handlePress('image1')}>
          <Image source={emergency} style={styles.image} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress('image2')}>
          <Image source={symptoms} style={styles.image} />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => handlePress('image3')}>
          <Image source={cry} style={styles.image} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => youCom()}>
          <Image source={articles} style={styles.image} />
        </TouchableOpacity>
      </View>
      {/* <View style={styles.row}>
        <TouchableOpacity onPress={() => youCom()}>
          <Image source={articles} style={styles.image} />
        </TouchableOpacity>
      </View> */}
    </View>
    )
  }

   async function playSound() {
     try {
    // Load the MP3 file from assets (adjust the path as per your project structure)
    const asset = Asset.fromModule(require('../assets/speech.mp3'));
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
  const youCom = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://10.56.193.152:5000/you-com-call", );
      const userMessage={type:'user', content:"Articles about parenthood and children!"}
      const results = response.data.slice(0, 5)
      // print(response.data)
      // console.log(results)

      // const formattedList = results.map(item => `- ${item.title} via ${item.url}`).join('\n\n');
      const newMessage = { type: 'bot', content: results, links: true }
      console.log(newMessage)
      setMessages([...messages, userMessage, newMessage])
    } catch (error) {
      console.error('Failed to upload file or get response', error);
    } finally {
      setLoading(false);
    }
  }
  // useEffect(() => {
  //   return sound
  //     ? () => {
  //         console.log('Unloading Sound');
  //         sound.unloadAsync();
  //       }
  //     : undefined;
  // }, [sound]);
  const handleLink = (url) => {
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  };
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={background}
        style={styles.background}
      >
      {loading ?
        <View style={{justifyContent:'center', flex:1}}>
          <ActivityIndicator size='large' />
        </View>
          :
          messages.length>0?
            <FlatList
      data={messages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={[styles.message, item.type === 'user' ? styles.userMessage : styles.botMessage]}>
          {item.audioVer &&       <Button title="Play Sound" onPress={playSound} />
            // (<TouchableOpacity onPress={() => playAudio(item.audioVer)}> <MaterialCommunityIcons name='play' size={40} /> </TouchableOpacity>)
          }
          {!item.links ?
            <Text>{item.content}</Text>
            :
            item.content.map((article, index) => {
              return(
              <TouchableOpacity key={index} onPress={() => handleLink(article.url)}>
              <Text style={{color:'blue', fontWeight:700, marginBottom:5}}>{`${index + 1}. ${article.title}`}</Text>
            </TouchableOpacity>)
          })
          }
          
        </View>
      )}
            />
            :  chatOptions()
        }
        <TouchableOpacity style={{ display: 'flex', alignItems: 'center', justifyContent:'center', marginBottom:80 }} onPress={recording ? stopRecording : startRecording}>
          <View style={{ height: 100, width: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor:recording?'rgba(0,0,0,0)':'#9CA8FB' }}>
            <View style={{backgroundColor:'#757EFA',borderRadius:20, width:40, height:40,}}>
          < MaterialCommunityIcons name='microphone' size={40} color={'black'} style={{}} />
          </View>
            </View>
        </TouchableOpacity>

       <View style={{flexDirection:'row',  alignItems: 'center',position:'absolute',bottom:5,paddingHorizontal: 10, gap:20}}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Your question"
          style={styles.inputText} />
        {<TouchableOpacity style={styles.recordButton} onPress={()=>uploadText()}>
              < MaterialCommunityIcons name='send' size={40} color={'black'} />
        </TouchableOpacity>
        }
        
        </View>
        </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
    // justifyContent: 'center', 
    display:'flex',
    alignContent: 'center',
    
  },
  message: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  userMessage: {
    backgroundColor: 'lightblue',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  recordButton: {
    // position: 'absolute',
    bottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 40,
    flex:0
  }, 
  inputText: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10, 
    fontSize: 20,
    borderWidth: 1,
    bottom: 10, 
    borderRadius:40,
    // position:'absolute'
  }, 
   background: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
    justifyContent: 'center',
  },
   contain: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  image: {
    // width: 100,
    // height: 100,
    margin: 10,
  },
  placeholder: {
    width: 100,
    height: 100,
    margin: 10,
  },
});

export default ChatScreen;
