"use client"

import { useRef, useState } from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  SendIcon,
} from "lucide-react"

import { VariablePicker } from "@/components/bulk-email/variable-picker"
import { VariableTextarea } from "@/components/bulk-email/variable-textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { findEmailField } from "@/lib/csv"
import { personalize, textToHtml } from "@/lib/personalize"
import type {
  Contact,
  EmailDraft,
  EmailList,
  SendProgress,
  SendResult,
} from "@/lib/types"

const SEND_DELAY_MS = 500

interface EmailComposerProps {
  activeList: EmailList | null
  draft: EmailDraft
  onDraftChange: (draft: EmailDraft) => void
}

export function EmailComposer({
  activeList,
  draft,
  onDraftChange,
}: EmailComposerProps) {
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [progress, setProgress] = useState<SendProgress>({
    current: 0,
    total: 0,
    status: "idle",
    results: [],
  })

  const fields = activeList?.fields ?? []
  const contacts = activeList?.contacts ?? []
  const emailField = activeList ? findEmailField(activeList.fields) : null

  const handleInsertVariable = (variable: string) => {
    const textarea = bodyRef.current
    if (!textarea) {
      onDraftChange({ ...draft, body: draft.body + variable })
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newBody =
      draft.body.slice(0, start) + variable + draft.body.slice(end)
    onDraftChange({ ...draft, body: newBody })

    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + variable.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const handleSend = async () => {
    if (!activeList || !emailField) return
    if (!draft.subject.trim() || !draft.body.trim()) return

    const validContacts = contacts.filter((contact) =>
      contact.fields[emailField]?.trim()
    )

    if (validContacts.length === 0) return

    setProgress({
      current: 0,
      total: validContacts.length,
      status: "sending",
      results: [],
    })

    const results: SendResult[] = []

    for (let i = 0; i < validContacts.length; i++) {
      const contact = validContacts[i]
      const result = await sendToContact(
        contact,
        emailField,
        draft.subject,
        draft.body
      )
      results.push(result)

      setProgress({
        current: i + 1,
        total: validContacts.length,
        status: "sending",
        results: [...results],
      })

      if (i < validContacts.length - 1) {
        await delay(SEND_DELAY_MS)
      }
    }

    const hasFailures = results.some((r) => !r.success)
    setProgress({
      current: validContacts.length,
      total: validContacts.length,
      status: hasFailures ? "error" : "done",
      results,
    })
  }

  const canSend =
    activeList &&
    emailField &&
    draft.subject.trim() &&
    draft.body.trim() &&
    contacts.some((c) => c.fields[emailField]?.trim()) &&
    progress.status !== "sending"

  const succeeded = progress.results.filter((r) => r.success).length
  const failed = progress.results.filter((r) => !r.success).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Composer</CardTitle>
        <CardDescription>
          Write a personalized email using dynamic variables from your list.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={draft.subject}
            onChange={(e) =>
              onDraftChange({ ...draft, subject: e.target.value })
            }
            placeholder="Welcome to {{company}}"
          />
        </div>

        <VariablePicker fields={fields} onInsert={handleInsertVariable} />

        <div className="space-y-2">
          <Label htmlFor="body">Email body</Label>
          <VariableTextarea
            ref={bodyRef}
            id="body"
            value={draft.body}
            onChange={(e) =>
              onDraftChange({ ...draft, body: e.target.value })
            }
            placeholder={`Hi {{name}},\n\nWelcome to {{company}}.`}
            rows={10}
          />
        </div>

        {!emailField && activeList && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Missing email field</AlertTitle>
            <AlertDescription>
              Your list needs an &quot;email&quot; column to send messages.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={handleSend} disabled={!canSend} className="w-fit">
            {progress.status === "sending" ? (
              <>
                <Loader2Icon className="animate-spin" />
                Sending {progress.current}/{progress.total}...
              </>
            ) : (
              <>
                <SendIcon />
                Send to {contacts.length} contact
                {contacts.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>

          {progress.status === "sending" && (
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
          )}
        </div>

        {progress.status === "done" && (
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>All emails sent</AlertTitle>
            <AlertDescription>
              Successfully sent {succeeded} email
              {succeeded !== 1 ? "s" : ""}.
            </AlertDescription>
          </Alert>
        )}

        {progress.status === "error" && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Completed with errors</AlertTitle>
            <AlertDescription>
              <p>
                Sent {succeeded}, failed {failed}.
              </p>
              {progress.results
                .filter((r) => !r.success)
                .slice(0, 5)
                .map((r) => (
                  <p key={r.to} className="mt-1 font-mono text-xs">
                    {r.to}: {r.error}
                  </p>
                ))}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

async function sendToContact(
  contact: Contact,
  emailField: string,
  subjectTemplate: string,
  bodyTemplate: string
): Promise<SendResult> {
  const to = contact.fields[emailField].trim()
  const subject = personalize(subjectTemplate, contact.fields)
  const body = personalize(bodyTemplate, contact.fields)
  const html = textToHtml(body)

  try {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html, text: body }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { to, success: false, error: data.error ?? "Send failed" }
    }

    return { to, success: true, id: data.id }
  } catch (err) {
    return {
      to,
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
