import { DatabaseConnectionForm } from "@/components/database/DatabaseConnectionForm";


export default function DatabasesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 py-6">
      <div className="container mx-auto space-y-8">
        {/* <div className="p-3">
          <h1 className="text-3xl font-bold tracking-tight">Connect Database</h1>
          <p className="text-muted-foreground">
            Connect to your existing database or upload a schema file.
          </p>
        </div> */}
        
        <DatabaseConnectionForm />
      </div>
    </div>
  )
}