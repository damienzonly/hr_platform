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
    billable_entity_id integer not null references hr_platform.billable_entity (id), -- must own a parent billable entity
    name varchar not null,
    surname varchar not null,
    experience_years integer not null,
    email_address varchar not null,
    phone_number varchar
);

create table if not exists hr_platform.client (
    id serial primary key,
    company_name varchar not null,
    billable_entity_id integer not null references hr_platform.billable_entity (id)
);

create table if not exists hr_platform.commission (
    id serial primary key,
    client_id integer not null references hr_platform.client (id),
    budget integer not null,
    name varchar not null,
    start_date timestamp not null,
    duration integer not null
);

create table if not exists hr_platform.bills (
    id serial primary key,
    source_billable_id integer not null references hr_platform.billable_entity (id),
    destination_billable_id integer not null references hr_platform.billable_entity (id),
    commission_id integer not null references hr_platform.commission (id),
    bill_identifier_id integer not null,
    payed_date timestamp,
    iban varchar not null,
    amount float not null
);

create table if not exists hr_platform.team_of_commission (
    id serial primary key,
    commission_id integer not null references hr_platform.commission (id),
    consultant_id integer not null references hr_platform.consultant (id),
    start_date timestamp not null
);

create table if not exists hr_platform.cv_job_history (
    id serial primary key,
    consultant_id integer not null references hr_platform.consultant(id),
    from_date timestamp not null,
    to_date timestamp not null,
    company_name varchar not null,
    description text
);

create table if not exists hr_platform.cv_skills (
    id serial primary key,
    consultant_id integer not null references hr_platform.consultant(id),
    skill_id integer not null references hr_platform.skill (id),
    year_of_experience integer not null
);

create table if not exists hr_platform.job_spec_requirements (
    id serial primary key,
    skill_id integer not null references hr_platform.skill (id),
    commission_id integer not null references hr_platform.commission (id),
    years_of_experience integer not null
);

create table if not exists hr_platform.hiring_details (
    id serial primary key,
    consultant_id integer not null references hr_platform.consultant (id),
    hr_employee_id integer not null references hr_platform.hr_employee (id),
    start_date timestamp not null
);

INSERT INTO hr_platform.hr_employee (name, surname, email_address, phone_number)
VALUES
  ('John', 'Doe', 'john.doe@example.com', '1234567890'),
  ('Jane', 'Smith', 'jane.smith@example.com', '9876543210'),
  ('Michael', 'Johnson', 'michael.johnson@example.com', '5555555555');

INSERT INTO hr_platform.skill (name)
VALUES
  ('Programming'),
  ('Design'),
  ('Data Analysis'),
  ('Project Management'),
  ('Communication');

INSERT INTO hr_platform.billable_entity (vat_number, head_quarter_address)
VALUES
  ('VAT001', 'Address 1'),
  ('VAT002', 'Address 2'),
  ('VAT003', 'Address 3'),
  ('VAT004', 'Address 4');

INSERT INTO hr_platform.client (company_name, billable_entity_id)
VALUES
  ('Client A', 1),
  ('Client B', 2);

INSERT INTO hr_platform.consultant (billable_entity_id, name, surname, experience_years, email_address, phone_number)
VALUES
  (3, 'Consultant 1', 'Surname 1', 3, 'consultant1@example.com', '1111111111'),
  (4, 'Consultant 2', 'Surname 2', 2, 'consultant2@example.com', '2222222222');

INSERT INTO hr_platform.commission (client_id, budget, name, start_date, duration)
VALUES
  (1, 1000, 'Commission 1', '2023-01-01', 180),
  (2, 2000, 'Commission 2', '2023-02-01', 300);

insert into hr_platform.team_of_commission (commission_id, consultant_id, start_date)
VALUES
  (1, 1, '2023-01-01'),
  (1, 2, '2023-01-15'),
  (2, 1, '2023-02-01');

INSERT INTO hr_platform.job_spec_requirements (skill_id, commission_id, years_of_experience)
VALUES
  (1, 1, 2),
  (2, 1, 3),
  (3, 1, 1),
  (4, 2, 4),
  (5, 2, 2);

INSERT INTO hr_platform.cv_job_history (consultant_id, from_date, to_date, company_name, description)
VALUES
  (1, '2019-01-01', '2021-12-31', 'Company A', 'Worked as a programmer'),
  (1, '2020-06-01', '2023-05-31', 'Company B', 'Managed projects'),
  (2, '2018-03-15', '2023-06-30', 'Company C', 'Performed data analysis tasks'),
  (2, '2017-01-01', '2019-12-31', 'Company D', 'Worked as a designer'),
  (2, '2019-06-01', '2022-12-31', 'Company E', 'Managed projects and communicated with clients');

INSERT INTO hr_platform.cv_skills (consultant_id, skill_id, year_of_experience)
VALUES
  (1, 1, 3),
  (1, 2, 2),
  (2, 3, 1),
  (2, 4, 4),
  (2, 2, 3),
  (1, 3, 2),
  (1, 1, 2),
  (2, 5, 5),
  (1, 1, 3),
  (2, 4, 2);

INSERT INTO hr_platform.hiring_details (consultant_id, hr_employee_id, start_date)
VALUES
  (1, 1, '2023-01-01'),
  (2, 2, '2023-02-01');

INSERT INTO hr_platform.bills (source_billable_id, destination_billable_id, commission_id, bill_identifier_id, payed_date, iban, amount)
VALUES
  (3, 1, 1, 1, '2023-01-15', 'IT11111111111111111111', 500.00),
  (3, 1, 1, 2, '2023-01-20', 'IT11111111111111111111', 600.00),
  (3, 2, 2, 3, '2023-02-10', 'IT11111111111111111111', 700.00),
  (3, 2, 2, 4, '2023-02-15', 'IT11111111111111111111', 800.00),
  (3, 1, 1, 5, '2023-01-25', 'IT11111111111111111111', 900.00),
  (3, 2, 2, 6, '2023-02-25', 'IT11111111111111111111', 1000.00),
  (3, 1, 2, 7, '2023-02-28', 'IT11111111111111111111', 1100.00),
  (3, 1, 1, 8, '2023-03-05', 'IT11111111111111111111', 1200.00),
  (4, 2, 2, 9, '2023-03-10', 'IT22222222222222222222', 1300.00),
  (4, 2, 1, 10, '2023-03-15', 'IT22222222222222222222', 1400.00),
  (4, 1, 2, 11, '2023-03-20', 'IT22222222222222222222', 1500.00),
  (4, 2, 1, 12, '2023-03-25', 'IT22222222222222222222', 1600.00),
  (4, 1, 1, 13, '2023-04-01', 'IT22222222222222222222', 1700.00),
  (4, 1, 2, 14, '2023-04-05', 'IT22222222222222222222', 1800.00),
  (4, 2, 1, 15, '2023-04-10', 'IT22222222222222222222', 1900.00);

