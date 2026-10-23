import { errorMessage, type Viewer } from "@aapka/shared";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CodeStep } from "@/features/login/CodeStep";
import { EmailStep } from "@/features/login/EmailStep";
import { Onboarding } from "@/features/login/Onboarding";
import { VerifiedPopup } from "@/features/login/VerifiedPopup";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Step = "onboarding" | "email" | "code";

export default function LoginScreen() {
  const { signedIn } = useAuth();
  const [step, setStep] = useState<Step>("onboarding");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState<Viewer | null>(null);

  function go(next: Step) {
    setError(null);
    setStep(next);
  }

  async function sendCode(address: string) {
    setError(null);
    setBusy(true);
    try {
      await api.sendCode(address);
      setEmail(address);
      setStep("code");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify(code: string) {
    setError(null);
    setBusy(true);
    try {
      setVerified(await api.verifyCode(email, code));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function resend(): Promise<boolean> {
    setError(null);
    try {
      await api.sendCode(email);
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    }
  }

  if (step === "onboarding") return <Onboarding onDone={() => go("email")} />;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.step} keyboardShouldPersistTaps="handled">
          {step === "email" ? (
            <EmailStep
              initialEmail={email}
              error={error}
              busy={busy}
              onBack={() => go("onboarding")}
              onSubmit={(address) => void sendCode(address)}
            />
          ) : (
            <CodeStep
              email={email}
              error={error}
              verifying={busy}
              onBack={() => go("email")}
              onVerify={(code) => void verify(code)}
              onResend={resend}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      {verified ? <VerifiedPopup onContinue={() => signedIn(verified)} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  step: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 },
});
