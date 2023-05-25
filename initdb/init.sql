create schema if not exists hr_platform;

create table if not exists hr_platform.hr_employee (
    id serial primary key,
    name varchar not null,
    surname varchar not null,
    email_address varchar not null,
    phone_number varchar
);

create table if not exists hr_platform.skill (
    id serial primary key,
    name varchar not null
);

create table if not exists hr_platform.billable_entity (
    id serial primary key,
    vat_number varchar not null,
    head_quarter_address varchar not null
);

create table if not exists hr_platform.consultant (
    id serial primary key,
    billable_entity_id integer not null,
    name varchar not null,
    surname varchar not null,
    experience_years integer not null,
    email_address varchar not null,
    phone_number varchar
);

create table if not exists hr_platform.client (
    id serial primary key,
    company_name varchar not null,
    billable_entity_id integer not null
);

create table if not exists hr_platform.commission (
    id serial primary key,
    client_id integer not null,
    budget integer not null,
    name varchar not null,
    start_date timestamp not null,
    duration integer not null
);

create table if not exists hr_platform.bills (
    id serial primary key,
    source_billable_id integer not null,
    destination_billable_id integer not null,
    commission_id integer not null,
    bill_identifier_id integer not null,
    payed_date timestamp,
    iban varchar not null,
    amount float not null
);

create table if not exists hr_platform.team_of_commission (
    id serial primary key,
    commission_id integer not null,
    consultant_id integer not null,
    start_date timestamp not null
);

create table if not exists hr_platform.cv_job_history (
    id serial primary key,
    consultant_id integer not null,
    from_date timestamp not null,
    to_date timestamp not null,
    company_name varchar not null,
    description text
);

create table if not exists hr_platform.cv_skills (
    id serial primary key,
    consultant_id integer not null,
    skill_id integer not null,
    year_of_experience integer not null
);

create table if not exists hr_platform.job_spec_requirements (
    id serial primary key,
    skill_id integer not null,
    commission_id integer not null,
    years_of_experience integer not null
);

create table if not exists hr_platform.hiring_details (
    id serial primary key,
    consultant_id integer not null,
    hr_employee_id integer not null,
    start_date timestamp not null
);