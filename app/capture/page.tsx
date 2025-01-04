'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Toast as toast } from '@/components/ui/toast'
import { Modal } from '@/components/ui/Modal'

declare global {
  interface Window {
    cv: any;
  }
}

export default function CapturePage() {
  const [isCapturing, setIsCapturing] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const router = useRouter()
  
  const initializeWebcam = async () => {
    console.log('initializeWebcam called, videoRef:', videoRef.current);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } else {
        throw new Error('Video element not available');
      }
    } catch (error) {
      console.error('Error in initializeWebcam:', error);
      toast({
        title: "Error",
        description: "Could not access webcam",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isCapturing && !capturedImage) {
      initializeWebcam();
    }
    
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isCapturing]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        try {
          context.drawImage(videoRef.current, 0, 0);
          const imageData = canvasRef.current.toDataURL('image/jpeg');
          setCapturedImage(imageData);
          setIsCapturing(false);
          setIsModalOpen(true);
          
          const tracks = (videoRef.current.srcObject as MediaStream)?.getTracks();
          tracks?.forEach(track => track.stop());
        } catch (error) {
          console.error('Error during capture:', error);
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!capturedImage) {
      toast({
        title: "Error",
        description: "No image captured",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', dataURItoBlob(capturedImage));

      const response = await fetch('/api/analyze', {
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
    } finally {
      setIsUploading(false);
      setIsModalOpen(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setIsCapturing(true);
    setIsModalOpen(false);
    initializeWebcam();
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
      <h1 className="text-3xl font-bold mb-8">Capture Your Image</h1>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-6">
          {isCapturing ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              controls
              className="mb-4 max-w-full h-auto rounded"
            />
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="mb-4 max-w-full h-auto rounded" 
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center mb-4 rounded">
              <p className="text-gray-500">Initializing camera...</p>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="space-x-4">
            {isCapturing ? (
              <Button onClick={captureImage}>Capture</Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        onRetake={retake}
        capturedImage={capturedImage}
      />
    </div>
  );
}

