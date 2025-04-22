import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const FileViewer = ({route}) => {
  const {fileUrl} = route.params || {};
  const fileExt = fileUrl.split('.').pop().toLowerCase();

  console.log(fileExt);
  console.log(fileUrl);

  return (
    <View style={styles.container}>
      {fileExt === 'pdf' ? (
        <WebView
          source={{
            uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`,
          }}
          style={{flex: 1}}
        />
      ) : (
        <Image
          source={{uri: fileUrl}}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  image: {flex: 1, width: '100%', height: '100%'},
});

export default FileViewer;
