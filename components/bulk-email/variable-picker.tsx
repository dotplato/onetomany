"use client"

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

interface VariablePickerProps {
  fields: string[]
  onInsert: (variable: string) => void
}

export function VariablePicker({ fields, onInsert }: VariablePickerProps) {
  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Import or create a list to see available variables.
      </p>
    )
  }

  return (
    <div className="space-y-3 ">
      <Label >Available variables</Label>
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <Badge
            key={field}
            variant="default"
            className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 cursor-pointer font-mono text-xs"
            onClick={() => onInsert(`{{${field}}}`)}
          >
            {`{{${field}}}`}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Click a variable to insert it into the email body.
      </p>
    </div>
  )
}
