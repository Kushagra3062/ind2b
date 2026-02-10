import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "ranjeshroy97099@gmail.com"







export async function sendEmail({
  to,
  subject,
  html,
  from = FROM_EMAIL,
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Exception sending email:", error)
    return { success: false, error }
  }
}
