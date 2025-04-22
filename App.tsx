import {View, Text, StatusBar, Alert, LogBox, Button} from 'react-native';
import React, {useEffect, useState} from 'react';
import AuthStack from './src/component/Navigation/AuthStack';
import {AuthProvider} from './src/component/Context/AuthContext';
import FlashMessage from 'react-native-flash-message';
import * as Sentry from '@sentry/react-native';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

// Initialize Sentry at the top level
Sentry.init({
  dsn: 'https://151aeb0c6f66238267a49e049e73042c@o4509044537950208.ingest.us.sentry.io/4509045388279809',
  debug: true,  // Important for terminal logs
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});

AppRegistry.registerComponent(appName, () => Sentry.wrap(App));


// Define PromiseRejectionEvent for React Native
interface PromiseRejectionEvent {
  reason: any;
}

// Global Error Handling
const globalErrorHandler = (error: Error, isFatal?: boolean) => {
  console.error('Global Error Handler:', error);

  // Send error details to Sentry
  Sentry.captureException(error);

  // Show alert for better visibility during testing
  if (isFatal) {
    Alert.alert(
      'Unexpected Error Occurred',
      `
        An unexpected error occurred. Please restart the app.
        Error Details: ${error.message}
      `,
      [{text: 'OK'}],
    );
  }
};

// Handle uncaught errors
ErrorUtils.setGlobalHandler(globalErrorHandler);

// Handle unhandled promise rejections
if (typeof global !== 'undefined' && (global as any).addEventListener) {
  (global as any).addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      Sentry.captureException(event.reason);
    },
  );
}

// Capture Console Errors and Warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  Sentry.captureMessage(args.join(' '));
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  Sentry.captureMessage(`Warning: ${args.join(' ')}`);
  originalConsoleWarn(...args);
};

// Error Boundary Implementation
const App = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    LogBox.ignoreAllLogs(); // Suppress unwanted warnings in development
  }, []);

  const handleRetry = () => {
    setHasError(false);
  };

  // Simulate Error Boundary Handling
  if (hasError) {
    return (
      <View>
        <Text>Something went wrong!</Text>
        <Button title="Retry" onPress={handleRetry} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        animated={true}
        backgroundColor="#fff"
        barStyle="dark-content"
      />
      <AuthProvider>
        <AuthStack />
        <FlashMessage position="bottom" />
      </AuthProvider>
    </>
  );
};

export default Sentry.wrap(App);
