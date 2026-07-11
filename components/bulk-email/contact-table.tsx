"use client"

import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Contact } from "@/lib/types"

interface ContactTableProps {
  fields: string[]
  contacts: Contact[]
  onUpdateContact: (contactId: string, field: string, value: string) => void
  onDeleteContact: (contactId: string) => void
}

export function ContactTable({
  fields,
  contacts,
  onUpdateContact,
  onDeleteContact,
}: ContactTableProps) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No contacts yet. Upload a CSV or create a list to get started.
      </div>
    )
  }

  return (
    <ScrollArea className="max-h-96 rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((field) => (
              <TableHead key={field} className="capitalize">
                {field}
              </TableHead>
            ))}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              {fields.map((field) => (
                <TableCell key={field}>
                  <Input
                    value={contact.fields[field] ?? ""}
                    onChange={(e) =>
                      onUpdateContact(contact.id, field, e.target.value)
                    }
                    className="h-8 min-w-32 border-transparent bg-transparent shadow-none hover:border-input focus-visible:border-input"
                  />
                </TableCell>
              ))}
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDeleteContact(contact.id)}
                  aria-label="Delete contact"
                >
                  <Trash2Icon className="text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
