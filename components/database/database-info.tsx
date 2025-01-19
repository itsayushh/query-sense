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
  const result = await getDatabaseTables()
  const tables = result.tables || []

  return (
    <Card className="relative overflow-hidden border-primary/20 shadow-lg transition-all duration-300">
      <CardHeader className="border-b border-border/40 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full " />
              <DatabaseIcon className="h-6 w-6 text-primary relative" />
            </div>
            <CardTitle className="text-xl font-semibold">Available Tables</CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {tables.length}
          </Badge>
        </div>
      </CardHeader>

          <ScrollArea className=" bg-background backdrop-blur-sm h-full w-full">
            <div className="divide-y divide-border/40">
              {tables.length > 0 ? (
                tables.map((table: string) => (
                  <div
                    key={table}
                    className="p-5 hover:bg-primary/5 transition-colors cursor-pointer flex items-center gap-2 group"
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
    </Card>
  )
}