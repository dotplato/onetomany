import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

interface SendEmailBody {
  to: string
  subject: string
  html: string
  text: string
}

export async function POST(request: NextRequest) {
  try {
    const resend = getResendClient()
    if (!resend) {
      return NextResponse.json(
        { error: "Resend API key is not configured" },
        { status: 500 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL
    if (!fromEmail) {
      return NextResponse.json(
        { error: "From email is not configured (RESEND_FROM_EMAIL)" },
        { status: 500 }
      )
    }

    const body = (await request.json()) as SendEmailBody
    const { to, subject, html, text } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: `Invalid email address: ${to}` },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    })

    if (error) {
      console.error("[API /send] Resend error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error("[API /send] Error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}
