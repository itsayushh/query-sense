import { toast } from "@/hooks/use-toast";
import { getStoredCredentials } from "@/utils/sessionStore";
import { Database } from "lucide-react";
import { redirect } from "next/navigation";

export const DatabaseHeader = async () => {
  const credentials = await getStoredCredentials();

  // Function to extract host, port, and database from different connection methods
  const getConnectionDetails = () => {
    if (!credentials) {
      redirect('/databases');
    }

    if (credentials.method === 'parameters') {
      return `${credentials.parameters.host}:${credentials.parameters.port}/${credentials.parameters.database}`;
    }

    try {
      // For URL method, try to parse and extract key information
      const urlObj = new URL(credentials.connectionString);
      const hostname = urlObj.hostname;
      const port = urlObj.port || (
        credentials.type === 'postgresql' ? '5432' : 
        credentials.type === 'mysql' ? '3306' : 
        ''
      );
      const database = urlObj.pathname.replace(/^\//, '') || 'default';

      return `${hostname}:${port}/${database}`;
    } catch {
      // Fallback to a generic message if URL parsing fails
      return `${credentials.type} Database`;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
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
            {getConnectionDetails()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseHeader;