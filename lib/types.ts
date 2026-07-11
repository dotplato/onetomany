export interface Contact {
  id: string
  fields: Record<string, string>
}

export interface EmailList {
  id: string
  name: string
  fields: string[]
  contacts: Contact[]
  createdAt: string
}

export interface EmailDraft {
  subject: string
  body: string
}

export interface SendResult {
  to: string
  success: boolean
  error?: string
  id?: string
}

export interface SendProgress {
  current: number
  total: number
  status: "idle" | "sending" | "done" | "error"
  results: SendResult[]
}
