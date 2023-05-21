import { RequestHandler } from "express";
import { rawquery } from "../../sql/dbutils";

export const listHR: RequestHandler = async (req, res) => {
    const data = await rawquery(`select * from hr_employees`)
    return data
}


