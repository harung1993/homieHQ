import React from 'react';
import ListItem from '../ListItem';
import SectionHeader from '../SectionHeader';

export default function MoreSection({ navigation, onClose }) {
  const handleNavigation = (route) => {
    if (onClose) onClose(); // Close modal if opened from modal
    setTimeout(() => {
      navigation?.navigate(route);
    }, 300); // Small delay to allow modal to close first
  };

  return (
    <>
      <SectionHeader title="More Features" />
      <ListItem
        icon="🏗️"
        title="Projects"
        subtitle="Track renovation and improvement projects"
        onPress={() => handleNavigation('ProjectsTab')}
      />
      <ListItem
        icon="📱"
        title="Appliances"
        subtitle="Manage appliances and warranties"
        onPress={() => handleNavigation('AppliancesTab')}
      />
      <ListItem
        icon="🌸"
        title="Seasonal Tasks"
        subtitle="Seasonal maintenance checklists"
        onPress={() => handleNavigation('SeasonalTab')}
      />
    </>
  );
}
