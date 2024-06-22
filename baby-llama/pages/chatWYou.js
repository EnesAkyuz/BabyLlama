import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
// import axios from 'axios';

const ChatScreenYou = () => {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);

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

  const uploadRecording = async (uri) => {
    const formData = new FormData();
    formData.append('audio', {
      uri,
      type: 'audio/x-m4a',
      name: 'recording.m4a',
    });

    // try {
    //   const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   });

    //   if (response.status === 200) {
    //     const chatResponse = await axios.get('http://127.0.0.1:5000/get-response');
    //     setMessages([...messages, { type: 'user', content: 'Audio message' }, { type: 'bot', content: chatResponse.data.message }]);
    //   }
    // } catch (error) {
    //   console.error('Failed to upload file or get response', error);
    // }
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
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
        style={styles.recordButton}
      />
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
    position: 'absolute',
    bottom: 10,
    left: '50%',
    // transform: [{ translateX: -50% }],
  },
});

export default ChatScreenYou;
