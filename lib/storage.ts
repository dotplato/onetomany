import type { EmailDraft, EmailList } from "@/lib/types"

export const STORAGE_KEYS = {
  lists: "bulk-email-lists",
  activeListId: "bulk-email-active-list-id",
  draft: "bulk-email-draft",
} as const

export const DEFAULT_DRAFT: EmailDraft = {
  subject: "",
  body: "",
}

export function loadLists(): EmailList[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.lists)
    return raw ? (JSON.parse(raw) as EmailList[]) : []
  } catch {
    return []
  }
}

export function saveLists(lists: EmailList[]): void {
  window.localStorage.setItem(STORAGE_KEYS.lists, JSON.stringify(lists))
}

export function loadActiveListId(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(STORAGE_KEYS.activeListId)
}

export function saveActiveListId(id: string | null): void {
  if (id) {
    window.localStorage.setItem(STORAGE_KEYS.activeListId, id)
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.activeListId)
  }
}

export function loadDraft(): EmailDraft {
  if (typeof window === "undefined") return DEFAULT_DRAFT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.draft)
    return raw ? (JSON.parse(raw) as EmailDraft) : DEFAULT_DRAFT
  } catch {
    return DEFAULT_DRAFT
  }
}

export function saveDraft(draft: EmailDraft): void {
  window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft))
}
