"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Edit, Trash2, Briefcase } from "lucide-react"
import { toast } from "sonner"

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
  isActive: boolean
  applicationDeadline?: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function CareersAdminPage() {
  const [items, setItems] = useState<Career[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [filters, setFilters] = useState({ isActive: "", type: "" })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Career | null>(null)

  const fetchCareers = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.type && { type: filters.type }),
      })
      const res = await fetch(`/api/admin/carrers?${params}`)
      const json = await res.json()
      if (json.success) {
        setItems(json.data.items)
        setPagination(json.data.pagination)
      } else {
        toast.error(json.error || "Failed to fetch careers")
      }
    } catch (e) {
      toast.error("Error fetching careers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchCareers(1), 0)
    return () => clearTimeout(t)
  }, [filters])

  const openCreate = () => {
    setEditing(null)
    setIsModalOpen(true)
  }
  const openEdit = (item: Career) => {
    setEditing(item)
    setIsModalOpen(true)
  }
  const onSuccess = () => {
    setIsModalOpen(false)
    setEditing(null)
    fetchCareers(pagination.page)
  }

  const activeCount = useMemo(() => items.filter((i) => i.isActive).length, [items])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this career?")) return
    const res = await fetch(`/api/admin/carrers/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.success) {
      toast.success("Career deleted")
      fetchCareers(pagination.page)
    } else {
      toast.error(json.error || "Failed to delete")
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Careers Management</h1>
          <p className="text-gray-600 mt-1">Create and manage job/internship postings ({activeCount} active)</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Posting
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Internships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {items.filter((i) => i.type === "internship").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Remote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{items.filter((i) => i.isRemote).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters((p) => ({ ...p, isActive: e.target.value }))}
                className="w-full p-2 border rounded-md bg-white text-black"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
                className="w-full p-2 border rounded-md bg-white text-black"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Postings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Remote</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id} className="border-t">
                  <td className="py-3 pr-4 font-medium">{it.title}</td>
                  <td className="py-3 pr-4 capitalize">{it.type.replace("-", " ")}</td>
                  <td className="py-3 pr-4">{it.location}</td>
                  <td className="py-3 pr-4">{it.isRemote ? "Yes" : "No"}</td>
                  <td className="py-3 pr-4">{it.isActive ? "Active" : "Inactive"}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(it)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(it._id)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td className="py-6 text-gray-500" colSpan={6}>
                    No postings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isModalOpen && <CareerModal item={editing} onClose={() => setIsModalOpen(false)} onSuccess={onSuccess} />}
    </div>
  )
}

function CareerModal({
  item,
  onClose,
  onSuccess,
}: { item: Career | null; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState(item?.title || "")
  const [type, setType] = useState<CareerType>(item?.type || "full-time")
  const [location, setLocation] = useState(item?.location || "")
  const [isRemote, setIsRemote] = useState<boolean>(item?.isRemote || false)
  const [description, setDescription] = useState(item?.description || "")
  const [responsibilities, setResponsibilities] = useState((item?.responsibilities || []).join("\n"))
  const [requirements, setRequirements] = useState((item?.requirements || []).join("\n"))
  const [salaryMin, setSalaryMin] = useState<number | undefined>(item?.salaryMin)
  const [salaryMax, setSalaryMax] = useState<number | undefined>(item?.salaryMax)
  const [salaryCurrency, setSalaryCurrency] = useState(item?.salaryCurrency || "INR")
  const [applyUrl, setApplyUrl] = useState(item?.applyUrl || "")
  const [applyEmail, setApplyEmail] = useState(item?.applyEmail || "")
  const [isActive, setIsActive] = useState<boolean>(item?.isActive ?? true)
  const [applicationDeadline, setApplicationDeadline] = useState(item?.applicationDeadline?.slice(0, 10) || "")

  const submit = async () => {
    try {
      const payload = {
        title,
        type,
        location,
        isRemote,
        description,
        responsibilities: responsibilities
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        requirements: requirements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        salaryMin: typeof salaryMin === "number" ? salaryMin : undefined,
        salaryMax: typeof salaryMax === "number" ? salaryMax : undefined,
        salaryCurrency,
        applyUrl,
        applyEmail,
        isActive,
        applicationDeadline: applicationDeadline || undefined,
      }

      const res = await fetch(item?._id ? `/api/admin/carrers/${item._id}` : "/api/admin/carrers", {
        method: item?._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(item?._id ? "Career updated" : "Career created")
        onSuccess()
      } else {
        toast.error(json.error || "Failed to save career")
      }
    } catch (e) {
      toast.error("Error saving career")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">{item ? "Edit Posting" : "Create Posting"}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Close">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Frontend Engineer" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CareerType)}
              className="w-full p-2 border rounded-md"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Remote</label>
            <div className="flex items-center gap-3">
              <Switch checked={isRemote} onCheckedChange={setIsRemote} />
              <span className="text-sm text-gray-600">{isRemote ? "Remote" : "On-site"}</span>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Responsibilities (one per line)</label>
            <Textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={6} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Requirements (one per line)</label>
            <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={6} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Salary Min</label>
            <Input
              type="number"
              value={salaryMin ?? ""}
              onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., ₹600000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Salary Max</label>
            <Input
              type="number"
              value={salaryMax ?? ""}
              onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g., ₹1200000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Input value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)} placeholder="INR" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Apply URL</label>
            <Input value={applyUrl || ""} onChange={(e) => setApplyUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Apply Email</label>
            <Input
              value={applyEmail || ""}
              onChange={(e) => setApplyEmail(e.target.value)}
              placeholder="hr@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Application Deadline</label>
            <Input type="date" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-sm text-gray-600">{isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{item ? "Update" : "Create"}</Button>
        </div>
      </div>
    </div>
  )
}
