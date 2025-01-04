'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Toast as toast } from '@/components/ui/toast'
import { useImage } from '@/context/ImageContext'

export default function UploadPage() {
  const router = useRouter()
  const { imageData, setImageData } = useImage()

  const handleUpload = async () => {
    if (!imageData) {
      toast({
        title: "Error",
        description: "No image available",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', dataURItoBlob(imageData));

      const response = await fetch('http://localhost:8000/api/acne/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      router.push(`/results?data=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      console.error('Error in handleUpload:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const handleRetake = () => {
    setImageData(null);
    router.push('/capture');
  };

  function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <h1 className="text-3xl font-bold mb-8">Review Your Image</h1>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-6">
          {imageData ? (
            <img 
              src={imageData} 
              alt="Captured" 
              className="mb-4 max-w-full h-auto rounded" 
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center mb-4 rounded">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
          <div className="space-x-4">
            <Button onClick={handleUpload}>Upload for Analysis</Button>
            <Button onClick={handleRetake}>Retake Photo</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 