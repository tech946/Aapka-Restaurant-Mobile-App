import { ArchivoBlack_400Regular } from "@expo-google-fonts/archivo-black";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  GoogleSans_400Regular,
  GoogleSans_500Medium,
  GoogleSans_600SemiBold,
  GoogleSans_700Bold,
} from "@expo-google-fonts/google-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { OfflineScreen } from "@/components/OfflineScreen";
import { AuthProvider, useAuth } from "@/lib/auth";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    GoogleSans_400Regular,
    GoogleSans_500Medium,
    GoogleSans_600SemiBold,
    GoogleSans_700Bold,
    ArchivoBlack_400Regular,
    DMSerifDisplay_400Regular,
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        {fontsLoaded || fontError ? <Routes /> : null}
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function Routes() {
  const { state } = useAuth();
  const ready = state.status !== "loading";

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  if (state.status === "offline") return <OfflineScreen />;

  const signedIn = state.status === "signedIn";
  const hasRole = signedIn && state.viewer.role !== null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#fff" }, animation: "slide_from_right" }}>
      <Stack.Protected guard={!signedIn} redirectTo="/">
        <Stack.Screen name="login" options={{ animation: "fade" }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && !hasRole}>
        <Stack.Screen name="no-access" options={{ animation: "fade" }} />
      </Stack.Protected>

      <Stack.Protected guard={hasRole} redirectTo={signedIn ? "/no-access" : "/login"}>
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="more" options={{ animation: "fade" }} />
        <Stack.Screen name="profile" />
        <Stack.Screen name="mess/index" />
        <Stack.Screen name="mess/[id]" />
        <Stack.Screen name="module/[key]" />
      </Stack.Protected>
    </Stack>
  );
}
