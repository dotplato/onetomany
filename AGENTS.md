
# shadcn/ui - Base Rhea Theme

## Overview

This is a **shadcn/ui** project using the **base-rhea** theme with Next.js 16, React 19, and Tailwind CSS v4. The theme features a modern design with OKLCH color space for consistent, accessible colors across light and dark modes.

## Theme Configuration

- **Style**: base-rhea
- **Color Space**: OKLCH (modern, perceptually uniform)
- **Base Color**: Neutral
- **CSS Variables**: Enabled for theming

## Color System

### Light Mode
- **Background**: `oklch(1 0 0)` - White
- **Foreground**: `oklch(0.145 0 0)` - Dark gray/black
- **Primary**: `oklch(0.852 0.199 91.936)` - Golden yellow
- **Secondary**: `oklch(0.967 0.001 286.375)` - Light purple
- **Destructive**: `oklch(0.577 0.245 27.325)` - Red-orange

### Dark Mode
- **Background**: `oklch(0.145 0 0)` - Dark gray
- **Foreground**: `oklch(0.985 0 0)` - Off-white
- **Primary**: `oklch(0.795 0.184 86.047)` - Golden yellow (adjusted)
- **Secondary**: `oklch(0.274 0.006 286.033)` - Dark purple
- **Destructive**: `oklch(0.704 0.191 22.216)` - Bright red

## Border Radius Scale

- **sm**: 60% of base
- **md**: 80% of base
- **lg**: 100% of base (0.45rem)
- **xl**: 140% of base
- **2xl**: 180% of base

## Available Components

50+ pre-configured components including buttons, forms, cards, dialogs, tables, charts, and more.

## Quick Import Examples

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
```

## Dark Mode Support

Uses `next-themes` for automatic theme switching:

```tsx
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle
    </button>
  )
}
```

## Key Dependencies

- **Next.js 16** - Framework with Turbopack
- **React 19** - Latest React version
- **Tailwind CSS v4** - Utility-first CSS
- **@base-ui/react** - Headless components
- **lucide-react** - Icon library
- **recharts** - Charts
- **sonner** - Toast notifications


# Rules & Conventions 

This document outlines best practices, conventions, and recommendations for building using this base-rhea shadcn/ui project.

## Project Architecture


## Code Conventions

### Naming Conventions

**Files & Directories:**
- Use kebab-case for component files: `user-profile.tsx`, `auth-form.tsx`
- Use camelCase for utility files: `authUtils.ts`, `apiClient.ts`
- Group related features in folders with index.ts exports

**Components:**
- Use camelCase for custom hooks: `useAuth`, `useFetchData`
- Use ALL_CAPS for constants: `MAX_FILE_SIZE`, `API_BASE_URL`

**Functions:**
- Use camelCase: `fetchUser()`, `handleSubmit()`, `parseData()`
- Use descriptive names: `getUserById()` not `getUser()`
- Prefix event handlers with `handle`: `handleClick()`, `handleSubmit()`
- Prefix query functions with `use` for hooks: `useUser()`, `usePosts()`

**Variables:**
- Use descriptive names: `isLoading` not `load`, `userData` not `data`
- Use boolean prefixes: `is`, `has`, `can`, `should`: `isValid`, `hasError`

### TypeScript Conventions

```tsx
// Always define props interfaces
interface UserCardProps {
  userId: string
  onSelect?: (id: string) => void
}

// Use const for components
const UserCard: React.FC<UserCardProps> = ({ userId, onSelect }) => {
  return <div>User: {userId}</div>
}

// Export components explicitly
export { UserCard }
```

### Component Development

**Structure:**
1. Imports at top
2. Type/Interface definitions
3. Component definition with proper props
4. Hooks (useState, useEffect, custom hooks)
5. Event handlers
6. Render logic (separated into smaller components if needed)

**Example:**
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FormProps {
  onSubmit: (data: FormData) => void
}

interface FormData {
  name: string
  email: string
}

export function UserForm({ onSubmit }: FormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit({ name, email })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  )
}
```

## Styling Conventions

### Tailwind CSS Guidelines
FOLLOW THE CURRENT SHADCN UI THEME 
**Color Usage:**
- Use semantic design tokens: `text-foreground`, `bg-background`
- Never use hardcoded colors like `text-white`, `bg-black`
- For primary actions: `bg-primary text-primary-foreground`
- For destructive actions: `bg-destructive text-destructive-foreground`

