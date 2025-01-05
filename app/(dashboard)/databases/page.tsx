import { DatabaseConnectionForm } from "@/components/database/DatabaseConnectionForm";


export default function DatabasesPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Connect Database</h1>
        <p className="text-gray-500">
          Connect to your existing database or upload a schema file.
        </p>
      </div>
      
      <div className="max-w-2xl p-6 border rounded-lg">
        <DatabaseConnectionForm />
      </div>
    </div>
  )
}