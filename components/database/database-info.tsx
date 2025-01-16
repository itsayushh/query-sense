import { DatabaseIcon, ServerIcon, TableIcon, ExternalLinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { getStoredCredentials } from "@/utils/sessionStore"

async function getDatabaseTables(){
    try {
        const dbCredientials = await getStoredCredentials();
        const response = await fetch('http://localhost:3000/api/database/table', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbCredientials),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Connection failed')
        }

        const result = await response.json() 
        return result
    } catch (error) {
        return JSON.stringify({
            success:false,
            message: error || 'Connection failed',
            tables: []
        })
    }
}

export async function DatabaseInfo() {
  const db = await getStoredCredentials()
  const result = await getDatabaseTables()
  const tables = result.tables || []

  return (
    <Card className="relative overflow-hidden border-primary/20 shadow-lg transition-all duration-300">
      {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" /> */}
      
      <CardHeader className="border-b border-border/40 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full " />
              <DatabaseIcon className="h-6 w-6 text-primary relative" />
            </div>
            <CardTitle className="text-xl font-semibold">Database Connection</CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {db?.type?.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-8 p-6 md:grid-cols-2 bg-background">
        {/* Connection Details */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ServerIcon className="h-4 w-4 text-primary" />
            Connection Details
          </h3>
          <dl className="space-y-4 rounded-lg bg-muted/30 p-4">
            {db?.method === 'parameters' ? (
              [
                { label: 'Host', value: db.parameters.host },
                { label: 'Port', value: db.parameters.port },
                { label: 'Database', value: db.parameters.database }
              ].map(({ label, value }) => (
                <div key={label} className="grid grid-cols-2 gap-4">
                  <dt className="font-medium text-muted-foreground">{label}</dt>
                  <dd className="font-mono bg-background/50 px-3 py-1 rounded-md shadow-sm">
                    {value}
                  </dd>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <dt className="font-medium text-muted-foreground">Connection String</dt>
                <dd className="font-mono bg-background/50 px-3 py-1 rounded-md shadow-sm truncate">
                  {db?.connectionString}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Tables List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TableIcon className="h-4 w-4 text-primary" />
              Available Tables
              <Badge variant="outline" className="ml-2">
                {tables.length}
              </Badge>
            </h3>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              View Schema
            </Button>
          </div>
          
          <ScrollArea className="h-[240px] rounded-lg border bg-muted/30 backdrop-blur-sm">
            <div className="divide-y divide-border/40">
              {tables.length > 0 ? (
                tables.map((table: string) => (
                  <div
                    key={table}
                    className="p-3 hover:bg-primary/5 transition-colors cursor-pointer flex items-center gap-2 group"
                  >
                    <TableIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <code className="text-sm font-mono group-hover:text-primary transition-colors">
                      {table}
                    </code>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No tables available
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}