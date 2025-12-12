import React from 'react';
import ListItem from '../ListItem';
import SectionHeader from '../SectionHeader';

export default function AccountSection({ navigation }) {
  return (
    <>
      <SectionHeader title="Account" />
      <ListItem
        icon="👤"
        title="Profile"
        subtitle="Manage your account information"
        onPress={() => navigation.navigate('Profile')}
      />
      <ListItem
        icon="🔔"
        title="Notifications"
        subtitle="Configure notification preferences"
        onPress={() => navigation.navigate('Notifications')}
      />
      <ListItem
        icon="🔒"
        title="Security"
        subtitle="Password and security settings"
        onPress={() => navigation.navigate('Security')}
      />
    </>
  );
}
