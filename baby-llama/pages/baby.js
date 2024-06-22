import { View, Text, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

export default function BabyScreen({ navigation }) {
    /**
     * Camera
     * Audio input
     *  - cry
     *  - parents describing issue (observation)
     */
    const [facing, setFacing] = useState('back');
    const [openCamera, setOpenCamera] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [recording, setRecording] = useState();
    const [permissionResponse, requestPermissionResponse] = Audio.usePermissions();

    if (!permission || !permissionResponse) {
        // Camera permissions are still loading.
        return <View/>
    }

    if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
    }
    if (!permissionResponse.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to use the microphone</Text>
        <Button onPress={requestPermissionResponse} title="grant permission" />
      </View>
    );
    }

    const cameraButton= () => {
        return (
            <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={()=>setOpenCamera(false)}>
            <Text style={styles.text}>Close Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
        )
    }
    async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
  }
      return (
    <View style={styles.container}>
        {!openCamera?
              ( <View>
                      <Button title={'Open Camera'} onPress={()=>setOpenCamera(true) } />
              
              <Button
                title={recording ? 'Stop Recording' : 'Start Recording'}
                onPress={recording ? stopRecording : startRecording}
              />
              </View>)
                  : (
                 cameraButton()     
            )
        }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});