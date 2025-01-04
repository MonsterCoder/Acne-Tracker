'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ImageContextType {
  imageData: string | null
  setImageData: (data: string | null) => void
}

const ImageContext = createContext<ImageContextType | undefined>(undefined)

export function ImageProvider({ children }: { children: ReactNode }) {
  const [imageData, setImageData] = useState<string | null>(null)

  return (
    <ImageContext.Provider value={{ imageData, setImageData }}>
      {children}
    </ImageContext.Provider>
  )
}

export function useImage() {
  const context = useContext(ImageContext)
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider')
  }
  return context
} 