import { Tabs } from "expo-router";
import FeatherIcons from "@expo/vector-icons/Feather";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <FeatherIcons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, size }) => (
            <FeatherIcons name="users" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
