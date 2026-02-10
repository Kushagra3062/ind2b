"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface JobApplicationFormProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  jobTitle: string
}

export default function JobApplicationForm({ isOpen, onClose, jobId, jobTitle }: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    education: "",
    collegeName: "",
    experience: "",
    coverLetter: "",
    whyInterested: "",
    cvUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    availableFrom: "",
    expectedSalary: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()])
      setCurrentSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (!formData.cvUrl.trim()) {
        setError("Please provide your CV/Resume URL")
        setIsSubmitting(false)
        return
      }

      // Validate URL format
      try {
        new URL(formData.cvUrl)
      } catch {
        setError("Please provide a valid URL for your CV/Resume")
        setIsSubmitting(false)
        return
      }

      if (skills.length === 0) {
        setError("Please add at least one skill")
        setIsSubmitting(false)
        return
      }

      const submitData = {
        careerId: jobId,
        careerTitle: jobTitle,
        skills: skills,
        ...formData,
      }

      const response = await fetch("/api/careers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application")
      }

      setIsSuccess(true)
      setTimeout(() => {
        onClose()
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          education: "",
          collegeName: "",
          experience: "",
          coverLetter: "",
          whyInterested: "",
          cvUrl: "",
          linkedinUrl: "",
          portfolioUrl: "",
          availableFrom: "",
          expectedSalary: "",
        })
        setSkills([])
        setIsSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Apply for {jobTitle}</DialogTitle>
          <DialogDescription>Fill out the form below to submit your application</DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h3 className="text-2xl font-bold text-green-700">Application Submitted!</h3>
            <p className="text-gray-600 text-center max-w-md">
              Thank you for applying! We've sent a confirmation email to your inbox. Our team will review your
              application and reach out within a week.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Mumbai"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>

              <div className="space-y-2">
                <Label htmlFor="education">Education *</Label>
                <Textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  required
                  placeholder="Bachelor's in Computer Science (2020)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collegeName">College/University Name *</Label>
                <Input
                  id="collegeName"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  required
                  placeholder="XYZ University"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">
                  Work Experience{" "}
                  <span className="text-muted-foreground text-sm font-normal">(if any, otherwise fill N/A)</span>
                </Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="Describe your relevant work experience or enter N/A if not applicable..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">If you don't have work experience, please enter "N/A"</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills *</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Node.js)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill} variant="outline">
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvUrl">CV/Resume URL *</Label>
                <Input
                  id="cvUrl"
                  name="cvUrl"
                  type="url"
                  value={formData.cvUrl}
                  onChange={handleInputChange}
                  required
                  placeholder="https://drive.google.com/file/d/your-cv-link or https://yourwebsite.com/cv.pdf"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a link to your CV/Resume (Google Drive, Dropbox, personal website, etc.)
                </p>
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Application Details</h3>

              <div className="space-y-2">
                <Label htmlFor="whyInterested">Why are you interested in this role? *</Label>
                <Textarea
                  id="whyInterested"
                  name="whyInterested"
                  value={formData.whyInterested}
                  onChange={handleInputChange}
                  required
                  placeholder="Tell us why you're excited about this opportunity..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter">
                  Cover Letter{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    (optional - if any, otherwise fill N/A)
                  </span>
                </Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  placeholder="Write a brief cover letter or enter N/A if not applicable..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Cover letter is optional. You may enter "N/A" if you prefer not to provide one.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio/Website</Label>
                  <Input
                    id="portfolioUrl"
                    name="portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input
                    id="availableFrom"
                    name="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">Expected Salary (Annual)</Label>
                  <Input
                    id="expectedSalary"
                    name="expectedSalary"
                    type="number"
                    value={formData.expectedSalary}
                    onChange={handleInputChange}
                    placeholder="500000"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
