"use client"

import { MailIcon } from "lucide-react"

import { EmailComposer } from "@/components/bulk-email/email-composer"
import { ListManager } from "@/components/bulk-email/list-manager"
import { Separator } from "@/components/ui/separator"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  DEFAULT_DRAFT,
  STORAGE_KEYS,
} from "@/lib/storage"
import type { EmailDraft, EmailList } from "@/lib/types"

export function BulkEmailApp() {
  const [lists, setLists, listsHydrated] = useLocalStorage<EmailList[]>(
    STORAGE_KEYS.lists,
    []
  )
  const [activeListId, setActiveListId, activeHydrated] = useLocalStorage<
    string | null
  >(STORAGE_KEYS.activeListId, null)
  const [draft, setDraft, draftHydrated] = useLocalStorage<EmailDraft>(
    STORAGE_KEYS.draft,
    DEFAULT_DRAFT
  )

  const isHydrated = listsHydrated && activeHydrated && draftHydrated
  const activeList = lists.find((list) => list.id === activeListId) ?? null

  if (!isHydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-6">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <MailIcon className="size-4" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-medium">Bulk Mail</h1>
            <p className="text-sm text-muted-foreground">
              Local-first bulk email sender
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <ListManager
          lists={lists}
          activeListId={activeListId}
          onListsChange={setLists}
          onActiveListChange={setActiveListId}
        />

        <Separator />

        <EmailComposer
          activeList={activeList}
          draft={draft}
          onDraftChange={setDraft}
        />
      </main>
    </div>
  )
}
