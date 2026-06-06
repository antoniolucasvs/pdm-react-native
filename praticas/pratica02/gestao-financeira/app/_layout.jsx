import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../constants/colors";
import GlobalState, { MoneyContext } from "../contexts/GlobalState";
import { useContext, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

function AppNavigation() {
  const { user, authLoading } = useContext(MoneyContext);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "welcome";

    if (!user) {
      if (!inAuthGroup) {
        router.replace("/login");
      }
    } else {
      if (segments[0] === "login") {
        router.replace("/welcome");
      }
    }
  }, [user, authLoading, segments]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GlobalState>
      <StatusBar backgroundColor={colors.primary} style="light" />
      <AppNavigation />
    </GlobalState>
  );
}
