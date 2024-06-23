import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';
import ky from 'ky';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import background from '../assets/background.png';
import predictions from '../assets/predictions.json'

const ChatScreenYou = () => {
  const [messages, setMessages] = useState();
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
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
    // Upload the audio
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
      const response= await ky.post("http://10.56.193.152:5000/hume-call", {
      body: formData,
    });
    
    } catch (error) {
      console.error('Failed to upload file or get response', error);
    }
    // console.log(predictions)
    const results = predictions[0].results.predictions[0].models.prosody.grouped_predictions[0].predictions[0].emotions
    // [0].source.results.predictions[0].models.prosody.metadata
    // console.log(results)

    if (results) {
      results.sort((a, b) => b.score - a.score)
      const top5Emotion = results.slice(0, 5)
      const top5String = top5Emotion.map((item, index) => `${index + 1}. ${item.name}, Score: ${item.score.toFixed(3)}`).join('\n');
      setMessages(top5String)
      setSent(true);
    } else {
      setMessages('Error rendering emotions')
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={background}
        style={styles.background}
      >
        {loading ? <View style={{ justifyContent: 'center', flex: 1 }}>
          <ActivityIndicator size='large' />
        </View>
          :
           messages &&
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
            <Text style={{ fontSize: 20, fontVariant: 'bold', fontWeight: 700, marginBottom: 10 }}>Your mood details</Text>
            <Text>{messages}</Text>
          </View>
        }
        {!sent &&
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ fontSize: 25, fontWeight: 500, alignSelf: 'center', marginBottom: 15, }}>Add a journal entry</Text>
            <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
              <View style={{ height: 100, width: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: recording ? 'rgba(0,0,0,0)' : '#9CA8FB' }}>
                <View style={{ backgroundColor: '#757EFA', borderRadius: 20, width: 40, height: 40, }}>
                  < MaterialCommunityIcons name='microphone' size={40} color={'black'} style={{}} />
                </View>
              </View>
            </TouchableOpacity>
          </View>}
        </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
});
export default ChatScreenYou;
