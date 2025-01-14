import { DatabaseIcon, ServerIcon, TableIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { getStoredCredentials } from "@/utils/sessionStore"
import { toast } from "@/hooks/use-toast"
import { table } from "console"


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
    const db = await getStoredCredentials();
    const result = await getDatabaseTables();
    const tab = result.tables || [];
    return (
        <Card className="border-border/40">
            <CardHeader className="border-b border-border/40">
                <CardTitle className="flex items-center gap-2">
                    <DatabaseIcon className="h-5 w-5 text-primary" />
                    Database Connection
                    <Badge variant="secondary" className="ml-auto">
                        {db?.type?.toUpperCase()}
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
                        {db?.method == 'parameters' ? [
                            { label: 'Host', value: db.parameters.host },
                            { label: 'Port', value: db.parameters.port },
                            { label: 'Database', value: db.parameters.database }
                        ].map(({ label, value }) => (
                            <div key={label} className="grid grid-cols-2 gap-4">
                                <dt className="font-medium text-muted-foreground">{label}</dt>
                                <dd className="font-mono bg-muted/30 px-2 py-1 rounded">{value}</dd>
                            </div>
                        )) :
                            <div key="connection-string" className="grid grid-cols-2 gap-4">
                                <dt className="font-medium text-muted-foreground">Connection String</dt>
                                <dd className="font-mono bg-muted/30 px-2 py-1 rounded">{db?.connectionString}</dd>
                            </div>
                        }
                    </dl>
                </div>

                <div className="space-y-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <TableIcon className="h-4 w-4 text-primary" />
                        Available Tables
                        <Badge variant="outline" className="ml-2">
                            {tab.length}
                        </Badge>
                    </h3>
                    <ScrollArea
                        className="h-[200px] rounded-md border">
                        <div className="divide-y">
                            {tab.length>0 && tab.map((table:string) => (
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