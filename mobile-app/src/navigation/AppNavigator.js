import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={customTabBarStyles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // Skip hidden tabs (tabs with tabBarButton: () => null)
        if (options.tabBarButton !== undefined) {
          return null;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const icon = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused }) : null;
        const label = options.tabBarLabel || route.name;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={customTabBarStyles.tab}
          >
            {icon}
            <Text
              style={[
                customTabBarStyles.label,
                { color: isFocused ? colors.primary : colors.textSecondary }
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const customTabBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});

// Import screens
import HomeScreen from '../screens/HomeScreen';
import PropertiesScreen from '../screens/PropertiesScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import FinancesScreen from '../screens/FinancesScreen';
import TenantsScreen from '../screens/TenantsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import AppliancesScreen from '../screens/AppliancesScreen';
import SeasonalTasksScreen from '../screens/SeasonalTasksScreen';
import MoreScreen from '../screens/MoreScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AppearanceScreen from '../screens/AppearanceScreen';
import SecurityScreen from '../screens/SecurityScreen';
import TermsPrivacyScreen from '../screens/TermsPrivacyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Properties Stack Navigator (for property details navigation)
function PropertiesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="PropertiesList" component={PropertiesScreen} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </Stack.Navigator>
  );
}

// Settings Stack Navigator (for settings sub-screens)
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
    </Stack.Navigator>
  );
}

// Documents Stack Navigator (for direct access to documents)
function DocumentsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="DocumentsList" component={DocumentsScreen} />
    </Stack.Navigator>
  );
}

// Projects Stack Navigator
function ProjectsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} />
    </Stack.Navigator>
  );
}

// Appliances Stack Navigator
function AppliancesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="AppliancesList" component={AppliancesScreen} />
    </Stack.Navigator>
  );
}

// Seasonal Tasks Stack Navigator
function SeasonalStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="SeasonalList" component={SeasonalTasksScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.cardBg,
          borderBottomColor: colors.cardBorder,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 26, opacity: focused ? 1 : 0.6 }}>🏠</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Properties"
          component={PropertiesStack}
          options={{
            tabBarLabel: 'Properties',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 26, opacity: focused ? 1 : 0.6 }}>🏘️</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Maintenance"
          component={MaintenanceScreen}
          options={{
            tabBarLabel: 'Tasks',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 26, opacity: focused ? 1 : 0.6 }}>🔧</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Tenants"
          component={TenantsScreen}
          options={{
            tabBarLabel: 'Tenants',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 26, opacity: focused ? 1 : 0.6 }}>👥</Text>
            ),
          }}
        />
        <Tab.Screen
          name="More"
          component={MoreScreen}
          options={{
            tabBarLabel: 'More',
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 26, opacity: focused ? 1 : 0.6 }}>⚡</Text>
            ),
          }}
        />
        <Tab.Screen
          name="DocumentsTab"
          component={DocumentsStack}
          options={{
            tabBarButton: () => null, // Hide from tab bar
            title: 'Documents',
          }}
        />
        <Tab.Screen
          name="ProjectsTab"
          component={ProjectsStack}
          options={{
            tabBarButton: () => null, // Hide from tab bar
            title: 'Projects',
          }}
        />
        <Tab.Screen
          name="AppliancesTab"
          component={AppliancesStack}
          options={{
            tabBarButton: () => null, // Hide from tab bar
            title: 'Appliances',
          }}
        />
        <Tab.Screen
          name="SeasonalTab"
          component={SeasonalStack}
          options={{
            tabBarButton: () => null, // Hide from tab bar
            title: 'Seasonal Tasks',
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStack}
          options={{
            tabBarButton: () => null, // Hide from tab bar
            title: 'Settings',
          }}
        />
      </Tab.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth status
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ServerSettings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
