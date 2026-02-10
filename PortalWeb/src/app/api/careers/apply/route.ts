import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { sendEmail } from "@/lib/email"
import { generateApplicationConfirmationEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract form fields
    const {
      careerId,
      careerTitle,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      education,
      collegeName,
      experience,
      skills,
      cvUrl,
      coverLetter,
      whyInterested,
      linkedinUrl,
      portfolioUrl,
      availableFrom,
      expectedSalary,
    } = body

    // Validate required fields
    if (!careerId || !careerTitle || !fullName || !email || !phone || !cvUrl || !collegeName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate CV URL format
    try {
      new URL(cvUrl)
    } catch {
      return NextResponse.json({ error: "Invalid CV URL format" }, { status: 400 })
    }

    // Validate skills array
    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: "At least one skill is required" }, { status: 400 })
    }

    console.log("[v0] Connecting to database...")
    // Connect to database
    const connection = await connectProfileDB()
    const Applicant = connection.models.Applicant

    if (!Applicant) {
      console.error("[v0] Applicant model not found")
      return NextResponse.json({ error: "Database model not found" }, { status: 500 })
    }

    // Check if user already applied for this job
    const existingApplication = await Applicant.findOne({
      careerId,
      email,
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this position" }, { status: 400 })
    }

    console.log("[v0] Creating new application...")
    const application = await Applicant.create({
      careerId,
      careerTitle,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      education,
      collegeName,
      experience: experience || "N/A",
      skills,
      cvUrl,
      coverLetter: coverLetter || "N/A",
      whyInterested,
      linkedinUrl: linkedinUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
      status: "pending",
      appliedAt: new Date(),
    })

    console.log("[v0] Application created successfully:", application._id)

    try {
      console.log("[v0] Sending confirmation email to:", email)
      const emailHtml = generateApplicationConfirmationEmail({
        fullName,
        email,
        careerTitle,
        applicationId: application._id.toString(),
        appliedAt: application.appliedAt,
      })

      const emailResult = await sendEmail({
        to: email,
        subject: `Application Received: ${careerTitle} at IND2B`,
        html: emailHtml,
      })

      if (emailResult.success) {
        console.log("[v0] Confirmation email sent successfully")
      } else {
        console.error("[v0] Failed to send confirmation email:", emailResult.error)
        // Don't fail the application submission if email fails
      }
    } catch (emailError) {
      console.error("[v0] Error sending confirmation email:", emailError)
      // Don't fail the application submission if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        applicationId: application._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error submitting application:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit application" },
      { status: 500 },
    )
  }
}
