import { Tabs } from "expo-router";
import { COLORS } from "../../constants/theme";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


export default function RootLayout() {
  return <Tabs
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.grey,
      tabBarStyle: {
        backgroundColor: "#000000",
        borderTopWidth: 0,
        position: "absolute",
        elevation: 0,
        height: 50,
        paddingBottom: 8,
      },
    }}
  >
    <Tabs.Screen
      name="index"
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tabs.Screen
      name="bookmarks"
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="bookmarks" size={size} color={color} />
        ),
      }}
    />
    <Tabs.Screen
      name="create"
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="add" size={size} color={COLORS.secondary} />
        ),
      }}
    />
    <Tabs.Screen
      name="notifications"
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="notifications" size={size} color={color} />
        ),
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name="person" size={size} color={color} />
        ),
      }}
    />
  </Tabs>;
}
