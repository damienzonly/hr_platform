import { Express, Request, RequestHandler, Response } from "express"
import _, { escape, includes } from 'lodash'

export type HookCallback = (req?: Request, res?: Response) => any
export type HookCallbackItem = (req?: Request, res?: Response, item?: any) => any

export interface CrudOptions {
    delParams?: {name: string, }[]
    // crud callbacks
    getter?: HookCallback
    setter?: HookCallback
    deleter?: HookCallback
    lister?: HookCallback
    creator?: HookCallback

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
        let item = await this.opts.getter?.(req, res);
        await this.opts.afterGet?.(req, res, item);
        reply(res, {item});
    }

    editCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeEdit?.(req, res);
        const item = await this.opts.setter?.(req, res);
        await this.opts.afterEdit?.(req, res, item);
        reply(res, {item});
    }

    deleteCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeDelete?.(req, res);
        const item = await this.opts.deleter?.(req, res);
        await this.opts.afterDelete?.(req, res, item);
        reply(res, {item});
    }

    listCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeList?.(req, res);
        let items = await this.opts.lister?.(req, res);
        await this.opts.afterList?.(req, res, items);
        reply(res, {items});
    }

    createCtrl: RequestHandler = async (req, res) => {
        await this.opts.beforeCreate?.(req, res);
        const item = await this.opts.creator?.(req, res);
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
        `/api/${resourceName}/get/:id`,
        ...spread(crudOptions?.getMiddlewares),
        controller.getCtrl.bind(controller)
    );

    // create
    if (_.isNil(crudOptions.enableCreate) || crudOptions.enableCreate) app.put(
        `/api/${resourceName}`,
        ...spread(crudOptions?.createMiddlewares),
        controller.createCtrl.bind(controller)
    )

    // edit
    if (_.isNil(crudOptions.enableEdit) || crudOptions.enableEdit) app.put(
        `/api/${resourceName}/:id`,
        ...spread(crudOptions?.editMiddlewares),
        controller.editCtrl.bind(controller)
    )

    // delete
    if (_.isNil(crudOptions.enableDelete) || crudOptions.enableDelete) app.delete(
        `/api/${resourceName}/:id`,
        ...spread(crudOptions?.deleteMiddlewares),
        controller.deleteCtrl.bind(controller)
    )
    
    // list
    if (_.isNil(crudOptions.enableList) || crudOptions.enableList) app.post(
        `/api/${resourceName}/list`,
        ...spread(crudOptions?.listMiddlewares),
        controller.listCtrl.bind(controller)
    )
}


export interface FilterOrderParams {
    inclusive: boolean,
    columns?: {name: string, value: any, operator: 'ilike' | '>' | '<' | '=' | '!'}[],
    order?: {columnName: string, desc?: boolean}[]
}

export function filterOrder(opts: FilterOrderParams, tablesMap?: {[x: string]: string}) {
    if (!opts) return null;
    const binaryOperator = opts.inclusive ? "OR" : "AND";
    const orderChain = opts.order?
        "order by " + opts.order.map(o => `${o.columnName} ${o.desc ? "DESC" : "ASC"}`).join(", ")
        : ''
    const conditionChain = opts.columns ?
        "where " + opts.columns.map(c => {
            const isValueString = typeof c.value === 'string';
            const name = tablesMap?.[c.name] || c.name
            // in cases where the column is provided with the table name. e.g. "table"."column"
            const isComposite = name.indexOf('.') !== -1;
            c.name = `${isComposite ? name : `"${name}"`}`;
            const _value = c.value;
            if (isValueString) c.value = `'${escape(c.value)}'`;
            if (c.operator === '!') {
                if (c.value === null) return `(${c.name} is not null)`
                return `(NOT (${c.name} = ${c.value}))`
            }
            else if (c.operator === 'ilike') return `(${c.name} ilike '%${_value}%')`;
            return `(${c.name} ${c.operator} ${c.value})`;
        }).join(` ${binaryOperator} `)
        : ''
    return {conditionChain, orderChain}
}

export function addFilterOrder(fo: ReturnType<typeof filterOrder>, sql: string) {
    const q = !fo ? "" : fo.conditionChain + '\n' + fo.orderChain
    return sql + q;
}