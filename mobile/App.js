import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, BackHandler, ActivityIndicator, Platform, TouchableOpacity, Text, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);

  useEffect(() => {
    checkBiometricPreference();
  }, []);

  const checkBiometricPreference = async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometricsEnabled');
      if (enabled === 'true') {
        setBiometricsEnabled(true);
        authenticate();
      } else {
        setBiometricsEnabled(false);
        setIsUnlocked(true); // Let them in if biometrics are OFF
        setIsChecking(false);
      }
    } catch (e) {
      console.error('Error reading biometrics setting:', e);
      setIsUnlocked(true);
      setIsChecking(false);
    }
  };

  const authenticate = async () => {
    setIsChecking(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback: device doesn't support it or nothing is enrolled. Let them in.
        setIsUnlocked(true);
        setIsChecking(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock G-Force',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }
    } catch (error) {
      console.error(error);
      setIsUnlocked(false);
    }
    setIsChecking(false);
  };

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'TOGGLE_BIOMETRICS') {
        const newValue = data.value;
        await AsyncStorage.setItem('biometricsEnabled', newValue ? 'true' : 'false');
        setBiometricsEnabled(newValue);
      } else if (data.type === 'CHECK_BIOMETRICS_STATUS') {
        const currentVal = await AsyncStorage.getItem('biometricsEnabled');
        webViewRef.current?.injectJavaScript(`
          window.dispatchEvent(new CustomEvent('BIOMETRICS_STATUS', { detail: { enabled: ${currentVal === 'true'} } }));
          true;
        `);
      }
    } catch (e) {
      // Ignored
    }
  };

  // Handle Android hardware back button
  useEffect(() => {
    const handleBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  const INJECTED_JAVASCRIPT = `
    navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => console.log('Mic permission error:', err));
    window.isReactNativeWebView = true;
    true;
  `;

  const customUserAgent = Platform.OS === 'android' 
    ? "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36"
    : "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!isUnlocked && biometricsEnabled) {
    return (
      <View style={styles.lockContainer}>
        <StatusBar style="light" />
        <Image source={require('./assets/icon.png')} style={styles.lockLogo} />
        <Text style={styles.lockText}>App is locked</Text>
        <TouchableOpacity style={styles.unlockButton} onPress={authenticate}>
          <Text style={styles.unlockButtonText}>Unlock G-Force</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="auto" />
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://graceandforce.com/' }}
          style={styles.webview}
          userAgent={customUserAgent}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoadingContainer}>
              <ActivityIndicator size="large" color="#FF6B00" />
            </View>
          )}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onMessage={handleMessage}
          injectedJavaScript={INJECTED_JAVASCRIPT}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 999,
  },
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  lockLogo: {
    width: 120,
    height: 120,
    marginBottom: 40,
    borderRadius: 24,
  },
  lockText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 40,
  },
  unlockButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
