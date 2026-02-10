"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createTestData, getProfileData } from "@/actions/profile"

export default function TestDataPage() {
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [message, setMessage] = useState("")

  const handleCreateTestData = async () => {
    setLoading(true)
    setMessage("")
    try {
      const result = await createTestData()
      if (result.success) {
        setMessage("✅ Test data created successfully!")
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGetProfileData = async () => {
    setLoading(true)
    setMessage("")
    try {
      const result = await getProfileData()
      if (result.success) {
        setProfileData(result.data)
        setMessage("✅ Profile data retrieved successfully!")
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Debug: Profile Data Test</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleCreateTestData} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Creating..." : "Create Test Data"}
              </Button>
              <Button 
                onClick={handleGetProfileData} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Loading..." : "Get Profile Data"}
              </Button>
            </div>
            
            {message && (
              <div className={`p-4 rounded-md ${
                message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        {profileData && (
          <Card>
            <CardHeader>
              <CardTitle>Retrieved Profile Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(profileData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
