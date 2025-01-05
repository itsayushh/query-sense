interface DatabaseInfoProps {
  type?: string
  host?: string
  port?: string
  database?: string
  tables: string[]
}

export function DatabaseInfo({ type, host, port, database, tables }: DatabaseInfoProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Database Connection</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2">Connection Details</h3>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="w-24 font-medium">Type:</dt>
                <dd>{type}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 font-medium">Host:</dt>
                <dd>{host}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 font-medium">Port:</dt>
                <dd>{port}</dd>
              </div>
              <div className="flex">
                <dt className="w-24 font-medium">Database:</dt>
                <dd>{database}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Available Tables</h3>
            <ul className="space-y-1">
              {tables.map((table) => (
                <li key={table} className="text-sm">{table}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 