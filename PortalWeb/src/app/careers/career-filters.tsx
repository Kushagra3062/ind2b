"use client"

import { useState } from "react"
import { Briefcase, MapPin, IndianRupee, Calendar, Mail, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import JobApplicationForm from "./job-application-form"

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

interface CareerFiltersProps {
  careers: Career[]
}

export default function CareerFilters({ careers }: CareerFiltersProps) {
  const [selectedType, setSelectedType] = useState<string>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [applicationFormOpen, setApplicationFormOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<{ id: string; title: string } | null>(null)

  const filteredCareers = selectedType === "all" ? careers : careers.filter((c) => c.type === selectedType)

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
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "part-time":
        return "bg-green-100 text-green-800 border-green-200"
      case "internship":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "contract":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleApplyNow = (jobId: string, jobTitle: string) => {
    setSelectedJob({ id: jobId, title: jobTitle })
    setApplicationFormOpen(true)
  }

  return (
    <>
      {/* Filter Buttons */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
            className="rounded-full"
          >
            All Positions
          </Button>
          <Button
            variant={selectedType === "full-time" ? "default" : "outline"}
            onClick={() => setSelectedType("full-time")}
            className="rounded-full"
          >
            Full-time
          </Button>
          <Button
            variant={selectedType === "part-time" ? "default" : "outline"}
            onClick={() => setSelectedType("part-time")}
            className="rounded-full"
          >
            Part-time
          </Button>
          <Button
            variant={selectedType === "internship" ? "default" : "outline"}
            onClick={() => setSelectedType("internship")}
            className="rounded-full"
          >
            Internship
          </Button>
          <Button
            variant={selectedType === "contract" ? "default" : "outline"}
            onClick={() => setSelectedType("contract")}
            className="rounded-full"
          >
            Contract
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {filteredCareers.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No positions available</h3>
            <p className="text-gray-600">
              {selectedType === "all"
                ? "Check back soon for new opportunities!"
                : `No ${selectedType.replace("-", " ")} positions available at the moment.`}
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-3">
            {filteredCareers.map((career) => {
              const isExpanded = expandedId === career._id
              const salary = formatSalary(career.salaryMin, career.salaryMax, career.salaryCurrency)

              return (
                <div
                  key={career._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* Clickable Row Header */}
                  <button
                    onClick={() => toggleExpand(career._id)}
                    className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-tight">{career.title}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={`${getTypeColor(career.type)} text-xs`}>
                                {career.type.replace("-", " ")}
                              </Badge>
                              {career.isRemote && (
                                <Badge variant="outline" className="text-xs">
                                  Remote
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{career.location}</span>
                          </div>
                          {salary && (
                            <div className="flex items-center gap-1.5">
                              <IndianRupee className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{salary}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-tight">{career.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span>{career.location}</span>
                            </div>
                            {salary && (
                              <div className="flex items-center gap-1.5">
                                <IndianRupee className="w-4 h-4 flex-shrink-0" />
                                <span>{salary}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge className={`${getTypeColor(career.type)} text-xs whitespace-nowrap`}>
                            {career.type.replace("-", " ")}
                          </Badge>
                          {career.isRemote && (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              Remote
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="px-4 md:px-6 pb-5 pt-2 border-t border-gray-100 bg-gray-50/50 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-5">
                        {/* Application Deadline */}
                        {career.applicationDeadline && (
                          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">Apply by {formatDate(career.applicationDeadline)}</span>
                          </div>
                        )}

                        {/* Description */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            About the Role
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-sm md:text-base">{career.description}</p>
                        </div>

                        {/* Two Column Layout for Responsibilities and Requirements */}
                        <div className="grid md:grid-cols-2 gap-5">
                          {/* Responsibilities */}
                          {career.responsibilities && career.responsibilities.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Key Responsibilities</h4>
                              <ul className="space-y-2">
                                {career.responsibilities.map((resp, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                    <span className="flex-1">{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Requirements */}
                          {career.requirements && career.requirements.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                              <ul className="space-y-2">
                                {career.requirements.map((req, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                    <span className="flex-1">{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Apply Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-3">
                          <Button
                            onClick={() => handleApplyNow(career._id, career.title)}
                            className="flex-1 sm:flex-none"
                          >
                            Apply Now
                          </Button>

                          {career.applyEmail && (
                            <Button asChild variant="outline" className="flex-1 sm:flex-none bg-transparent">
                              <a href={`mailto:${career.applyEmail}`}>
                                <Mail className="w-4 h-4 mr-2" />
                                Email Application
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Job Application Form Modal */}
      {selectedJob && (
        <JobApplicationForm
          isOpen={applicationFormOpen}
          onClose={() => {
            setApplicationFormOpen(false)
            setSelectedJob(null)
          }}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
        />
      )}
    </>
  )
}
