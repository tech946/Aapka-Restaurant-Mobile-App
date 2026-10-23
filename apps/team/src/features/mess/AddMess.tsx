import {
  DELIVERY_UNIT_ORDER,
  MEAL_NAME,
  aed,
  cap,
  errorMessage,
  fmtMessStartDate,
  fmtMessTime,
  type DeliveryUnit,
  type MealType,
  type MessCategory,
  type MessRow,
  type Zone,
} from "@aapka/shared";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ContactIcon, RowIcon } from "@/components/art/Art";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { FullScreen, Popover } from "@/components/ui/Overlays";
import { PopButton } from "@/components/ui/PopButton";
import { T } from "@/components/ui/Text";
import { api } from "@/lib/api";
import { fonts } from "@/theme";
import { FoodTag } from "./FoodTag";
import { Chip, Chips, FormError, Input, MoneyInput, SectionTitle, Stepper, formStyles } from "./form";

type Draft = {
  name: string;
  phone: string;
  zoneId: string;
  building: string;
  flat: string;
  food: MealType;
  meals: DeliveryUnit[];
  times: Record<DeliveryUnit, string>;
  people: number;
  type: MessCategory;
  start: string;
  amount: string;
  received: string;
  note: string;
};

const STEPS = ["customer", "plan", "payment"] as const;
const REVIEW = STEPS.length;
const TITLES = ["who is this mess for?", "what will they eat, and when?", "how much will they pay?", "check everything before adding"];

const INFO: Record<string, string> = {
  name: "The customer’s name, as it shows on the roster and the delivery list.",
  phone: "Used for call and WhatsApp. You’ll see a warning if another mess already has this number.",
  zone: "The delivery area this mess belongs to — it decides which route and delivery agent get it.",
  building: "Building or hotel name the delivery agent will look for.",
  flat: "Flat, room or office number, so the delivery reaches the right door.",
  food: "Whether this customer gets veg or non veg meals.",
  meals: "Tap each meal they take, then set the time it should reach them.",
  people: "How many people eat from this mess — each gets a full portion.",
  "starts on": "First day of delivery. Today is picked for you.",
  "mess type": "Tag it as a new or old mess — the same tag you can filter by on the list.",
  monthly: "What the customer pays every month.",
  received: "Money already collected for this month. Leave it empty if nothing yet.",
  note: "Anything the delivery agent should know: gate code, call on arrival, food preferences.",
};

const SLOT_OF: Record<DeliveryUnit, { status: string; time: string }> = {
  BF: { status: "Yes (BF)", time: "08:00" },
  L: { status: "Yes (L)", time: "13:00" },
  D: { status: "Yes (D)", time: "20:00" },
};

const blank = (today: string): Draft => ({
  name: "",
  phone: "",
  zoneId: "",
  building: "",
  flat: "",
  food: "Veg",
  meals: [],
  times: { BF: SLOT_OF.BF.time, L: SLOT_OF.L.time, D: SLOT_OF.D.time },
  people: 1,
  type: "new",
  start: today,
  amount: "",
  received: "",
  note: "",
});

const digits = (s: string) => s.replace(/\D/g, "");
const money = (s: string) => (s.trim() === "" ? 0 : Number(s));

function missing(d: Draft, step: number): string[] {
  if (step === 0) {
    return [!d.name.trim() ? "name" : "", !d.zoneId ? "zone" : "", d.phone.trim() && digits(d.phone).length < 7 ? "a full phone number" : ""].filter(Boolean);
  }
  if (step === 1) return [!d.meals.length ? "at least one meal" : "", !d.start ? "a start date" : ""].filter(Boolean);
  if (step === 2) {
    const received = money(d.received);
    return [!(money(d.amount) > 0) ? "the monthly amount" : "", Number.isNaN(received) || received < 0 ? "a valid received amount" : ""].filter(Boolean);
  }
  return [];
}

function bodyFrom(d: Draft) {
  const has = (u: DeliveryUnit) => d.meals.includes(u);
  const amount = money(d.amount);
  const received = money(d.received);
  return {
    start_date: d.start,
    customer_name: d.name.trim(),
    contact: d.phone.trim(),
    zone_id: d.zoneId,
    building: d.building.trim(),
    flat: d.flat.trim(),
    meal_time_count: d.meals.length,
    person_count: d.people,
    meal_type: d.food,
    morning_status: has("BF") ? SLOT_OF.BF.status : "No",
    morning_time: has("BF") ? d.times.BF || null : null,
    afternoon_status: has("L") ? SLOT_OF.L.status : "No",
    afternoon_time: has("L") ? d.times.L || null : null,
    evening_status: has("D") ? SLOT_OF.D.status : "No",
    evening_time: has("D") ? d.times.D || null : null,
    payment_status: received >= amount ? "Done" : "Pending",
    subscription_amount: amount,
    received_amount: received,
    remark: d.note.trim(),
    is_active: true,
    mess_category: d.type,
  };
}

