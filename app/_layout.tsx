import { Stack } from "expo-router";
import { clients, db, powersync } from "@/src/powersync/powersync";
import { use } from "react";
import { PowerSyncContext } from "@powersync/react";

// @ts-ignore
window.___test = async () => {
  await db.delete(clients);
};

const promise = powersync.init();
export default function RootLayout() {
  use(promise);
  return (
    <PowerSyncContext.Provider value={powersync}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="test"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetExpandsWhenScrolledToEdge: true,
          }}
        />
      </Stack>
    </PowerSyncContext.Provider>
  );
}
