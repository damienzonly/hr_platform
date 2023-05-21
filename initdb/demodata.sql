create or replace function create_skills() returns integer as $$
declare
	s text;
	v text array default array[
        'javascript',
        'python',
        'rust',
        'project management'
    ];
begin
	foreach s in array v loop
		insert into skill (name) values (s);
	end loop;
end
$$ language plpgsql;
