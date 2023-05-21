import { Express, RequestHandler } from "express"

export interface CrudOptions {
    delParams?: {name: string, }[]
    
}

namespace BuildinControllers {
    export const _get: RequestHandler = (req, res) => {

    }
}

export function makeCrud(app: Express, resourceName: string, crudOptions) {
    app.get(`/${resourceName}/:id`)
}