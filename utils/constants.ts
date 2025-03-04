export const DATABASE_CONFIG = {
    PORT_MAP: {
        mysql: 3306,
        postgresql: 5432,
        // mongodb: 27017,
        sqlite: 0,
    } as const,

    CONNECTION_STRING_TEMPLATES: {
        mysql: 'mysql://user:password@localhost:3306/dbname',
        postgresql: 'postgresql://user:password@localhost:5432/dbname',
        // mongodb: 'mongodb+srv://user:password@cluster.xxxxx.mongodb.net/dbname',
        sqlite: '/path/to/database.sqlite',
    } as const
} as const