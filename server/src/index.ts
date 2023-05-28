import { QueryTypes } from 'sequelize';
import {app} from './http/app'
import { CrudOptions, addFilterOrder, filterOrder, makeCrud } from './lib/crud';
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
        getter: req => getter(`select * from ${tableName} where id = ${req.params.id}`),
        lister: (req) => getter(addFilterOrder(filterOrder(req.body.filtering), `select * from ${tableName}`)),
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

    const enableListOnly = {enableCreate: false, enableDelete: false, enableEdit: false, enableGet: false} as any

    // lists custom controllers
    initCrud(app, 'billing', null, {
        lister: (req: any, res) => {
            return getter(addFilterOrder(filterOrder(req.body.filtering || {}, {
                consultant_email: `"consultant"."email_address"`,
                project_name: `"commission"."name"`
            }), `
            select
                bills.id,
                consultant.email_address as consultant_email,
                client.company_name,
                commission.name as project_name,
                bills.amount,
                bills.payed_date,
                bills.bill_identifier,
                bills.payed_date
            from hr_platform.bills
                join hr_platform.billable_entity as billable_entity_source on bills.source_billable_id = billable_entity_source.id
                join hr_platform.billable_entity as billable_entity_destination on bills.destination_billable_id = billable_entity_destination.id
                join hr_platform.commission on bills.commission_id = commission.id
                join hr_platform.team_of_commission on commission.id = team_of_commission.commission_id
                join hr_platform.consultant on team_of_commission.consultant_id = consultant.id
                join hr_platform.client on commission.client_id = client.id
        `))
        },
        ...enableListOnly
    }, true)

    initCrud(app, 'skillset', null, {
        lister: (req: any, res) => {
            return getter(addFilterOrder(filterOrder(req.body.filtering || {}, {
                consultant_id: `"consultant"."id"`,
                skill_name: `"skill"."name"`
            }), `
            select
                cv_skills.id,
                consultant.id as consultant_id,
                consultant.email_address,
                skill.name as skill_name,
                cv_skills.years_of_experience
            from hr_platform.cv_skills
            join hr_platform.consultant on consultant.id = cv_skills.consultant_id
            join hr_platform.skill on skill.id = cv_skills.skill_id
        `))
        },
        ...enableListOnly
    })

    initCrud(app, 'commission_history', null, {
        lister: (req: any, res) => {
            return getter(addFilterOrder(filterOrder(req.body.filtering || {}, { project_name: `"commission"."name"` }), `
            select
                team_of_commission.id,
                consultant.name,
                consultant.surname,
                consultant.email_address,
                commission.name as project_name,
                commission.budget,
                team_of_commission.start_date
            from hr_platform.team_of_commission
            join hr_platform.commission on commission.id = team_of_commission.commission_id
            join hr_platform.consultant on consultant.id = team_of_commission.consultant_id
        `))
        },
        ...enableListOnly
    })

    initCrud(app, 'jobspecs', null, {
        lister: (req: any, res) => {
            return getter(addFilterOrder(filterOrder(req.body.filtering || {}, {
                project_name: `"commission"."name"`,
                skill_name: `"skill"."name"`
            }), `
            select
                job_spec_requirements.id,
                job_spec_requirements.years_of_experience,
                skill.name as skill_name,
                commission.name as project_name
            from hr_platform.job_spec_requirements
            join hr_platform.skill on skill.id = job_spec_requirements.skill_id
            join hr_platform.commission on commission.id = job_spec_requirements.commission_id
        `))
        },
        ...enableListOnly
    })


    app.listen(port, () => logger.info(`server listening on port ${port}`));
})();

process.on('uncaughtException', console.log)