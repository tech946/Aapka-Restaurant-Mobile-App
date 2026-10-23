import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";

import { T } from "@/components/ui/Text";
import { fonts } from "@/theme";
import { AuthHeader, Cta, loginStyles } from "./parts";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

type Props = {
  initialEmail: string;
  error: string | null;
  busy: boolean;
  onBack: () => void;
  onSubmit: (email: string) => void;
};

export function EmailStep({ initialEmail, error, busy, onBack, onSubmit }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [focused, setFocused] = useState(false);
  const valid = EMAIL_RE.test(email.trim());
  const submit = () => valid && !busy && onSubmit(email.trim().toLowerCase());

  return (
    <>
      <AuthHeader onBack={onBack} />
      <T weight="semibold" style={loginStyles.title}>
        Welcome Back!
      </T>
      <T style={loginStyles.sub}>Access your account through your work email</T>

      <T weight="medium" style={styles.label}>
        Enter Your Email
      </T>
      <TextInput
        style={[styles.input, focused && styles.inputFocus, error && styles.inputError]}
        value={email}
        onChangeText={setEmail}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={submit}
        editable={!busy}
        placeholder="EX: name@aapka.com"
        placeholderTextColor="#b0b0b0"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="send"
        accessibilityLabel="Email"
      />
      {error ? (
        <T weight="medium" style={loginStyles.error} accessibilityRole="alert">
          {error}
        </T>
      ) : null}

      <Cta disabled={!valid} busy={busy} onPress={submit}>
        Continue
      </Cta>

      <T style={loginStyles.foot}>
        Don’t have an account?{" "}
        <T weight="bold" style={loginStyles.footStrong}>
          Ask your admin
        </T>
      </T>
    </>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 30, marginBottom: 8, fontSize: 13, color: "#222" },
  input: {
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    backgroundColor: "#f6f6f6",
    color: "#111",
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  inputFocus: { borderColor: "#dcdcdc", backgroundColor: "#fff" },
  inputError: { borderColor: "#f04438", backgroundColor: "#fff6f5" },
});
