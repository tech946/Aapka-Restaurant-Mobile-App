import { MEAL_STATUS_OPTIONS, fmtMessStartDate, fmtMessTime, type MessSubscriptionRecord, type Zone } from "@aapka/shared";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { DateTimeField } from "@/components/ui/DateTimeField";
import { FullScreen, Popover } from "@/components/ui/Overlays";
import { T } from "@/components/ui/Text";
import { Chip, Chips, CredButton, Field, FormError, Input, MoneyInput, Options, Radio, Stepper, formStyles } from "../form";
import type { MessEditor } from "./use-mess-editor";

const SLOT_LABEL: Record<string, string> = {
  No: "No meal",
  "Yes (BF)": "Breakfast",
  "Yes (L)": "Lunch",
  "Yes (D)": "Dinner",
  "Yes (BF+L)": "Breakfast + lunch",
  "Yes (L+D)": "Lunch + dinner",
};

const SLOTS = [
  { key: "morning", label: "morning" },
  { key: "afternoon", label: "afternoon" },
  { key: "evening", label: "evening" },
] as const;

type SlotKey = (typeof SLOTS)[number]["key"];

const paidInFull = (r: MessSubscriptionRecord): MessSubscriptionRecord => ({ ...r, received_amount: r.subscription_amount, payment_status: "Done" });

export function EditSheets({ editor }: { editor: MessEditor }) {
  const { draft, rec, set, sheet, closeSheet, saving, saveError, saveSheet } = editor;
  if (!draft || !rec) return null;

  const footer = (secondary?: ReactNode) => (
    <>
      <FormError>{saveError}</FormError>
      <CredButton busy={saving} onPress={() => void saveSheet()}>
        Save changes
      </CredButton>
      {secondary}
    </>
  );

  const unpaid = draft.received_amount < draft.subscription_amount || draft.payment_status !== "Done";

  return (
    <>
      <Popover open={sheet === "food"} onClose={closeSheet} title="food preference" footer={footer()}>
        <Options label="this mess eats">
          <Radio first label="Veg" on={draft.meal_type === "Veg"} onPress={() => set("meal_type", "Veg")} />
          <Radio label="Non veg" on={draft.meal_type === "Non Veg"} onPress={() => set("meal_type", "Non Veg")} />
        </Options>
      </Popover>

      <Popover open={sheet === "type"} onClose={closeSheet} title="mess type" footer={footer()}>
        <Options label="this mess is">
          <Radio first label="New mess" on={draft.mess_category === "new"} onPress={() => set("mess_category", "new")} />
          <Radio label="Old mess" on={draft.mess_category === "old"} onPress={() => set("mess_category", "old")} />
          <Radio label="Not set" on={!draft.mess_category} onPress={() => set("mess_category", null)} />
        </Options>
      </Popover>

      <Popover open={sheet === "people"} onClose={closeSheet} title="people" footer={footer()}>
        <Options label="meals are for">
          <Stepper value={draft.person_count} onChange={(n) => set("person_count", n)} unit={["person", "people"]} />
        </Options>
      </Popover>

      <Popover open={sheet === "start"} onClose={closeSheet} title="start date" footer={footer()}>
        <Options label="mess started on">
          <DateTimeField mode="date" value={draft.start_date} onChange={(v) => set("start_date", v)} label={fmtMessStartDate(draft.start_date)} />
        </Options>
      </Popover>

      <Popover open={sheet === "meals"} onClose={closeSheet} title="meals" footer={footer()}>
        <Options label="meals a day">
          <Chips>
            {[1, 2, 3].map((n) => (
              <Chip key={n} on={draft.meal_time_count === n} onPress={() => set("meal_time_count", n)}>
                {`${n} ${n === 1 ? "time" : "times"}`}
              </Chip>
            ))}
          </Chips>
        </Options>
        <Options label="meal slots" first={false}>
          {SLOTS.map(({ key, label }) => (
            <SlotEditor key={key} slot={key} label={label} draft={draft} set={set} />
          ))}
        </Options>
      </Popover>

      <Popover
        open={sheet === "payment"}
        onClose={closeSheet}
        title="payment"
        footer={footer(
          unpaid ? (
            <CredButton outline disabled={saving} onPress={() => void saveSheet(paidInFull(draft))}>
              Mark paid in full
            </CredButton>
          ) : undefined,
        )}
      >
        <Options label="amounts">
          <View style={formStyles.two}>
            <View style={formStyles.half}>
              <Field label="monthly">
                <MoneyInput value={String(draft.subscription_amount)} onChange={(v) => set("subscription_amount", Math.max(0, Number(v) || 0))} />
              </Field>
            </View>
            <View style={formStyles.half}>
              <Field label="received">
                <MoneyInput value={String(draft.received_amount)} onChange={(v) => set("received_amount", Math.max(0, Number(v) || 0))} />
              </Field>
            </View>
          </View>
        </Options>
        <Options label="this month" first={false}>
          <Radio first label="Due" on={draft.payment_status !== "Done"} onPress={() => set("payment_status", "Pending")} />
          <Radio label="Paid" on={draft.payment_status === "Done"} onPress={() => set("payment_status", "Done")} />
        </Options>
      </Popover>

      <Popover
        open={sheet === "note"}
        onClose={closeSheet}
        title="note"
        footer={footer(
          rec.remark ? (
            <CredButton outline disabled={saving} onPress={() => void saveSheet({ ...draft, remark: "" })}>
              clear note
            </CredButton>
          ) : undefined,
        )}
      >
        <Options label="delivery instructions">
          <Input value={draft.remark} onChangeText={(v) => set("remark", v)} multiline maxLength={500} placeholder="gate code, call on arrival, preferences…" />
        </Options>
      </Popover>
    </>
  );
}

