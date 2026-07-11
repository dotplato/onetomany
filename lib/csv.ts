function parseLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export function parseCSV(text: string): {
  headers: string[]
  rows: Record<string, string>[]
} {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = parseLine(lines[0]).map((h) =>
    h.replace(/^"|"$/g, "").trim().toLowerCase()
  )

  const rows = lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = parseLine(line).map((v) => v.replace(/^"|"$/g, "").trim())
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] ?? ""
      })
      return row
    })

  return { headers, rows }
}

export function findEmailField(fields: string[]): string | null {
  const emailField = fields.find((f) => f.toLowerCase() === "email")
  return emailField ?? null
}
