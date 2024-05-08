INSERT INTO department (names)
VALUES
    ('Human Resources'),
    ('Sales'),
    ('Customer Service'),
    ('IT'),
    ('Finance'),
    ('Engineering'),
    ('Management'),
    ('Executives');

INSERT INTO roles (title, salary, department_id)
VALUES
    ('IT Tech', 120000, 4),
    ('Sales Manager', 150000, 2),
    ('Sales Representative', 80000, 2),
    ('Branch Manager', 200000, 7),
    ('Engineer I', 80000, 6),
    ('Financial Supervisor', 180000, 5),
    ('Customer Service Respresentative', 60000, 3),
    ('Engineer III', 110000, 6),
    ('HR Representative', 75000, 1),
    ('HR Manager', 120000, 1),
    ('CEO', 275000, 8),
    ('CFO', 250000, 8),
    ('CTO', 250000, 8);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Lenny', 'DeStefano', 1, 1),
    ('Linda', 'Belcher', 2, 2),
    ('Felix', 'Fischoeder', 3, 3),
    ('Jimmy', 'Pesto', 4, 4),
    ('David', 'Frond', 5, 5),
    ('Teddy', 'Murphy', 6, 6),
    ('Sarge', 'Bosco', 7, 7),
    ('Peter', 'Pescadero', 8, 8);