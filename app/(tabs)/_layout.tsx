import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NativeTabs>
        <NativeTabs.Trigger name="calendar">
          <Label>Calendar</Label>
          <Icon sf="calendar" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="clients">
          <Label>Clients</Label>
          <Icon sf="person" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </SafeAreaView>
  );
}
