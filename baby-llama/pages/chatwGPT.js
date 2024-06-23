import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import ky from 'ky';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [input, setInput] = useState("");

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
    const formData = new FormData();
    formData.append("text", input)
    try {
      const response = await axios.post("http://10.56.193.152:5000/upload-text", { text: input });
      // console.log(response["processedText"])
      console.log(response.data.processedText)
    } catch (error) {
      console.error('Failed to upload file or get response', error);
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

      const data = await response.json();
      console.log('Server response:', data);
      setInput("");
      // if (response.status === 200) {
      //   console.log("success")
      //   // const chatResponse = await axios.get('http://127.0.0.1:5000/get-response');
      //   // setMessages([...messages, { type: 'user', content: 'Audio message' }, { type: 'bot', content: chatResponse.data.message }]);
      // }
    } catch (error) {
      console.error('Failed to upload file or get response', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.message, item.type === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      {/* <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
        style={styles.recordButton}>
      < MaterialCommunityIcons name='microphone' size={30} color={'black'} />
      </Button> */}

       <View style={{flexDirection:'row',  alignItems: 'center',justifyContent: 'flex-end',paddingHorizontal: 10, gap:20}}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Your question"
          style={styles.inputText} />
        {input.length===0?
          <TouchableOpacity style={styles.recordButton} onPress={recording ? stopRecording : startRecording}>
          < MaterialCommunityIcons name='microphone' size={40} color={'black'} />
          </TouchableOpacity>
          : <TouchableOpacity style={styles.recordButton} onPress={()=>uploadText()}>
              < MaterialCommunityIcons name='send' size={40} color={'black'} />
        </TouchableOpacity>
        }
        
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  message: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  userMessage: {
    backgroundColor: '#d1e7dd',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#f8d7da',
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
  }
});

export default ChatScreen;
