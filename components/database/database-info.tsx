import { DatabaseIcon, TableIcon, KeyIcon } from "lucide-react"
import { Card, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { getStoredCredentials } from "@/utils/sessionStore"
import { cn } from "@/lib/utils"
import { TableSchema } from "@/types/Database"

async function getDatabaseTables() {
  try {
    const dbCredentials = await getStoredCredentials();
    const response = await fetch(`${process.env.PUBLIC_URL}/api/database/table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbCredentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Connection failed')
    }

    return await response.json()
  } catch (error) {
    return {
      success: false,
      message: error || 'Connection failed',
      schemas: []
    }
  }
}

export default async function DatabaseInfo() {
  const result = await getDatabaseTables()
  const schemas:TableSchema[] = result.schemas || []

  return (
    <Card className="enterprise-card overflow-hidden">
      <CardHeader className="py-3 px-4 bg-card border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DatabaseIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-outfit">Database Schema</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className="text-xs font-normal bg-background text-secondary-foreground font-geist"
          >
            {schemas.length} Tables
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className="h-[calc(100vh-220px)] custom-scrollbar">
        {schemas.length > 0 ? (
          <div className="divide-y divide-border/40">
            {schemas.map((table) => (
              <div key={table.tableName} className="group">
                <div className="p-3 flex items-center justify-between hover:bg-muted/30 cursor-pointer transition-colors duration-200">
                  <div className="flex items-center gap-2.5">
                    <TableIcon className="h-4 w-4 text-accent group-hover:text-primary transition-colors duration-200" />
                    <div>
                      <div className="font-medium text-sm font-geist group-hover:text-primary transition-colors duration-200">
                        {table.tableName}
                      </div>
                      <div className="text-xs text-muted-foreground font-geist">
                        {table.columns.length} columns
                      </div>
                    </div>
                  </div>
                  
                  {table.columns.filter(col => col.isPrimary).length > 0 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-muted/50 text-secondary-foreground font-geist border-border/50"
                    >
                      {table.columns.filter(col => col.isPrimary).length} Keys
                    </Badge>
                  )}
                </div>

                <div className="bg-card/50 px-3 pb-3">
                  <div className="grid grid-cols-12 text-xs py-2 px-2 text-muted-foreground border-b border-border/30 font-spaceGrotesk">
                    <div className="col-span-4">COLUMN</div>
                    <div className="col-span-3">TYPE</div>
                    <div className="col-span-2 text-center">NULLABLE</div>
                    <div className="col-span-3 text-center">KEY</div>
                  </div>
                  
                  {table.columns.map((column, idx:number) => (
                    <div 
                      key={column.name}
                      className={cn(
                        "grid grid-cols-12 text-xs py-2 px-2 rounded transition-colors duration-200",
                        idx % 2 === 0 
                          ? "bg-background/70" 
                          : "bg-card/70",
                        "hover:bg-muted/20"
                      )}
                    >
                      <div className="col-span-4 flex items-center gap-1.5 font-medium">
                        {column.isPrimary && <KeyIcon className="h-3 w-3 text-accent" />}
                        <span className="font-spaceMono">{column.name}</span>
                      </div>
                      <div className="col-span-3 text-primary font-spaceMono">{column.type}</div>
                      <div className="col-span-2 text-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs px-2 py-0 font-geist border-0",
                            column.nullable 
                              ? "bg-muted/30 text-muted-foreground" 
                              : "bg-secondary/10 text-secondary"
                          )}
                        >
                          {column.nullable ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="col-span-3 text-center">
                        {column.isPrimary && (
                          <Badge
                            variant="outline"
                            className="text-xs border-0 bg-accent/10 text-accent font-geist"
                          >
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center">
            <DatabaseIcon className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-geist">No tables found</p>
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}