import { StyleSheet, Alert } from 'react-native';

import { useState } from 'react';

import { Image, Modal } from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { SafeAreaView, Text, View } from '@/components/Themed';
import { XStack, YStack, Button } from 'tamagui';
import { Loader } from '@/components/Loader';

import { analyzeTeeth } from '@/services/modelService';

import { useAuth as useAuthy } from '@/contexts/AuthyContext';
import { EmojiButton } from '@/components/EmojiButton';
import { ResultView } from '@/components/ResultView';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function DetectScreen() {

  const [result, setResult] = useState<string | null>('');
  const [image, setImage] = useState<string | null>('');
  const [visible, setVisible] = useState(false); 
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

    if (!image) {
      Alert.alert('No Image Selected');
      return;
    }
    if (!authState?.token) {
      Alert.alert("Not Authenticated");
      return;
    }

    setLoading(true);
    
    try {
      const response = await analyzeTeeth(image);
      
      const resultImgPath = `${BASE_URL}/${response.plottedImagePath}`;
    
      setResult(resultImgPath);
      setVisible(!visible);

    } catch (error) {
      Alert.alert('Something went wrong');
      console.log('Analyze Error', error);
    }
    setLoading(false);
  }
  const dismiss = () => {
    setVisible(!visible);
    setResult('');
  }

  const PLACEHOLDER = 'https://i.postimg.cc/FFcjKg98/placeholder.png'

  return (
    <View style={styles.container}>

      <Modal animationType='slide' presentationStyle='pageSheet' visible={visible}
        onRequestClose={() => setVisible(!visible)}>
          <SafeAreaView style={styles.modal}>
            <ResultView imgUri={result} />
            <Button onPress={dismiss}> Dismiss </Button>
          </SafeAreaView>
      </Modal>

      <Text style={styles.title}>Select Image Source</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <XStack justifyContent='space-evenly' gap="$5" paddingHorizontal="$5">
        <EmojiButton emoji='📸' label='Camera' onPress={openCamera} />
        <EmojiButton emoji='🖼' label='Gallery' onPress={select} />
      </XStack>

      <YStack backgroundColor={'$background025'} justifyContent='center' alignItems='center' margin='$5' borderRadius={10}>
          <Image source={{uri: image ? image : PLACEHOLDER }} style={styles.image} resizeMode='contain' />
      </YStack>

      <XStack gap='$5' margin='$5'>
        <Button onPress={() => setImage(null) } flex={1}>Reset</Button>
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
  modal: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20 
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
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.5,
    borderRadius: 10
  },
});
