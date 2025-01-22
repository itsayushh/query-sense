import { getStoredCredentials } from "@/utils/sessionStore";
import { Database } from "lucide-react";



export const DatabaseHeader = async () => {
  const credentials = await getStoredCredentials();
  // const databases = await getDatabases();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Database className="h-7 w-7 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-xl sm:text-2xl font-bold">{credentials?.type?.toUpperCase()} Database</h1>
          <div className="px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm sm:text-base text-muted-foreground break-all">
            {credentials?.method === 'parameters'
              ? `${credentials.parameters.host}:${credentials.parameters.port}/${credentials.parameters.database}`
              : credentials?.connectionString
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseHeader;