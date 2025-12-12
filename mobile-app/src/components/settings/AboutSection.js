import React from 'react';
import ListItem from '../ListItem';
import SectionHeader from '../SectionHeader';

export default function AboutSection({ navigation }) {
  return (
    <>
      <SectionHeader title="About" />
      <ListItem
        icon="ℹ️"
        title="App Version"
        subtitle="HomieHQ v1.0.0"
      />
      <ListItem
        icon="📖"
        title="Terms & Privacy"
        subtitle="Legal information"
        onPress={() => navigation.navigate('TermsPrivacy')}
      />
    </>
  );
}
