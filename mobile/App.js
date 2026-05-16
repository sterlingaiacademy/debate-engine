import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, BackHandler, ActivityIndicator, Platform, TouchableOpacity, Text, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '624023459084-o1l7b425m8sqo35o25hf3jllrj0165oo.apps.googleusercontent.com',
  offlineAccess: false,
});

// Ensure the browser closes correctly on redirects
WebBrowser.maybeCompleteAuthSession();

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
      } else if (data.type === 'GOOGLE_LOGIN_NATIVE') {
        // True Native Google Sign-In Bottom Sheet Popup
        try {
          await GoogleSignin.hasPlayServices();
          
          // Force sign out to ensure we get a fresh idToken and the account picker shows
          try {
            await GoogleSignin.signOut();
          } catch (e) {
            // Ignore sign out errors (e.g. if not signed in)
          }

          const userInfo = await GoogleSignin.signIn();
          // Extract idToken safely
          const idToken = userInfo.idToken || (userInfo.data && userInfo.data.idToken);
          
          if (idToken && webViewRef.current) {
            // Bug #5 fix: JSON.stringify the token before injecting to safely escape
            // any special characters (quotes, backticks) that would break the JS string.
            const safeToken = JSON.stringify(idToken);
            // Inject idToken into the WebView so the web app can complete login
            webViewRef.current.injectJavaScript(`
              (async function() {
                try {
                  const res = await fetch('https://graceandforce.com/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential: ${safeToken} })
                  });
                  const data = await res.json();
                  if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/dashboard';
                  } else if (res.status === 404) {
                    // Profile needs completion (auto-registration removed)
                    localStorage.setItem('pendingGoogleProfile', JSON.stringify({
                        email: data.profile.email,
                        avatar: data.profile.avatar,
                        name: data.profile.name,
                        access_token: ${safeToken}
                    }));
                    window.location.href = '/register?from=google-callback';
                  } else {
                    alert('Google sign-in failed: ' + (data.error || 'Unknown error'));
                  }
                } catch(e) {
                  alert('Sign-in error: ' + e.message);
                }
              })();
              true;
            `);
          } else {
             alert('Google Sign-In Error: idToken was missing from Google response.');
          }
        } catch (error) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow (ignore silently)
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation is in progress already
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            alert("Google Play Services not available or outdated.");
          } else {
            console.error(error);
            alert("Google Sign-In Error: " + (error.message || JSON.stringify(error)));
          }
        }
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
          source={{ uri: 'https://graceandforce.com/?v=2.0' }}
          style={styles.webview}
          userAgent={customUserAgent}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url;
            // Standard web URLs should load normally in the WebView
            if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('about:blank')) {
              return true;
            }
            // Custom schemes (upi://, intent://, etc.) should be opened by the native OS
            Linking.canOpenURL(url).then((supported) => {
              if (supported) {
                Linking.openURL(url);
              }
            }).catch(err => console.error('Error opening URL', err));
            return false;
          }}
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
          injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
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
