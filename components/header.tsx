import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Acne Tracker</Link>
        <div className="space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/capture">Capture</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/history">History</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}

