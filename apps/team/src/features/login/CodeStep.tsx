import { OTP_LENGTH, OTP_RESEND_SECONDS } from "@aapka/shared";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from "react-native";

import { T } from "@/components/ui/Text";
import { AuthHeader, Cta, loginStyles } from "./parts";

type Props = {
  email: string;
  error: string | null;
  verifying: boolean;
  onBack: () => void;
  onVerify: (code: string) => void;
  onResend: () => Promise<boolean>;
};

export function CodeStep({ email, error, verifying, onBack, onVerify, onResend }: Props) {
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const input = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const [lastError, setLastError] = useState(error);
  if (error !== lastError) {
    setLastError(error);
    if (error) setCode("");
  }
  useEffect(() => {
    if (error && !verifying) input.current?.focus();
  }, [error, verifying]);

  const complete = code.length === OTP_LENGTH;
  const activeIndex = Math.min(code.length, OTP_LENGTH - 1);

  function change(raw: string) {
    const next = raw.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setCode(next);
    if (next.length === OTP_LENGTH && !verifying) onVerify(next);
  }

  async function resend() {
    setResending(true);
    const sent = await onResend();
    setResending(false);
    if (sent) {
      setCode("");
      setSecondsLeft(OTP_RESEND_SECONDS);
      input.current?.focus();
    }
  }

  return (
    <>
      <AuthHeader onBack={onBack} />
      <T weight="semibold" style={loginStyles.title}>
        We just sent an Email
      </T>
      <T style={loginStyles.sub}>
        Enter the six digit security code we sent to{" "}
        <T weight="semibold" style={loginStyles.strong}>
          {email}
        </T>
      </T>
      <Pressable onPress={onBack} style={styles.edit} hitSlop={6}>
        <T weight="bold" style={styles.editText}>
          Edit Email
        </T>
      </Pressable>

      <Pressable style={styles.code} onPress={() => input.current?.focus()} accessibilityLabel={`${OTP_LENGTH}-digit code`}>
        {Array.from({ length: OTP_LENGTH }, (_, i) => {
          const active = i === activeIndex && !verifying && !complete;
          const filled = Boolean(code[i]);
          return (
            <View key={i} style={[styles.box, (active || filled) && styles.boxOn, error && styles.boxError]}>
              {filled ? (
                <T weight="semibold" style={styles.digit}>
                  {code[i]}
                </T>
              ) : active ? (
                <View style={styles.caret} />
              ) : null}
            </View>
          );
        })}
        <TextInput
          ref={input}
          value={code}
          onChangeText={change}
          editable={!verifying}
          autoFocus
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          caretHidden
          style={styles.hiddenInput}
        />
      </Pressable>

      {error ? (
        <T weight="medium" style={[loginStyles.error, { textAlign: "center" }]} accessibilityRole="alert">
          {error}
        </T>
      ) : null}

      <Cta disabled={!complete} busy={verifying} onPress={() => complete && onVerify(code)}>
        Continue
      </Cta>

      <T style={loginStyles.foot}>
        Didn’t receive the code?{" "}
        {secondsLeft > 0 ? (
          <T style={{ color: "#8a8a8a" }}>Send Again in {secondsLeft}s</T>
        ) : (
          <T weight="bold" style={loginStyles.footStrong} onPress={resending ? undefined : () => void resend()}>
            {resending ? "Sending…" : "Send Again"}
          </T>
        )}
      </T>
    </>
  );
}

const styles = StyleSheet.create({
  edit: { alignSelf: "flex-start", marginTop: 10 },
  editText: { fontSize: 13, color: "#f0592a" },
  code: { flexDirection: "row", gap: 8, marginTop: 30 },
  box: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ececec",
    borderRadius: 10,
    backgroundColor: "#f7f7f7",
  },
  boxOn: { borderColor: "#dedede", backgroundColor: "#fff" },
  boxError: { borderColor: "#f04438" },
  digit: { fontSize: 22, color: "#111" },
  caret: { width: 2, height: 20, borderRadius: 1, backgroundColor: "#22c55e" },
  hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
});
