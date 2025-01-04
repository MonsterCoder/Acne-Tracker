'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toast as toast } from '@/components/ui/toast'

interface AnalysisResult {
  acneCount: number
  severity: string
  locations: string[]
}

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        setResults(parsedData)
        console.log(parsedData)
      } catch (error) {
        console.error('Error parsing results:', error)
        toast({
          title: "Error",
          description: "Failed to load analysis results",
          variant: "destructive",
        })
        router.push('/capture')
      }
    } else {
      toast({
        title: "Error",
        description: "No analysis data found",
        variant: "destructive",
      })
      router.push('/capture')
    }
  }, [searchParams, router])

  if (!results) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <h1 className="text-3xl font-bold mb-8">Analysis Results</h1>
      <Card className="w-full max-w-md mb-8">
        <CardHeader>
          <CardTitle>Acne Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Acne Count: {results.total_detected}</p>
          {/* loop through results.records, display each record */}
          {/* only if results.records is not empty   */}
          {results.records && results.records.length > 0 && (
            results.records.map((record, index) => (
              <p key={index}>{record.location}</p>
            ))
          )}

          {/* <p><strong>Acne Count:</strong> {results.acneCount}</p>
          <p><strong>Severity Level:</strong> {results.severity}</p>
          <p><strong>Affected Areas:</strong> {results.locations.join(', ')}</p> */}
        </CardContent>
      </Card>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/capture">New Capture</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/history">View History</Link>
        </Button>
      </div>
    </div>
  )
}