**Spacing:**
- Use Tailwind spacing scale: `p-4`, `m-2`, `gap-6`
- Never use arbitrary values like `p-[16px]` unless absolutely necessary
- Use `space-x-*` and `space-y-*` for child spacing

**Layout:**
- Prefer flexbox for 1D layouts: `flex items-center justify-between`
- Use grid for 2D layouts: `grid grid-cols-3 gap-4`
- Mobile-first: `md:grid-cols-2 lg:grid-cols-3`

**Common Patterns:**
```tsx
// Container
<div className="max-w-4xl mx-auto px-4">

// Centered content
<div className="flex items-center justify-center min-h-screen">

// Card
<div className="rounded-lg border bg-card p-6 shadow-sm">

// Button group
<div className="flex gap-2">
  <Button>Action 1</Button>
  <Button variant="outline">Action 2</Button>
</div>

// Form field
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

## State Management

### Client State

**Use React hooks for simple state:**
```tsx
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)
```

**Use SWR for data fetching & caching:**
```tsx
import useSWR from 'swr'

export function UsersList() {
  const { data: users, isLoading, error } = useSWR('/api/users')
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading users</div>
  
  return <div>{users?.map(u => <div key={u.id}>{u.name}</div>)}</div>
}
```

### Server State

**Use Server Components by default:**
```tsx
// app/users/page.tsx (Server Component)
export default async function UsersPage() {
  const users = await fetchUsers()
  return <UsersList initialUsers={users} />
}
```

**Minimal client-side interactivity:**
```tsx
'use client'

import { useState } from 'react'

interface UsersListProps {
  initialUsers: User[]
}

export function UsersList({ initialUsers }: UsersListProps) {
  const [selected, setSelected] = useState<string | null>(null)
  
  return (
    <div>
      {initialUsers.map(u => (
        <div
          key={u.id}
          onClick={() => setSelected(u.id)}
          className={selected === u.id ? 'bg-primary' : ''}
        >
          {u.name}
        </div>
      ))}
    </div>
  )
}
```

## API Conventions

### API Routes

**Structure:**
```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Validate query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }
    
    // Fetch data
    const data = await fetchUser(id)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Create resource
    const result = await createUser(body)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Error Handling:**
- Always use appropriate HTTP status codes (400, 401, 403, 404, 500)
- Return consistent error format: `{ error: string }`
- Log errors with context: `console.error('[API] Error in POST /users:', error)`

### API Client

```tsx
// lib/api.ts
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

// Usage
const user = await apiCall<User>('/users/1')
```



## Authentication & Security

### Session Management

```tsx
// lib/auth.ts
import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return null
  
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  return session
}
```

### Protected Routes

```tsx
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return <>{children}</>
}
```

### Input Validation

```tsx
// Always validate user input
function handleUserInput(input: string) {
  if (!input || input.trim().length === 0) {
    throw new Error('Input cannot be empty')
  }
  
  if (input.length > 500) {
    throw new Error('Input too long')
  }
  
  return input.trim()
}
```

## Error Handling

### Client-Side

```tsx
'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function FormWithErrorHandling() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await submitForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </>
  )
}
```

### Server-Side

```tsx
// app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // Process data
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /submit]', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 400 }
    )
  }
}
```

## Performance Best Practices

### Image Optimization

```tsx
import Image from 'next/image'

// Always use Next.js Image component
<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={64}
  height={64}
  className="rounded-full"
/>

// Never use <img> tag directly
```

### Code Splitting

```tsx
// Use dynamic imports for large components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => <div>Loading...</div>,
})
```

### Data Fetching

```tsx
// Revalidate data periodically
export const revalidate = 3600 // 1 hour

export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 },
  }).then(r => r.json())
  
  return <div>{data}</div>
}
```
``

## Logging & Debugging

### Console Logging Convention

```tsx
// Use prefixed logs for clarity
console.log('[Component] Message')
console.error('[API] Error:', error)
console.warn('[Hook] Warning')

// Example
console.log('[UserForm] Submitting:', { name, email })
```

### Remove Logs Before Commit

Always clean up debug logs before pushing code. Remove all `console.log()` statements used for debugging.


