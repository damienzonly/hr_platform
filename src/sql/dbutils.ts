import { QueryTypes, Sequelize } from "sequelize";


export const db = new Sequelize({
    database: 'hr_platform',
    dialect: 'postgres',
    host: process.env.DB_HOST as any,
    port: process.env.DB_PORT as any,
    username: process.env.DB_USER as any,
    password: process.env.DB_PASSWORD as any,
})

export const rawquery = (sql: string) => {
    return db.query(sql, {type: QueryTypes.RAW})
}