import { QueryTypes } from 'sequelize';
import {app} from './http/app'
import { makeCrud } from './lib/crud';
import { logger } from './lib/logger';
import {db, rawquery} from './sql/dbutils'
import _ from 'lodash'
import escape from 'sql-escape-string'

const port = process.env.HTTP_PORT || 5000;

function creator(item, tableName: string) {
    if (!_.isNil(item.id)) delete item.id;

    // sort item keys for insertion query order
    const entries = Object.entries(item)
    const columns = entries.map(e => e[0])
    const values = entries.map(e => {
        const value = e[1];
        switch(typeof value) {
            case null:
                return 'NULL'
            case 'string':
                return escape(value)
        }
        return value
    })

    return rawquery(`insert into ${tableName} (${columns}) VALUES (${values}) returning id`, QueryTypes.INSERT)
}

function deleter(id, tableName: string) {
    return rawquery(`delete from ${tableName} where id=${id}`, QueryTypes.DELETE)
}

async function getter(sql) {
    return rawquery(sql, QueryTypes.SELECT) as any
}

function initCrud(app, entity, tableName) {
    makeCrud(app, entity, {
        creator: (req) => creator(req.body.item, entity),
        deleter: req => deleter(req.params.id, entity),
        getter: req => getter(`select * from hr_platform.${tableName} where id = ${req.params.id}`), // todo
        lister: () => getter(`select * from hr_platform.${tableName}`), // todo
        setter: () => getter(`select 1+1`) // todo
    })
}

;(async () => {
    await db.authenticate();

    const entities = [
        ["clients", "client"],
        ["consultant"],
        ["hr_employee", "hr_employee"],
        ["billable_entity"],
        ["bills"],
        ["commission"],
        ["skill"],
    ]

    entities.forEach(e => initCrud(app, e, e[1] || e[0]))
    app.listen(port, () => logger.info(`server listening on port ${port}`));
})();