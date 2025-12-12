import React from 'react';
import { Alert } from 'react-native';
import ListItem from '../ListItem';
import SectionHeader from '../SectionHeader';

export default function AppSection() {
  const showComingSoon = (feature) => {
    Alert.alert('Coming Soon', `${feature} feature is coming soon!`);
  };

  return (
    <>
      <SectionHeader title="App" />
      <ListItem
        icon="🎨"
        title="Appearance"
        subtitle="Dark mode (enabled)"
        onPress={() => showComingSoon('Appearance')}
      />
      <ListItem
        icon="🔐"
        title="Security"
        subtitle="Biometric login settings"
        onPress={() => showComingSoon('Security')}
      />
    </>
  );
}
