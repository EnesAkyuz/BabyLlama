import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Image, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator,ImageBackground } from 'react-native';
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


const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    const formData = new FormData();
    formData.append("audio", {
      uri,
      type: `audio.m4a`,
      name: 'recording.m4a',
    }
    )
    try {
      const response= await ky.post("http://10.56.193.152:5000/upload-audio", {
      body: formData,
    });
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      // const data = await response;
      console.log('Server response:', response);
      // if (response.status === 200) {
      //   console.log("success")
      //   // const chatResponse = await axios.get('http://127.0.0.1:5000/get-response');
      //   // setMessages([...messages, { type: 'user', content: 'Audio message' }, { type: 'bot', content: chatResponse.data.message }]);
      // }
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
        <TouchableOpacity onPress={() => handlePress('image4')}>
          <Image source={journal} style={styles.image} />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => handlePress('image5')}>
          <Image source={articles} style={styles.image} />
        </TouchableOpacity>
        {/* <View style={styles.placeholder} />  Placeholder for the empty spot */}
      </View>
    </View>
    )
  }

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
          <Text>{item.content}</Text>
        </View>
      )}
            />
            :  chatOptions()
        }
        <TouchableOpacity style={{ display: 'flex', alignItems: 'center', justifyContent:'center' }} onPress={recording ? stopRecording : startRecording}>
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
    backgroundColor: 'lightgray',
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