const joinWords = (w: string[]) => (w.length < 2 ? w.join("") : `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}`);

type Props = { open: boolean; onClose: () => void; rows: MessRow[]; zones: Zone[]; today: string };

export function AddMess({ open, onClose, rows, zones, today }: Props) {
  const [d, setD] = useState<Draft>(() => blank(today));
  const [step, setStepRaw] = useState(0);
  const [tip, setTip] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStep = (n: number) => {
    setTip(null);
    setStepRaw(n);
  };
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((x) => ({ ...x, [key]: value }));
  const toggleMeal = (u: DeliveryUnit) =>
    set("meals", d.meals.includes(u) ? d.meals.filter((m) => m !== u) : DELIVERY_UNIT_ORDER.filter((m) => m === u || d.meals.includes(m)));

  const fresh = blank(today);
  const dirty = (Object.keys(fresh) as (keyof Draft)[]).some((k) => JSON.stringify(d[k]) !== JSON.stringify(fresh[k]));
  const blockers = missing(d, step);
  const zoneName = zones.find((z) => z.id === d.zoneId)?.name ?? "";
  const phoneDigits = digits(d.phone);
  const sameNumber = phoneDigits.length >= 7 ? rows.find((r) => digits(r.contact).slice(-9) === phoneDigits.slice(-9)) : undefined;
  const amount = money(d.amount);
  const received = money(d.received);
  const due = Math.max(amount - received, 0);

  function reset() {
    setD(blank(today));
    setStep(0);
    setError(null);
  }

  function back() {
    if (step > 0) return setStep(step - 1);
    if (dirty) return setConfirmDiscard(true);
    onClose();
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const row = await api.addMess(bodyFrom(d));
      onClose();
      reset();
      router.push({ pathname: "/mess/[id]", params: { id: row.id, added: "1" } });
    } catch (e) {
      setError(errorMessage(e, "Couldn’t add this mess. Try again."));
    } finally {
      setSaving(false);
    }
  }

  const q = (name: string, children: ReactNode, optional?: boolean) => (
    <Q name={name} optional={optional} tip={tip} onTip={setTip}>
      {children}
    </Q>
  );

  const footer = (
    <View style={{ flex: 1, gap: 8 }}>
      <FormError>{error}</FormError>
      {step < REVIEW && blockers.length ? <T style={styles.hint}>add {joinWords(blockers)} to continue</T> : null}
      {step < REVIEW ? (
        <PopButton block arrow disabled={blockers.length > 0} onPress={() => setStep(step + 1)}>
          {step === REVIEW - 1 ? "Review" : "Next"}
        </PopButton>
      ) : (
        <PopButton block busy={saving} onPress={() => void save()}>
          Add mess
        </PopButton>
      )}
    </View>
  );

  return (
    <>
      <FullScreen open={open} onClose={back} title="add mess" footer={footer}>
        <View style={styles.progress}>
          <View style={styles.bars}>
            {STEPS.map((s, i) => (
              <View key={s} style={[styles.bar, i <= step && styles.barOn]} />
            ))}
          </View>
          <T style={styles.progressLabel}>
            {step < REVIEW ? (
              <>
                step {step + 1} of {STEPS.length} ·{" "}
                <T weight="semibold" style={{ color: "#111" }}>
                  {STEPS[step]}
                </T>
              </>
            ) : (
              <T weight="semibold" style={{ color: "#111" }}>
                check and add
              </T>
            )}
          </T>
        </View>

        <T weight="serif" style={styles.title}>
          {TITLES[step]}
        </T>

        {step === 0 ? (
          <>
            {q("name", <Input value={d.name} onChangeText={(v) => set("name", v)} autoCapitalize="words" maxLength={120} placeholder="customer name" />)}
            {q("phone", <Input value={d.phone} onChangeText={(v) => set("phone", v)} keyboardType="phone-pad" maxLength={30} placeholder="05x xxx xxxx" />)}
            {sameNumber ? (
              <T style={styles.warn}>
                <T weight="bold" style={{ color: "#b4400b" }}>
                  !{" "}
                </T>
                {sameNumber.name} already uses this number
              </T>
            ) : null}
            {q(
              "zone",
              <Chips>
                {zones.map((z) => (
                  <Chip key={z.id} on={d.zoneId === z.id} onPress={() => set("zoneId", z.id)}>
                    {z.name}
                  </Chip>
                ))}
                {!zones.length ? <T style={styles.note}>No zones yet — add one from the dashboard.</T> : null}
              </Chips>,
            )}
            <View style={formStyles.two}>
              <View style={formStyles.half}>{q("building", <Input value={d.building} onChangeText={(v) => set("building", v)} maxLength={120} placeholder="building name" />)}</View>
              <View style={formStyles.half}>{q("flat", <Input value={d.flat} onChangeText={(v) => set("flat", v)} maxLength={60} placeholder="flat / room" />)}</View>
            </View>
          </>
        ) : null}

        {step === 1 ? (
          <>
            {q(
              "food",
              <Chips>
                {(["Veg", "Non Veg"] as const).map((f) => (
                  <Chip key={f} on={d.food === f} onPress={() => set("food", f)}>
                    {f === "Veg" ? "Veg" : "Non veg"}
                  </Chip>
                ))}
              </Chips>,
            )}
            {q(
              "meals",
              <>
                <Chips>
                  {DELIVERY_UNIT_ORDER.map((u) => (
                    <Chip key={u} on={d.meals.includes(u)} onPress={() => toggleMeal(u)}>
                      {cap(MEAL_NAME[u])}
                    </Chip>
                  ))}
                </Chips>
                {d.meals.map((u) => (
                  <View key={u} style={styles.time}>
                    <T style={styles.timeLabel}>{MEAL_NAME[u]} at</T>
                    <View style={{ flex: 1 }}>
                      <DateTimeField mode="time" value={d.times[u]} onChange={(v) => set("times", { ...d.times, [u]: v })} label={fmtMessTime(d.times[u]).toLowerCase()} />
                    </View>
                  </View>
                ))}
              </>,
            )}
            {q("people", <Stepper value={d.people} onChange={(n) => set("people", n)} />)}
            {q("starts on", <DateTimeField mode="date" value={d.start} onChange={(v) => set("start", v)} label={fmtMessStartDate(d.start)} />)}
            {q(
              "mess type",
              <Chips>
                {(["new", "old"] as const).map((t) => (
                  <Chip key={t} on={d.type === t} onPress={() => set("type", t)}>
                    {`${cap(t)} mess`}
                  </Chip>
                ))}
              </Chips>,
            )}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <View style={formStyles.two}>
              <View style={formStyles.half}>{q("monthly", <MoneyInput value={d.amount} onChange={(v) => set("amount", v)} />)}</View>
              <View style={formStyles.half}>{q("received", <MoneyInput value={d.received} onChange={(v) => set("received", v)} />)}</View>
            </View>
            {amount > 0 ? (
              <View style={[styles.pay, due ? styles.payDue : null]}>
                {due ? <View style={styles.payDot} /> : <Check size={15} strokeWidth={2.6} color="#1c6b3c" />}
                <T weight="medium" style={{ color: due ? "#b4400b" : "#1c6b3c", fontSize: 13.5 }}>
                  {due ? `${aed(due)} due this month` : "paid in full"}
                </T>
              </View>
            ) : null}
            {q(
              "note",
              <Input value={d.note} onChangeText={(v) => set("note", v)} multiline maxLength={500} placeholder="gate code, call on arrival, preferences…" />,
              true,
            )}
          </>
        ) : null}

        {step === REVIEW ? (
          <View style={{ gap: 14 }}>
            <ReviewBlock title="customer" onEdit={() => setStep(0)}>
              <T weight="semibold" style={styles.reviewName}>
                {d.name.trim()}
              </T>
              <ReviewLine icon={<RowIcon name="Pin" size={17} />}>{[zoneName, d.building.trim(), d.flat.trim()].filter(Boolean).join(" · ")}</ReviewLine>
              <ReviewLine icon={<ContactIcon name="PhoneDevice" size={17} />}>{d.phone.trim() || "no phone"}</ReviewLine>
            </ReviewBlock>
            <ReviewBlock title="plan" onEdit={() => setStep(1)}>
              <ReviewLine icon={<RowIcon name="Timer" size={17} />}>
                {d.meals.map((u) => `${MEAL_NAME[u]} ${d.times[u] ? fmtMessTime(d.times[u]).toLowerCase() : ""}`.trim()).join(", ")}
              </ReviewLine>
              <ReviewLine icon={<RowIcon name="People" size={17} />}>
                {`${d.people} ${d.people === 1 ? "person" : "people"} · ${d.type} mess`}
              </ReviewLine>
              <ReviewLine icon={<RowIcon name="Calendar" size={17} />}>{`starts ${fmtMessStartDate(d.start)}`}</ReviewLine>
              <FoodTag food={d.food} />
            </ReviewBlock>
            <ReviewBlock title="payment" onEdit={() => setStep(2)}>
              <T weight="semibold" style={styles.reviewAmount}>
                {aed(amount)} <T style={{ fontSize: 13, color: "#8a8a8a" }}>a month</T>
              </T>
              <ReviewLine icon={<RowIcon name="Coins" size={17} />}>{`${aed(received)} received · ${due ? `${aed(due)} due` : "paid in full"}`}</ReviewLine>
              {d.note.trim() ? <ReviewLine icon={<RowIcon name="Note" size={17} />}>{d.note.trim()}</ReviewLine> : null}
            </ReviewBlock>
          </View>
        ) : null}
      </FullScreen>

      <Popover
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="discard this mess?"
        footer={
          <>
            <PopButton
              block
              onPress={() => {
                setConfirmDiscard(false);
                onClose();
                reset();
              }}
            >
              Discard
            </PopButton>
            <PopButton block variant="light" onPress={() => setConfirmDiscard(false)}>
              Keep editing
            </PopButton>
          </>
        }
      >
        <T style={{ fontSize: 15, color: "#555" }}>What you’ve typed for this mess will be lost.</T>
      </Popover>
    </>
  );
}

