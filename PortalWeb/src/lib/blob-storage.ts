import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

/**
 * Converts a base64 string to a Blob object
 */
function base64ToBlob(base64Data: string): Blob {
  // Extract the base64 content without the data URL prefix
  const base64Content = base64Data.split(",")[1]
  // Get the MIME type from the data URL
  const mimeType = base64Data.split(",")[0].split(":")[1].split(";")[0]

  // Decode the base64 string
  const binaryString = atob(base64Content)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return new Blob([bytes], { type: mimeType })
}

/**
 * Uploads a file or base64 string to Vercel Blob Storage
 * @param fileData File, Blob, or base64 string to upload
 * @param prefix Folder prefix for the file
 * @returns URL of the uploaded file
 */
export async function uploadToBlob(fileData: File | Blob | string, prefix = "uploads"): Promise<string> {
  try {
    let blob: Blob
    let fileName: string

    // Handle different input types
    if (typeof fileData === "string") {
      // Handle base64 string
      if (fileData.startsWith("data:")) {
        blob = base64ToBlob(fileData)
        // Extract file extension from MIME type
        const mimeType = fileData.split(",")[0].split(":")[1].split(";")[0]
        const extension = mimeType.split("/")[1]
        fileName = `${nanoid()}.${extension}`
      } else {
        // It's a URL, just return it
        return fileData
      }
    } else if (fileData instanceof File) {
      blob = fileData
      fileName = fileData.name
    } else {
      // It's already a Blob
      blob = fileData
      fileName = `${nanoid()}.${blob.type.split("/")[1] || "bin"}`
    }

    // Upload to Vercel Blob
    const { url } = await put(`${prefix}/${fileName}`, blob, {
      access: "public",
    })

    return url
  } catch (error) {
    console.error("Error uploading to Blob storage:", error)
    throw new Error("Failed to upload file")
  }
}
