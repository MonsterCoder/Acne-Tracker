'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Toast as toast } from '@/components/ui/toast'

export default function CapturePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const handleCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!imagePreview) {
      toast({
        title: "Error",
        description: "No image selected",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      console.log('Starting image upload...')
      const formData = new FormData()
      formData.append('image', dataURItoBlob(imagePreview))

      console.log('Sending fetch request...')
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      console.log('Fetch response received:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      console.log('Parsing response JSON...')
      const result = await response.json()
      console.log('Parsed result:', result)

      if (result.error) {
        throw new Error(result.error)
      }

      console.log('Navigating to results page...')
      router.push(`/results?data=${encodeURIComponent(JSON.stringify(result))}`)
    } catch (error) {
      console.error('Error in handleUpload:', error)
      let errorMessage = 'An unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
        console.error('Error stack:', error.stack)
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1])
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mimeString })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <h1 className="text-3xl font-bold mb-8">Capture Your Image</h1>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-6">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="mb-4 max-w-full h-auto rounded" />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center mb-4 rounded">
              <p className="text-gray-500">No image captured</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="space-x-4">
            <Button onClick={handleCapture}>
              {imagePreview ? 'Recapture' : 'Capture Image'}
            </Button>
            <Button onClick={handleUpload} disabled={!imagePreview || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload for Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

