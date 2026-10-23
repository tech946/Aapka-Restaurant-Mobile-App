import { errorMessage, messBodyFrom, type MessSubscriptionRecord } from "@aapka/shared";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

export type SheetKind = "food" | "type" | "people" | "start" | "meals" | "payment" | "note";

export function useMessEditor(record: MessSubscriptionRecord | undefined, editable: boolean, onSaved: () => void, initialToast: string | null) {
  const [rec, setRec] = useState<MessSubscriptionRecord | null>(record ?? null);
  const [draft, setDraft] = useState<MessSubscriptionRecord | null>(record ?? null);
  const [lastRecord, setLastRecord] = useState(record);
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(initialToast);

  if (record !== lastRecord) {
    setLastRecord(record);
    if (record) {
      setRec(record);
      if (!sheet && !profileOpen) setDraft(record);
    }
  }

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const set = <K extends keyof MessSubscriptionRecord>(key: K, value: MessSubscriptionRecord[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  function startEdit() {
    setDraft(rec);
    setSaveError(null);
  }

  function open(kind: SheetKind) {
    if (!editable) return;
    startEdit();
    setSheet(kind);
  }

  function openProfile() {
    if (!editable) return;
    startEdit();
    setProfileOpen(true);
  }

  async function save(next: MessSubscriptionRecord, message = "saved"): Promise<boolean> {
    if (saving) return false;
    if (!next.customer_name.trim()) {
      setSaveError("Customer name is required.");
      return false;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await api.updateMess(next.id, messBodyFrom(next));
      setRec({ ...next, ...saved });
      setToast(message);
      onSaved();
      return true;
    } catch (e) {
      setSaveError(errorMessage(e, "Couldn’t save. Try again."));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveSheet(next = draft) {
    if (next && (await save(next))) setSheet(null);
  }

  async function saveProfile() {
    if (!draft) return;
    if (!draft.zone_id) return setSaveError("Pick a zone.");
    if (await save(draft, "profile updated")) setProfileOpen(false);
  }

  return {
    rec,
    draft,
    set,
    sheet,
    closeSheet: () => setSheet(null),
    profileOpen,
    closeProfile: () => setProfileOpen(false),
    saving,
    saveError,
    toast,
    showToast: setToast,
    open,
    openProfile,
    save,
    saveSheet,
    saveProfile,
  };
}

export type MessEditor = ReturnType<typeof useMessEditor>;
