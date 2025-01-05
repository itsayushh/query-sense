import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          SQL Assistant
        </h1>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed">
          Generate and execute SQL queries using natural language. Connect your database or upload a schema to get started.
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/databases">Connect Database</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
