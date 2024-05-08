import { StyleSheet, Alert } from 'react-native';

import { useState } from 'react';

import { Image } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { Text, View } from '@/components/Themed';
import { XStack, YStack, Button } from 'tamagui';
import { Loader } from '@/components/Loader';

import { analyzeTeeth } from '@/services/modelService';

import { useAuth as useAuthy } from '@/contexts/AuthyContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function DetectScreen() {

  const [image, setImage] = useState<string | null>('');
  const [loading, setLoading] = useState(false);
  
  const { authState } = useAuthy();

  const openCamera = async () => {
    // camera needs permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Camera Permissions Denied")
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1,1],
      quality: 1
    });
    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  const select = async () => {
    setLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      //aspect: [4,3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
    setLoading(false);
  };

  const analyze = async () => {

    if (!authState?.token || !image) {
      Alert.alert("Not Authenticated");
      return;
    }

    setLoading(true);
    
    try {
      const response = await analyzeTeeth(image);
      
      const resultImgPath = `${BASE_URL}/${response.plottedImagePath}`;
      
      setImage(resultImgPath);
      /* TODO: display result screen instead of placing the result in image preview */

    } catch (error) {
      console.log('Analyze Error', error);
    }
    setLoading(false);
  }

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Select Image Source</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <XStack justifyContent='space-evenly' gap="$5" paddingHorizontal="$5">
        <YStack flex={1} gap="$5" borderWidth={0} padding={1} borderColor={'$background025'}>
          <Button alignSelf='stretch' size="$6" variant='outlined' borderWidth={1} height={80} onPress={openCamera}>
          <Text style={styles.textEmoji}>📸</Text>
          <Text>Camera</Text>
          </Button>
        </YStack>
        <YStack flex={1} gap="$2" borderWidth={0} padding={1} borderColor={'$background025'}>
          <Button alignSelf='stretch' size="$6" variant='outlined' borderWidth={1} height={80} onPress={select}>
          <Text style={styles.textEmoji}>🖼</Text>
          <Text>Gallery</Text>
          </Button>
        </YStack>
      </XStack>
      <YStack backgroundColor={'$background025'} justifyContent='center' alignItems='center' margin='$5' borderRadius={10}>
          <Image source={{uri: image ? image : 'https://i.postimg.cc/FFcjKg98/placeholder.png'}} style={styles.image} resizeMode='contain' />
      </YStack>
      <XStack gap='$5' margin='$5'>
        <Button onPress={() => setImage(null) } flex={1}>Cancel</Button>
        <Button onPress={analyze} flex={1}>Analyze</Button>
      </XStack>
      { loading ?  <Loader /> : '' }
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '90%',
  },
  textEmoji: {
    fontSize: 20,
  },
  viewDebug: {
    flex: 1,
    width: '100%',
    margin: 30,
    backgroundColor:'#2e2d2c'
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.5,
    borderRadius: 10
  },
});
