import { View, Text, SafeAreaView, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import background from '../assets/baby-top.png'
import babyImage from '../assets/baby-placeholder.jpg';
import story from '../assets/story.png';
import lullaby from '../assets/lullaby.png';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


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
    const [recordingUri, setRecordingUri] = useState(null);
    const [permissionResponse, requestPermissionResponse] = Audio.usePermissions();

    if (!permission || !permissionResponse) {
        // Camera permissions are still loading.
        return <View/>
    }

    // if (!permission.granted) {
    // // Camera permissions are not granted yet.
    // return (
    //   <View style={styles.container}>
    //     <Text style={{ textAlign: 'center' }}>We need your permission to use the camera</Text>
    //     <Button onPress={requestPermission} title="grant permission" />
    //   </View>
    // );
    // }
    if (!permissionResponse.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to use the microphone</Text>
        <Button onPress={requestPermissionResponse} title="grant permission" />
      </View>
    );
    }

    // const cameraButton= () => {
    //     return (
    //         <CameraView style={styles.camera} facing={facing}>
    //     <View style={styles.buttonContainer}>
    //       <TouchableOpacity style={styles.button} onPress={()=>setOpenCamera(false)}>
    //         <Text style={styles.text}>Close Camera</Text>
    //       </TouchableOpacity>
    //     </View>
    //   </CameraView>
    //     )
    // }
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
    
        <SafeAreaView style={{backgroundColor:'white', height:'100%'}}>
          <Text style={styles.bigText}>Baby's Journey</Text>
          <View style={{display:'flex', flexDirection:'row', gap: 50, marginLeft:10}}>
          <View style={{display:'flex', flexDirection:'column'}}>
                <Image source={babyImage} style={styles.circle}/>
                <Text style={styles.text}>15 days old</Text>
            </View>
            <View style={{display:'flex', flexDirection:'column', alignSelf:'center', gap:20}}>
            <Text style={styles.text}>Early Developmental Stage</Text>
            <Text style={styles.text}>56%</Text>
            </View>
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', gap:50, alignItems:'center',justifyContent:'center', marginTop:20 }}>
            <View style={{display:'flex', flexDirection:'row',alignItems:'center'}}>
              <MaterialCommunityIcons  name='human-male-height' size={40} color={'black'}/>
            <Text style={styles.text}>46 cm</Text>
            </View>
            <View style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
              <MaterialCommunityIcons name='weight-gram' size={40} color={'black'}/>
            <Text style={styles.text}>4.2 kg</Text>
            </View>
          </View>


          <Text style={styles.bigText}>Lullabies and Stories</Text>
          <TouchableOpacity style={{margin:5}} onPress={()=>navigation.navigate('RecordAudio')}><Image source={story} style={{width:'100%'}} /></TouchableOpacity>
          <TouchableOpacity style={{margin:5}}onPress={()=>navigation.navigate('RecordAudio')}><Image source={lullaby} style={{width:'100%'}}/></TouchableOpacity>
        </SafeAreaView>
  );
}

{/* <View style={styles.container}>
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
    </View> */}
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
  bigText: {
    fontSize: 24,
    fontWeight: 'bold',
    margin:10,
    // color: 'white',
  },
    text: {
    fontSize: 16,  // Adjust the size of the text as needed
    fontWeight: 'bold',
    color: 'black',
    textAlign:'center'
  },
    circle: {
    width: 100,  // Adjust the size of the circle as needed
    height: 100,
    borderRadius: 50,  // This makes the view a circle
    backgroundColor: 'skyblue',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf:'center'
  },
});