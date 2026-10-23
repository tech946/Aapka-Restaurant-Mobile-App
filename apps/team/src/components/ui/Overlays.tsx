import { X } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { Arrow } from "@/components/art/Art";
import { T } from "@/components/ui/Text";
import { fonts } from "@/theme";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
};

function Backdrop({ onClose }: { onClose: () => void }) {
  return <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />;
}

export function Sheet({ open, onClose, title, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
        <Backdrop onClose={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.grab} />
          <View style={styles.sheetHead}>
            <T weight="semibold" style={styles.sheetTitle}>
              {title}
            </T>
            <Pressable onPress={onClose} style={styles.sheetClose} accessibilityLabel="Close" hitSlop={8}>
              <X size={18} strokeWidth={2.25} color="#111" />
            </Pressable>
          </View>
          <ScrollView style={styles.sheetBody} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Popover({ open, onClose, title, footer, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
        <Backdrop onClose={onClose} />
        <View style={[styles.pop, { paddingBottom: insets.bottom + 18 }]}>
          <Pressable onPress={onClose} style={styles.popClose} accessibilityLabel="Close">
            <X size={18} strokeWidth={2.2} color="#111" />
          </Pressable>
          <T weight="serif" style={styles.popTitle}>
            {title}
          </T>
          <ScrollView style={styles.popBody} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={styles.popFoot}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function FullScreen({ open, onClose, title, footer, children }: Props) {
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <SafeAreaView style={styles.full} edges={["top", "bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
          <View style={styles.fullHead}>
            <Pressable onPress={onClose} style={styles.back} accessibilityLabel="Close" hitSlop={8}>
              <Arrow name="navLeft" />
            </Pressable>
            <T weight="semibold" style={styles.fullTitle}>
              {title.toUpperCase()}
            </T>
          </View>
          <ScrollView style={styles.fill} contentContainerStyle={styles.fullBody} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={styles.fullFoot}>{footer}</View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(10,10,10,0.5)" },

  sheet: {
    marginTop: "auto",
    maxHeight: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
  },
  grab: { alignSelf: "center", width: 40, height: 4, marginTop: 10, borderRadius: 2, backgroundColor: "#dcdcdc" },
  sheetHead: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  sheetTitle: { flex: 1, fontSize: 18, color: "#111" },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
  },
  sheetBody: { flexGrow: 0 },

  pop: {
    marginTop: "auto",
    maxHeight: "85%",
    paddingTop: 26,
    paddingHorizontal: 26,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: "#fff",
  },
  popClose: {
    position: "absolute",
    top: -54,
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  popTitle: { marginBottom: 18, fontSize: 28, lineHeight: 32, color: "#111", fontFamily: fonts.serif },
  popBody: { flexGrow: 0 },
  popFoot: { gap: 10, paddingTop: 16 },

  full: { flex: 1, backgroundColor: "#fff" },
  fullHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  back: { width: 36, height: 40, marginLeft: -6, alignItems: "center", justifyContent: "center" },
  fullTitle: { fontSize: 16, color: "#111" },
  fullBody: { padding: 18, paddingBottom: 32 },
  fullFoot: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#efefef",
    backgroundColor: "#fff",
  },
});
