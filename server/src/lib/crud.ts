import { Express, Request, RequestHandler, Response } from "express"
import _ from 'lodash'

export type HookCallback = (req?: Request, res?: Response) => any
export type HookCallbackItem = (req?: Request, res?: Response, item?: any) => any

export interface CrudOptions {
    delParams?: {name: string, }[]
    // crud callbacks
    getter: HookCallback
    setter: HookCallback
    deleter: HookCallback
    lister: HookCallback
    creator: HookCallback

    // hooks
    afterCreate?: HookCallbackItem
    afterDelete?: HookCallbackItem
    afterEdit?: HookCallbackItem
    afterGet?: HookCallbackItem
    afterList?: HookCallbackItem

    beforeCreate?: HookCallback
    beforeDelete?: HookCallback
    beforeEdit?: HookCallback
    beforeGet?: HookCallback
    beforeList?: HookCallback

    converFromDb?: HookCallbackItem
    converToDb?: HookCallbackItem,

    // middleware chains
    globalMiddlewares?: RequestHandler[]
    createMiddlewares?: RequestHandler[]
    deleteMiddlewares?: RequestHandler[]
    editMiddlewares?: RequestHandler[]
    getMiddlewares?: RequestHandler[]
    listMiddlewares?: RequestHandler[]

    enableCreate?: boolean
    enableEdit?: boolean
    enableList?: boolean
    enableDelete?: boolean
    enableGet?: boolean
    
}

export async function reply(res: Response, data: any, status = 200) {
    res.status(status).json({data})
}

class CrudController {
    opts: CrudOptions;

    constructor(opts: CrudOptions) {
        this.opts = opts;
    }

    getCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeGet?.(req, res);
        let item = await this.opts.getter(req, res);
        if (this.opts.converFromDb) item = this.opts.converFromDb(item);
        await this.opts.afterGet?.(req, res, item);
        reply(res, {item});
    }

    editCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeEdit?.(req, res);
        const item = await this.opts.setter(req, res);
        await this.opts.afterEdit?.(req, res, item);
        reply(res, {item});
    }

    deleteCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeDelete?.(req, res);
        const item = await this.opts.deleter(req, res);
        await this.opts.afterDelete?.(req, res, item);
        reply(res, {item});
    }

    listCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeList?.(req, res);
        let items = await this.opts.lister(req, res);
        if (this.opts.converFromDb) items = items.map(item => this.opts.converFromDb(item));
        await this.opts.afterList?.(req, res, items);
        reply(res, {items});
    }

    createCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeCreate?.(req, res);
        const item = await this.opts.creator(req, res);
        await this.opts.afterCreate?.(req, res, item)
        reply(res, {item});
    }
}

function spread(array) {
    return array ? array : []
}

export function makeCrud(app: Express, resourceName: string, crudOptions: CrudOptions) {
    const controller = new CrudController(crudOptions);
    if (crudOptions.globalMiddlewares) app.use(...crudOptions.globalMiddlewares);

    // get single record
    if (_.isNil(crudOptions.enableGet) || crudOptions.enableGet) app.get(
        `/${resourceName}/get/:id`,
        ...spread(crudOptions?.getMiddlewares),
        controller.getCtrl.bind(controller)
    );

    // create
    if (_.isNil(crudOptions.enableCreate) || crudOptions.enableCreate) app.put(
        `/${resourceName}`,
        ...spread(crudOptions?.createMiddlewares),
        controller.createCtrl.bind(controller)
    )

    // edit
    if (_.isNil(crudOptions.enableEdit) || crudOptions.enableEdit) app.put(
        `/${resourceName}/:id`,
        ...spread(crudOptions?.editMiddlewares),
        controller.editCtrl.bind(controller)
    )

    // delete
    if (_.isNil(crudOptions.enableDelete) || crudOptions.enableDelete) app.delete(
        `/${resourceName}/:id`,
        ...spread(crudOptions?.deleteMiddlewares),
        controller.deleteCtrl.bind(controller)
    )
    
    // list
    if (_.isNil(crudOptions.enableList) || crudOptions.enableList) app.post(
        `/${resourceName}/list`,
        ...spread(crudOptions?.listMiddlewares),
        controller.listCtrl.bind(controller)
    )
}
