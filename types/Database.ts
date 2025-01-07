    // @/types/database.ts

    export type ConnectionMethod = 'url' | 'parameters';

    export type DatabaseType = 'mysql' | 'postgresql' | 'mongodb' | 'sqlite';

    export interface ConnectionParameters {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    }

    export interface UrlConnectionConfig {
        type: DatabaseType;
        method: 'url';
        connectionString: string;
    }

    export interface ParametersConnectionConfig {
        type: DatabaseType;
        method: 'parameters';
        parameters: ConnectionParameters;
    }

    export type DatabaseConnectionConfig = UrlConnectionConfig | ParametersConnectionConfig;

    export interface ConnectionResult {
        success: boolean;
        connection: any;
        tables: string[];
        error?: string;
    }