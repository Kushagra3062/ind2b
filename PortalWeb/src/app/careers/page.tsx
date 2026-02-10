import { connectProfileDB } from "@/lib/profileDb"
import CareerFilters from "./career-filters"

type CareerType = "full-time" | "part-time" | "internship" | "contract"

interface Career {
  _id: string
  title: string
  type: CareerType
  location: string
  isRemote: boolean
  description: string
  responsibilities: string[]
  requirements: string[]
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  applyUrl?: string
  applyEmail?: string
  applicationDeadline?: string
  createdAt: string
}

async function getCareers(): Promise<Career[]> {
  try {
    console.log("[v0] Fetching careers from database...")
    const connection = await connectProfileDB()
    const Career = connection.models.Career

    if (!Career) {
      console.error("[v0] Career model not found")
      return []
    }

    const careers = await Career.find({ isActive: true }).sort({ createdAt: -1 }).lean()

    console.log("[v0] Found careers:", careers.length)

    return careers.map((career: any) => ({
      _id: career._id.toString(),
      title: career.title,
      type: career.type,
      location: career.location,
      isRemote: career.isRemote,
      description: career.description,
      responsibilities: career.responsibilities || [],
      requirements: career.requirements || [],
      salaryMin: career.salaryMin,
      salaryMax: career.salaryMax,
      salaryCurrency: career.salaryCurrency || "INR",
      applyUrl: career.applyUrl,
      applyEmail: career.applyEmail,
      applicationDeadline: career.applicationDeadline?.toISOString(),
      createdAt: career.createdAt?.toISOString() || new Date().toISOString(),
    }))
  } catch (error) {
    console.error("[v0] Error fetching careers:", error)
    return []
  }
}

const formatSalary = (min?: number, max?: number, currency = "INR") => {
  if (!min && !max) return null
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  })
  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
  if (min) return `From ${formatter.format(min)}`
  if (max) return `Up to ${formatter.format(max)}`
  return null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const getTypeColor = (type: CareerType) => {
  switch (type) {
    case "full-time":
      return "bg-blue-100 text-blue-800"
    case "part-time":
      return "bg-green-100 text-green-800"
    case "internship":
      return "bg-purple-100 text-purple-800"
    case "contract":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function CareersPage() {
  const careers = await getCareers()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
            <p className="text-lg md:text-xl text-gray-300">
              Build your career with us. Explore exciting opportunities and grow with a dynamic team.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section - Client Component */}
      <CareerFilters careers={careers} />
    </div>
  )
}
