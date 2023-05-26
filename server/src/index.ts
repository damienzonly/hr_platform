import { QueryTypes } from 'sequelize';
import {app} from './http/app'
import { CrudOptions, makeCrud } from './lib/crud';
import { logger } from './lib/logger';
import {db, rawquery} from './sql/dbutils'
import _ from 'lodash'
import escape from 'sql-escape-string'

const port = process.env.HTTP_PORT || 5000;

const entities = [
    'hr_employee',
    'consultant',
    'billable_entity',
    'skill',
    'bills',
    'client',
    'cv_skills',
    'commission',
    'team_of_commission',
    'job_spec_requirements',
    'cv_job_history',
    'hiring_details'
]

async function creator(item, tableName: string) {
    if (!_.isNil(item?.id)) delete item.id;

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

    const [[data]] = await rawquery(`insert into ${tableName} (${columns}) VALUES (${values}) returning id`, QueryTypes.INSERT)
    return data;
}

function deleter(id, tableName: string) {
    return rawquery(`delete from ${tableName} where id=${id}`, QueryTypes.DELETE)
}

async function getter(sql) {
    return rawquery(sql, QueryTypes.SELECT) as any
}

function initCrud(app, entity: string, tableName = entity, crudOptions?: CrudOptions, overrideCrudOptions = false) {
    tableName = `hr_platform.${entity}`
    logger.info(`initializing crud for ${entity}`);
    const o: CrudOptions  = overrideCrudOptions ? crudOptions : {
        creator: (req) => creator(req.body, tableName),
        deleter: req => deleter(req.params.id, tableName),
        getter: req => getter(`select * from ${tableName} where id = ${req.params.id}`), // todo
        lister: () => getter(`select * from ${tableName}`), // todo
        setter: () => getter(`select 1+1`), // todo
        ...crudOptions
    }
    makeCrud(app, entity, o);
}

;(async () => {
    while(1) {
        try {
            await db.authenticate();
            break
        } catch (e) {
            await new Promise(r => setTimeout(r, 1000))
        }
    }

    for (const entity of entities) {
        initCrud(app, entity)
    }

    // lists custom controllers
    initCrud(app, 'billing', null, {
        lister: (req, res) => {
            const query = `
                SELECT
                    bills.id,
                    consultant.email_address AS consultant_email,
                    client.company_name,
                    commission.name as project_name,
                    bills.amount
                FROM
                    hr_platform.bills
                    JOIN hr_platform.billable_entity AS billable_entity_source ON bills.source_billable_id = billable_entity_source.id
                    JOIN hr_platform.billable_entity AS billable_entity_destination ON bills.destination_billable_id = billable_entity_destination.id
                    JOIN hr_platform.commission ON bills.commission_id = commission.id
                    JOIN hr_platform.team_of_commission ON commission.id = team_of_commission.commission_id
                    JOIN hr_platform.consultant ON team_of_commission.consultant_id = consultant.id
                    JOIN hr_platform.client ON commission.client_id = client.id
            `
            return getter(query)
        },
        enableCreate: false, enableDelete: false, enableEdit: false, enableGet: false
    }, true)

    app.listen(port, () => logger.info(`server listening on port ${port}`));
})();

process.on('uncaughtException', console.log)