function SlotEditor({ slot, label, draft, set }: { slot: SlotKey; label: string; draft: MessSubscriptionRecord; set: MessEditor["set"] }) {
  const statusKey = `${slot}_status` as const;
  const timeKey = `${slot}_time` as const;
  const off = draft[statusKey] === "No";
  const options = [...new Set([...MEAL_STATUS_OPTIONS, draft[statusKey]].filter(Boolean))];
  const time = draft[timeKey];

  return (
    <View style={[styles.slot, off && styles.off]}>
      <T weight="semibold" style={styles.slotLabel}>
        {label}
      </T>
      <Chips>
        {options.map((v) => (
          <Chip key={v} on={draft[statusKey] === v} onPress={() => set(statusKey, v)}>
            {(SLOT_LABEL[v] ?? v).toLowerCase()}
          </Chip>
        ))}
      </Chips>
      <DateTimeField
        mode="time"
        value={(time ?? "").slice(0, 5)}
        onChange={(v) => set(timeKey, v || null)}
        disabled={off}
        label={time ? fmtMessTime(time).toLowerCase() : "no time"}
      />
    </View>
  );
}

export function ProfileEditor({ editor, zones }: { editor: MessEditor; zones: Zone[] }) {
  const { draft, set, profileOpen, closeProfile, saving, saveError, saveProfile } = editor;
  if (!draft) return null;

  return (
    <FullScreen
      open={profileOpen}
      onClose={closeProfile}
      title="edit profile"
      footer={
        <View style={styles.foot}>
          <FormError>{saveError}</FormError>
          <CredButton busy={saving} onPress={() => void saveProfile()}>
            Update profile
          </CredButton>
        </View>
      }
    >
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <T style={styles.avatarText}>{(draft.customer_name.trim() || "?").charAt(0).toUpperCase()}</T>
        </View>
        <Field label="name">
          <Input value={draft.customer_name} onChangeText={(v) => set("customer_name", v)} autoCapitalize="words" maxLength={120} />
        </Field>
        <Field label="phone">
          <Input value={draft.contact} onChangeText={(v) => set("contact", v)} keyboardType="phone-pad" maxLength={30} />
        </Field>
        <Field label="zone">
          <Chips>
            {zones.map((z) => (
              <Chip key={z.id} on={draft.zone_id === z.id} onPress={() => set("zone_id", z.id)}>
                {z.name}
              </Chip>
            ))}
          </Chips>
        </Field>
        <Field label="building">
          <Input value={draft.building} onChangeText={(v) => set("building", v)} maxLength={120} />
        </Field>
        <Field label="flat">
          <Input value={draft.flat} onChangeText={(v) => set("flat", v)} maxLength={60} />
        </Field>
      </View>
    </FullScreen>
  );
}

const styles = StyleSheet.create({
  slot: { gap: 8, paddingVertical: 6 },
  off: { opacity: 0.7 },
  slotLabel: { fontSize: 12, letterSpacing: 1, color: "#6f6f6f" },
  foot: { flex: 1, gap: 6 },
  profile: { gap: 18 },
  avatar: { alignSelf: "center", width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", backgroundColor: "#3f5361" },
  avatarText: { fontSize: 30, color: "#fff" },
});
