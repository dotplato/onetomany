"use client"

import { useRef, useState } from "react"
import {
  ListPlusIcon,
  PencilIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"

import { ContactTable } from "@/components/bulk-email/contact-table"
import { CreateListDialog } from "@/components/bulk-email/create-list-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseCSV } from "@/lib/csv"
import { generateId } from "@/lib/id"
import type { Contact, EmailList } from "@/lib/types"

interface ListManagerProps {
  lists: EmailList[]
  activeListId: string | null
  onListsChange: (lists: EmailList[]) => void
  onActiveListChange: (id: string | null) => void
}

export function ListManager({
  lists,
  activeListId,
  onListsChange,
  onActiveListChange,
}: ListManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingList, setEditingList] = useState<EmailList | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const activeList = lists.find((list) => list.id === activeListId) ?? null

  const handleUpload = async (file: File) => {
    setUploadError(null)

    try {
      const text = await file.text()
      const { headers, rows } = parseCSV(text)

      if (headers.length === 0) {
        setUploadError("CSV file has no headers.")
        return
      }

      if (rows.length === 0) {
        setUploadError("CSV file has no data rows.")
        return
      }

      const contacts: Contact[] = rows.map((row) => ({
        id: generateId(),
        fields: row,
      }))

      const listName = file.name.replace(/\.csv$/i, "")
      const newList: EmailList = {
        id: generateId(),
        name: listName,
        fields: headers,
        contacts,
        createdAt: new Date().toISOString(),
      }

      onListsChange([...lists, newList])
      onActiveListChange(newList.id)
    } catch {
      setUploadError("Failed to parse CSV file.")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    e.target.value = ""
  }

  const handleCreateList = (list: EmailList) => {
    onListsChange([...lists, list])
    onActiveListChange(list.id)
  }

  const handleUpdateList = (list: EmailList) => {
    onListsChange(lists.map((item) => (item.id === list.id ? list : item)))
  }

  const handleSaveList = (list: EmailList) => {
    if (editingList) {
      handleUpdateList(list)
    } else {
      handleCreateList(list)
    }
  }

  const openCreateDialog = () => {
    setEditingList(null)
    setDialogOpen(true)
  }

  const openEditDialog = () => {
    if (!activeList) return
    setEditingList(activeList)
    setDialogOpen(true)
  }

  const handleUpdateContact = (
    contactId: string,
    field: string,
    value: string
  ) => {
    if (!activeList) return

    const updatedLists = lists.map((list) => {
      if (list.id !== activeList.id) return list
      return {
        ...list,
        contacts: list.contacts.map((contact) =>
          contact.id === contactId
            ? {
                ...contact,
                fields: { ...contact.fields, [field]: value },
              }
            : contact
        ),
      }
    })
    onListsChange(updatedLists)
  }

  const handleDeleteContact = (contactId: string) => {
    if (!activeList) return

    const updatedLists = lists.map((list) => {
      if (list.id !== activeList.id) return list
      return {
        ...list,
        contacts: list.contacts.filter(
          (contact) => contact.id !== contactId
        ),
      }
    })
    onListsChange(updatedLists)
  }

  const handleDeleteList = () => {
    if (!activeList) return

    const updatedLists = lists.filter((list) => list.id !== activeList.id)
    onListsChange(updatedLists)
    onActiveListChange(updatedLists[0]?.id ?? null)
  }

  const handleRenameList = (name: string) => {
    if (!activeList) return

    const updatedLists = lists.map((list) =>
      list.id === activeList.id ? { ...list, name } : list
    )
    onListsChange(updatedLists)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Lists</CardTitle>
        <CardDescription>
          Import contacts from CSV or build a list manually.
        </CardDescription>
        <CardAction>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
              Upload List
            </Button>
            <Button onClick={openCreateDialog}>
              <ListPlusIcon />
              Create List
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {uploadError && (
          <p className="text-sm text-destructive">{uploadError}</p>
        )}

        {lists.length > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="active-list">Active list</Label>
              <select
                id="active-list"
                value={activeListId ?? ""}
                onChange={(e) =>
                  onActiveListChange(e.target.value || null)
                }
                className="flex h-8 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.contacts.length} contacts)
                  </option>
                ))}
              </select>
            </div>

            {activeList && (
              <div className="flex flex-1 items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="list-name-edit">List name</Label>
                  <Input
                    id="list-name-edit"
                    value={activeList.name}
                    onChange={(e) => handleRenameList(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={openEditDialog}
                  aria-label="Edit list"
                >
                  <PencilIcon />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDeleteList}
                  aria-label="Delete list"
                >
                  <Trash2Icon />
                </Button>
              </div>
            )}
          </div>
        )}

        {activeList && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {activeList.contacts.length} contact
              {activeList.contacts.length !== 1 ? "s" : ""} ·{" "}
              {activeList.fields.length} field
              {activeList.fields.length !== 1 ? "s" : ""}
            </p>
            <ContactTable
              fields={activeList.fields}
              contacts={activeList.contacts}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
            />
          </div>
        )}

        {lists.length === 0 && (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No lists yet. Upload a CSV or create a list to begin.
          </div>
        )}
      </CardContent>

      <CreateListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        list={editingList}
        onSave={handleSaveList}
      />
    </Card>
  )
}