function Q({
  name,
  optional,
  tip,
  onTip,
  children,
}: {
  name: string;
  optional?: boolean;
  tip: string | null;
  onTip: (name: string | null) => void;
  children: ReactNode;
}) {
  const open = tip === name;
  return (
    <View style={styles.q}>
      <View style={styles.qBox}>
        <View style={styles.legend}>
          <Pressable onPress={() => onTip(open ? null : name)} accessibilityLabel={`What is ${name}?`} hitSlop={8}>
            <RowIcon name="Info" size={14} color={open ? "#f97316" : "#8a8a8a"} />
          </Pressable>
          <T weight="semibold" style={styles.legendText}>
            {name.toUpperCase()}
            {optional ? <T style={{ color: "#9c9c9c", fontSize: 10.5 }}> · OPTIONAL</T> : null}
          </T>
        </View>
        {children}
      </View>
      {open ? <T style={styles.tip}>{INFO[name]}</T> : null}
    </View>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <View style={styles.reviewBlock}>
      <View style={styles.reviewHead}>
        <SectionTitle>{title}</SectionTitle>
        <Pressable onPress={onEdit} hitSlop={8}>
          <T weight="semibold" style={{ color: "#f0592a", fontSize: 13 }}>
            Edit
          </T>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function ReviewLine({ icon, children }: { icon: ReactNode; children: string }) {
  return (
    <View style={styles.reviewLine}>
      {icon}
      <T style={{ flex: 1, fontSize: 14, color: "#333" }}>{children}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { marginBottom: 16, gap: 8 },
  bars: { flexDirection: "row", gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#ececec" },
  barOn: { backgroundColor: "#f97316" },
  progressLabel: { fontSize: 12.5, color: "#8a8a8a" },
  title: { marginBottom: 18, fontSize: 28, lineHeight: 32, color: "#111", fontFamily: fonts.serif },
  q: { marginBottom: 16 },
  qBox: { paddingTop: 16, paddingHorizontal: 12, paddingBottom: 12, borderWidth: 1, borderColor: "#e3e3e3", borderRadius: 8, gap: 10 },
  legend: {
    position: "absolute",
    top: -9,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 5,
    backgroundColor: "#fff",
  },
  legendText: { fontSize: 10.5, letterSpacing: 1.4, color: "#6f6f6f" },
  tip: { marginTop: 6, padding: 10, borderRadius: 8, backgroundColor: "#1c1c1c", color: "#fff", fontSize: 12.5, lineHeight: 18 },
  warn: { marginTop: -8, marginBottom: 14, fontSize: 13, color: "#b4400b" },
  note: { fontSize: 13, color: "#8a8a8a" },
  time: { flexDirection: "row", alignItems: "center", gap: 10 },
  timeLabel: { width: 90, fontSize: 14, color: "#555" },
  pay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#e6f4ec",
  },
  payDue: { backgroundColor: "#fff1e7" },
  payDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#f97316" },
  hint: { textAlign: "center", fontSize: 12.5, color: "#8a8a8a" },
  reviewBlock: { padding: 14, borderWidth: 1, borderColor: "#ececec", borderRadius: 12, gap: 8 },
  reviewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reviewName: { fontSize: 18, color: "#111" },
  reviewAmount: { fontSize: 20, color: "#111" },
  reviewLine: { flexDirection: "row", alignItems: "center", gap: 8 },
});
