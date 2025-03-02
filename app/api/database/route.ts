import { DatabaseFactory } from "@/lib/database/factory";
import { DatabaseManager } from "@/lib/database/manager";
import { DatabaseConnectionConfig } from "@/types/Database";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    let connection = null;
    let config: DatabaseConnectionConfig | null = null;
    const dbManager = DatabaseManager.getInstance();
    try {
        config = await request.json();
        console.log('config', config)

        if (!config) {
            throw new Error('Database connection not found');
        }
        const connResult = await dbManager.establishConnection(config);
        if (!connResult.success) {
            throw new Error(connResult.error);
        }
        connection = connResult.connection;
        const dbConnection = DatabaseFactory.getConnection(config.type);
        const databases = await dbConnection.getDatabase(connection);
        console.log('databases', databases)
        if(databases.length === 0) {
            return NextResponse.json({success: false, error: 'No databases found'});
        }else{
            return NextResponse.json({success: true, data: databases});
        }
    } catch (error) {
        return NextResponse.json({success: false, error: error instanceof Error ? error.message : 'Failed to get databases'});
    }
}