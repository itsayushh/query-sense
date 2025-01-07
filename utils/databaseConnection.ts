import { DatabaseConnectionConfig } from "@/types/Database";

export function createConnectionConfig(config: DatabaseConnectionConfig) {
    if (config.method === 'url') {
        return config.connectionString;
    }

    switch (config.type) {
        case 'postgresql':
        case 'mysql':
            return {
                host: config.parameters.host,
                port: config.parameters.port,
                user: config.parameters.username,
                password: config.parameters.password,
                database: config.parameters.database,
            };

        case 'mongodb':
            return `mongodb://${config.parameters.username}:${encodeURIComponent(config.parameters.password)}@${config.parameters.host}:${config.parameters.port}/${config.parameters.database}`;

        case 'sqlite':
            return config.parameters.database;

        default:
            throw new Error(`Unsupported database type: ${config.type}`);
    }
}