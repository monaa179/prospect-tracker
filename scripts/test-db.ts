import mariadb from 'mariadb';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL?.replace('mysql://', 'mariadb://');

async function test() {
    console.log('Testing connection to:', connectionString);
    let conn;
    try {
        conn = await mariadb.createConnection(connectionString!);
        console.log('✅ Connection successful!');
        const rows = await conn.query('SELECT 1 as val');
        console.log('Query result:', rows);
    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        if (conn) await conn.end();
    }
}

test();
