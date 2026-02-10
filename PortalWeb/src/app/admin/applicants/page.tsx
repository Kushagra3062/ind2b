"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, Search, Download, Mail, Phone, Calendar, Briefcase, GraduationCap, X, DollarSign } from "lucide-react"
import { toast } from "sonner"

interface Applicant {
  _id: string
  careerId: string
  careerTitle: string
  fullName: string
  email: string
  phone: string
  address: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  collegeName: string
  education: string
  skills: string[]
  experience: string
  cvUrl: string
  coverLetter: string
  linkedinUrl?: string
  portfolioUrl?: string
  availableFrom?: string
  expectedSalary?: number
  whyInterested: string
  status: string
  appliedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)

  const cleanDuplicatedName = (name: string): string => {
    if (!name) return name
    const words = name.trim().split(/\s+/)
    const halfLength = Math.floor(words.length / 2)

    // Check if the name is duplicated by comparing first half with second half
    if (words.length % 2 === 0 && words.length > 2) {
      const firstHalf = words.slice(0, halfLength).join(" ")
      const secondHalf = words.slice(halfLength).join(" ")

      if (firstHalf === secondHalf) {
        return firstHalf
      }
    }

    return name
  }

  const fetchApplicants = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
        ...(searchTerm && { search: searchTerm }),
      })
      const res = await fetch(`/api/admin/applicants?${params}`)
      const json = await res.json()
      if (json.success) {
        const cleanedApplicants = json.data.items.map((applicant: Applicant) => ({
          ...applicant,
          fullName: cleanDuplicatedName(applicant.fullName),
        }))
        setApplicants(cleanedApplicants)
        setPagination(json.data.pagination)
      } else {
        toast.error(json.error || "Failed to fetch applicants")
      }
    } catch (e) {
      toast.error("Error fetching applicants")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchApplicants(1), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleViewDetails = (applicant: Applicant) => {
    setSelectedApplicant(applicant)
  }

  const handleCloseModal = () => {
    setSelectedApplicant(null)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Job Applicants</h1>
          <p className="text-gray-600 mt-1">View and manage all job applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Jobs Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{new Set(applicants.map((a) => a.careerId)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recent (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {applicants.filter((a) => new Date(a.appliedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, job title, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Applications ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600 border-b">
              <tr>
                <th className="py-3 pr-4 font-semibold">Applicant Name</th>
                <th className="py-3 pr-4 font-semibold">Job Title</th>
                <th className="py-3 pr-4 font-semibold">Email</th>
                <th className="py-3 pr-4 font-semibold">Phone</th>
                <th className="py-3 pr-4 font-semibold">College</th>
                <th className="py-3 pr-4 font-semibold">Applied Date</th>
                <th className="py-3 pr-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant) => (
                <tr key={applicant._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium">{applicant.fullName}</td>
                  <td className="py-3 pr-4">{applicant.careerTitle}</td>
                  <td className="py-3 pr-4">{applicant.email}</td>
                  <td className="py-3 pr-4">{applicant.phone}</td>
                  <td className="py-3 pr-4">{applicant.collegeName}</td>
                  <td className="py-3 pr-4">{new Date(applicant.appliedAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">
                    <Button variant="secondary" size="sm" onClick={() => handleViewDetails(applicant)}>
                      <Eye className="w-4 h-4 mr-1" /> View Details
                    </Button>
                  </td>
                </tr>
              ))}
              {!applicants.length && !loading && (
                <tr>
                  <td className="py-8 text-center text-gray-500" colSpan={7}>
                    No applications found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="py-8 text-center text-gray-500" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchApplicants(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchApplicants(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {selectedApplicant && <ApplicantDetailsModal applicant={selectedApplicant} onClose={handleCloseModal} />}
    </div>
  )
}

function ApplicantDetailsModal({ applicant, onClose }: { applicant: Applicant; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{applicant.fullName}</h2>
              <p className="text-sm text-gray-600">Applied for: {applicant.careerTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition" aria-label="Close">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm">{applicant.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-sm">{applicant.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">College/University</p>
                  <p className="text-sm">{applicant.collegeName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Applied Date</p>
                  <p className="text-sm">{new Date(applicant.appliedAt).toLocaleString()}</p>
                </div>
              </div>
              {applicant.availableFrom && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available From</p>
                    <p className="text-sm">{new Date(applicant.availableFrom).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Full Address</p>
                <div className="text-sm space-y-1">
                  <p>{applicant.address}</p>
                  {applicant.city && applicant.state && (
                    <p>
                      {applicant.city}, {applicant.state} {applicant.zipCode}
                    </p>
                  )}
                  {applicant.country && <p>{applicant.country}</p>}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Education</p>
                <p className="text-sm">{applicant.education}</p>
              </div>
              {applicant.expectedSalary && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expected Salary</p>
                    <p className="text-sm">₹{applicant.expectedSalary.toLocaleString()}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Application Status</p>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm capitalize">
                  {applicant.status}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Work Experience</p>
            <p className="text-sm whitespace-pre-wrap">{applicant.experience}</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Why Interested in This Role?</p>
            <p className="text-sm whitespace-pre-wrap">{applicant.whyInterested}</p>
          </div>

          {applicant.coverLetter && applicant.coverLetter !== "N/A" && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Cover Letter</p>
              <p className="text-sm whitespace-pre-wrap">{applicant.coverLetter}</p>
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Resume/CV Link</p>
                <a
                  href={applicant.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {applicant.cvUrl}
                </a>
              </div>
            </div>
            {applicant.linkedinUrl && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">LinkedIn Profile</p>
                  <a
                    href={applicant.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {applicant.linkedinUrl}
                  </a>
                </div>
              </div>
            )}
            {applicant.portfolioUrl && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Portfolio</p>
                  <a
                    href={applicant.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {applicant.portfolioUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => window.open(`mailto:${applicant.email}`, "_blank")}>
            <Mail className="w-4 h-4 mr-2" />
            Contact Applicant
          </Button>
        </div>
      </div>
    </div>
  )
}
