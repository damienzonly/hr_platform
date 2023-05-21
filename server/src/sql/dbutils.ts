import { QueryTypes, Sequelize } from "sequelize";


export const db = new Sequelize({
    database: 'postgres',
    dialect: 'postgres',
    schema: 'hr_platform',
    host: process.env.DB_HOST as any,
    port: process.env.DB_PORT as any,
    username: process.env.DB_USER as any,
    password: process.env.DB_PASSWORD as any,
    logging: false
})

export const rawquery = (sql: string, type?: QueryTypes) => {
    return db.query(sql, {type: type || QueryTypes.RAW})
}