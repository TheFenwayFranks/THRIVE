import 'expo/expo-polyfill';
import { AppRegistry } from 'react-native';
import AppSimple from './AppSimple';

// Register the main component
AppRegistry.registerComponent('THRIVEMobile', () => AppSimple);

// For web, we need to run the app
if (typeof window !== 'undefined') {
  AppRegistry.runApplication('THRIVEMobile', {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
}