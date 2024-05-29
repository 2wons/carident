import { StyleSheet, Image, Alert, TouchableOpacity } from "react-native";
import { Button, H1, H3, SizableText, Input, XStack } from "tamagui";
import { Download, History } from "@tamagui/lucide-icons";

import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { View, ScrollView } from "./Themed";
import { styled } from "@tamagui/core";
import { XCircle } from "@tamagui/lucide-icons";

import { useData } from "@/contexts/DataContext";
import ImageViewer from "react-native-image-zoom-viewer";
import { Modal } from "react-native";
import { useState } from "react";
import { Loader } from "./Loader";
import { Summary } from "./Summary";

const FloatingButton = styled(Button, {
  name: "Floating Button",
  flex: 1,
  position: "absolute",
  alignSelf: "flex-end",
});

type ResultProps = {
  imgUri: string | null;
  children?: React.ReactElement
};

export const ResultView = ({ imgUri, children }: ResultProps) => {
  const { save } = useData();
  const [isViewerVisible, setViewerVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("Untitled")

  const today = new Date();

  const saveToHistory = async () => {
    setLoading(true)
    await save!(imgUri!, title)
    Alert.alert('Result saved to history.')
    setLoading(false)
  }

  const handleViewer = () => {
    setViewerVisible(!isViewerVisible)
  }

  const saveImage = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera roll access is required to save images.");
      return;
    }
    // Download file to temporary cache
    const { uri } = await FileSystem.downloadAsync(
      imgUri!,
      FileSystem.cacheDirectory + "result.jpg"
    );

    // Save Image to Camera Roll
    await MediaLibrary.saveToLibraryAsync(uri);

    // Delete cached temp
    await FileSystem.deleteAsync(uri);
    Alert.alert("Image result saved to Camera Roll");
  };

  const images = [
    { url: imgUri! },
  ]

  const PLACEHOLDER = "https://i.postimg.cc/FFcjKg98/placeholder.png";
  return (
    <>
      <H1 paddingVertical="$5">Analysis result</H1>
      <View style={styles.preview}>
        <TouchableOpacity onPress={handleViewer}>
          <Image
            source={{ uri: imgUri ? imgUri : PLACEHOLDER }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
      <Modal visible={isViewerVisible} transparent={true}>
        <ImageViewer imageUrls={images}/>
        <Button onPress={handleViewer}>Close</Button>
      </Modal>
        <FloatingButton icon={Download} onPress={saveImage}>
        </FloatingButton>
      </View>
      <H3 paddingTop={'$3'}>Summary</H3>
      <Summary />
      <SizableText theme="alt1" paddingTop="$1.5">General Information</SizableText>
      <XStack alignItems="center">
        <SizableText theme="alt2">{`title `}</SizableText>
        <Input size="$1" flex={1} placeholder="Untitled" onChangeText={t => setTitle(t)}/>
      </XStack>
      <XStack>
        <SizableText theme="alt2">{`date taken `}</SizableText>
        <SizableText>{`${today.toLocaleString()}`}</SizableText>
      </XStack>
      <H3 paddingTop={'$3'}>Actions</H3>
      <Button onPress={saveToHistory} icon={History} marginVertical="$2">
        Save to History
      </Button>
      { children }
      { loading && <Loader /> }
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
  preview: {
    backgroundColor: "black",
    borderRadius: 15,
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1.5,
    borderRadius: 10,
    borderStyle: "dashed",
    borderColor: "white",
    borderWidth: 1
  },
});
