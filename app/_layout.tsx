import { Stack } from "expo-router";
import { clients, db, powersync } from "@/src/powersync/powersync";
import { PropsWithChildren, use } from "react";
import { PowerSyncContext } from "@powersync/react";
import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/src/supabase";
import Auth from "@/src/components/Auth";

// @ts-ignore
window.___test = async () => {
  await db.delete(clients);
};

function AuthGuard({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (session?.user) return <>{children}</>;
  return <Auth />;
}

const promise = powersync.init();
export default function RootLayout() {
  use(promise);
  return (
    <PowerSyncContext.Provider value={powersync}>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />

          <Stack.Screen
            name="create-time-entry"
            options={{
              presentation: "formSheet",
              sheetAllowedDetents: "fitToContents",
              sheetGrabberVisible: true,
              sheetExpandsWhenScrolledToEdge: true,
            }}
          />

          <Stack.Screen
            name="create-client"
            options={{
              presentation: "formSheet",
              sheetAllowedDetents: "fitToContents",
              sheetGrabberVisible: true,
              sheetExpandsWhenScrolledToEdge: true,
            }}
          />
        </Stack>
      </AuthGuard>
    </PowerSyncContext.Provider>
  );
}
