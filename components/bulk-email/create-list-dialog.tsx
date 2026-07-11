"use client"

import { useEffect, useState } from "react"
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateId } from "@/lib/id"
import type { Contact, EmailList } from "@/lib/types"

interface FieldDefinition {
  id: string
  name: string
}

interface FormEntry {
  contactId: string | null
  values: Record<string, string>
}

interface CreateListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list?: EmailList | null
  onSave: (list: EmailList) => void
}

function createInitialForm(): {
  fields: FieldDefinition[]
  entries: FormEntry[]
} {
  const nameField = { id: generateId(), name: "name" }
  const emailField = { id: generateId(), name: "email" }

  return {
    fields: [nameField, emailField],
    entries: [
      {
        contactId: null,
        values: { [nameField.id]: "", [emailField.id]: "" },
      },
    ],
  }
}

function listToFormState(list: EmailList): {
  listName: string
  fields: FieldDefinition[]
  entries: FormEntry[]
} {
  const fields = list.fields.map((name) => ({
    id: generateId(),
    name,
  }))

  const entries: FormEntry[] =
    list.contacts.length > 0
      ? list.contacts.map((contact) => ({
          contactId: contact.id,
          values: Object.fromEntries(
            fields.map((field) => [
              field.id,
              contact.fields[field.name] ?? "",
            ])
          ),
        }))
      : [
          {
            contactId: null,
            values: Object.fromEntries(
              fields.map((field) => [field.id, ""])
            ),
          },
        ]

  return { listName: list.name, fields, entries }
}

function normalizeFieldName(name: string, fallback: string): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "_")
  return normalized || fallback
}

export function CreateListDialog({
  open,
  onOpenChange,
  list,
  onSave,
}: CreateListDialogProps) {
  const isEditing = Boolean(list)
  const [listName, setListName] = useState("My List")
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [entries, setEntries] = useState<FormEntry[]>([])

  useEffect(() => {
    if (!open) return

    if (list) {
      const form = listToFormState(list)
      setListName(form.listName)
      setFields(form.fields)
      setEntries(form.entries)
    } else {
      const initial = createInitialForm()
      setListName("My List")
      setFields(initial.fields)
      setEntries(initial.entries)
    }
  }, [open, list])

  const handleAddField = () => {
    const newField = { id: generateId(), name: `field${fields.length + 1}` }
    setFields((prev) => [...prev, newField])
    setEntries((prev) =>
      prev.map((entry) => ({
        ...entry,
        values: { ...entry.values, [newField.id]: "" },
      }))
    )
  }

  const handleRemoveField = (fieldId: string) => {
    if (fields.length <= 1) return
    setFields((prev) => prev.filter((field) => field.id !== fieldId))
    setEntries((prev) =>
      prev.map((entry) => {
        const nextValues = { ...entry.values }
        delete nextValues[fieldId]
        return { ...entry, values: nextValues }
      })
    )
  }

  const handleFieldNameChange = (fieldId: string, name: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, name } : field
      )
    )
  }

  const handleAddEntry = () => {
    const emptyValues: Record<string, string> = {}
    fields.forEach((field) => {
      emptyValues[field.id] = ""
    })
    setEntries((prev) => [...prev, { contactId: null, values: emptyValues }])
  }

  const handleRemoveEntry = (index: number) => {
    if (entries.length <= 1) return
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEntryChange = (
    index: number,
    fieldId: string,
    value: string
  ) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index
          ? { ...entry, values: { ...entry.values, [fieldId]: value } }
          : entry
      )
    )
  }

  const handleSave = () => {
    const resolvedFields = fields.map((field, index) => ({
      id: field.id,
      name: normalizeFieldName(field.name, `field_${index + 1}`),
    }))

    const fieldNames = resolvedFields.map((field) => field.name)

    const contacts: Contact[] = entries
      .filter((entry) =>
        Object.values(entry.values).some((value) => value.trim() !== "")
      )
      .map((entry) => ({
        id: entry.contactId ?? generateId(),
        fields: Object.fromEntries(
          resolvedFields.map((field) => [
            field.name,
            entry.values[field.id] ?? "",
          ])
        ),
      }))

    const savedList: EmailList = {
      id: list?.id ?? generateId(),
      name: listName.trim() || "Untitled List",
      fields: fieldNames,
      contacts,
      createdAt: list?.createdAt ?? new Date().toISOString(),
    }

    onSave(savedList)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit List" : "Create List"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update fields, contacts, and list details."
              : "Define custom fields and add contacts manually."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">List name</Label>
            <Input
              id="list-name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="My List"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fields</Label>
              <Button variant="outline" size="sm" onClick={handleAddField}>
                <PlusIcon />
                Add field
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-1">
                  <Input
                    value={field.name}
                    onChange={(e) =>
                      handleFieldNameChange(field.id, e.target.value)
                    }
                    className="h-8 w-28 font-mono text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveField(field.id)}
                    disabled={fields.length <= 1}
                    aria-label={`Remove ${field.name} field`}
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Entries</Label>
              <Button variant="outline" size="sm" onClick={handleAddEntry}>
                <PlusIcon />
                Add entry
              </Button>
            </div>
            <ScrollArea className="max-h-64 rounded-2xl border p-3">
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <div
                    key={entry.contactId ?? `new-${index}`}
                    className="flex items-start gap-2 rounded-xl border p-3"
                  >
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      {fields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <Label className="text-xs capitalize text-muted-foreground">
                            {field.name}
                          </Label>
                          <Input
                            value={entry.values[field.id] ?? ""}
                            onChange={(e) =>
                              handleEntryChange(
                                index,
                                field.id,
                                e.target.value
                              )
                            }
                            placeholder={field.name}
                            className="h-8"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveEntry(index)}
                      disabled={entries.length <= 1}
                      aria-label="Remove entry"
                    >
                      <Trash2Icon className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Save Changes" : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
