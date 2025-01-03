import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <h1 className="text-4xl font-bold mb-8">Welcome to Acne Tracker</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Track your acne progress over time and get insights to help improve your skin health.
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/capture">Start Tracking</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/history">View History</Link>
        </Button>
      </div>
    </div>
  )
}

