'use client'
import { DatabaseIcon, ServerIcon, TableIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"

interface DatabaseInfoProps {
    type?: string
    host?: string
    port?: string
    database?: string
    tables: string[]
  }
  
  export function DatabaseInfo({ type, host, port, database, tables }: DatabaseInfoProps) {
    // const {connectionDetails} = useDatabaseStore();
    return (
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5 text-primary" />
            Database Connection
            <Badge variant="secondary" className="ml-auto">
              {type?.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8 p-6 md:grid-cols-2">
          <div className="space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ServerIcon className="h-4 w-4 text-primary" />
              Connection Details
            </h3>
            <dl className="space-y-4">
              {[
                { label: 'Host', value: host },
                { label: 'Port', value: port },
                { label: 'Database', value: database }
              ].map(({ label, value }) => (
                <div key={label} className="grid grid-cols-2 gap-4">
                  <dt className="font-medium text-muted-foreground">{label}</dt>
                  <dd className="font-mono bg-muted/30 px-2 py-1 rounded">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          
          <div className="space-y-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TableIcon className="h-4 w-4 text-primary" />
              Available Tables
              <Badge variant="outline" className="ml-2">
                {tables.length}
              </Badge>
            </h3>
            <ScrollArea
 className="h-[200px] rounded-md border">
              <div className="divide-y">
                {tables.map((table) => (
                  <div 
                    key={table} 
                    className="p-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <TableIcon className="h-4 w-4 text-muted-foreground" />
                    <code className="text-sm font-mono">{table}</code>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    )
  }