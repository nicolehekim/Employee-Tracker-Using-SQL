const inquirer = require('inquirer');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'tracker_db',
    user: 'root',
    password: ''
});

connection.connect((err) => {
    if (err) throw err;

    console.log("Successfully connected to database");
    start();
});

function start() {
    inquirer
        .prompt({
            type: 'list',
            message: 'Please select from the following:',
            name: 'options',
            choices: [
                "View all departments", 
                "View all roles", 
                "View all employees", 
                "Add a department", 
                "Add a role", 
                "Add an employee", 
                "Update an employee role",
                "exit",
            ]
        }) .then((answer) => {
            switch (answer.options) {
                case "View all departments":
                    viewAllDepartments();
                    break;
                case "View all roles":
                    viewAllRoles();
                    break;
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "Add a department":
                    addADepartment();
                    break;
                case "Add a role":
                    addARole();
                    break;
                case "Add an employee":
                    addAnEmployee();
                    break;
                case "Update an employee role":
                    updateEmployeRole();
                    break;
                case "exit":
                    connection.end();
                    break;
                default:
                    start();
            }
        });
}

function viewAllDepartments() {
    const query = 'SELECT * FROM department';

    connection.query(query, (err, res) => {
        if (err) throw err;

        console.table(res);
        start();
    });
}

function viewAllRoles() {
    const query = 'SELECT roles.id, roles.title, department.names, roles.salary from roles join department on roles.department_id = department.id';

    connection.query(query, (err, res) => {
        if (err) throw err;

        console.table(res);
        start();
    });
}

function viewAllEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, roles.title, department.names AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
    FROM employee 
    LEFT JOIN roles on employee.role_id = roles.id 
    LEFT JOIN department on roles.department_id = department.id 
    LEFT JOIN employee manager on manager.id = employee.manager_id;`;

    connection.query(query, (err, res) => {
        if (err) throw err;

        console.table(res);
        start();
    });
}

function addADepartment() {
    inquirer
        .prompt({
            type: "input",
            message: "Enter new department name:",
            name: "newDpt"
        }) .then((answer) => {
            console.log(answer.newDpt);

            const query = `INSERT INTO department (names) VALUES ("${answer.newDpt}")`;

            connection.query(query, (err, res) => {
                if (err) throw err;

                console.log(`Successfully added department (${answer.newDpt}).`);

                start();
                console.log(answer.newDpt);
            });
        });
}

function addARole() {
    const query = "SELECT * FROM department";

    connection.query(query, (err, res) => {
        if (err) throw err;

        inquirer
        .prompt ([
            {
                type: "input",
                message: "Title for new role:",
                name: "newRole"
            },
            {
                type: "input",
                message: "Salary for new role:",
                name: "newSalary"
            },
            {
                type: "list",
                message: "Department for new role:",
                name: "department",
                choices: res.map(
                    (department) => department.names
                ),
            },
        ]) .then((answers) => {
            const department = res.find(
                (department) => department.name === answers.department_id
            );

            const query = "INSERT INTO roles SET ?";
            connection.query(
                query, 
                {
                    title: answers.newRole,
                    salary: answers.newSalary,
                    department_id: department.id,
                },
                (err, res) => {
                    if (err) throw err;

                    console.log(`Added role ${answers.newRole} with salary ${answers.newSalary} in ${answers.department}`);

                    start();
                }
            );
        });
    });
}

function addAnEmployee() {
    connection.query("SELECT id, title FROM roles", (error, results) => {
        if (error) {
            console.log(error);
            return;
        }

        const roles = results.map(({ id, title }) => ({
            name: title,
            value: id,
        }));

        connection.query(`SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee`,
        (error, results) => {
            if (error) {
                console.error(error);
                return;
            }

            const managers = results.map(({ id, name }) => ({
                name,
                value: id,
            }));

            inquirer
            .prompt([
                {
                    type: 'input',
                    message: "Employee's first name:",
                    name: "firstName"
                },
                {
                    type: 'input',
                    message: "Employee's last name:",
                    name: "lastName"
                },
                {
                    type: 'list',
                    message: "Employee's role:",
                    name: "roleID",
                    choices: roles,
                },
                {
                    type: 'list',
                    message: "Employee's manager:",
                    name: "managerID",
                    choices: [
                        { name: "None", value: null },
                        ...managers,
                    ],
                },
            ]) .then((answers) => {
                const sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";

                const values = [
                    answers.firstName,
                    answers.lastName,
                    answers.roleID,
                    answers.managerID,
                ];

                connection.query(sql, values, (error) => {
                    if (error) {
                        console.error(error);
                        return;
                    }

                    console.log("Successfully added employee");
                    start();
                });
            }) .catch((error) => {
                console.error(error);
            });
        });
    });
}

function updateEmployeRole() {
    const queryEmp = "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id";

    const queryRole = "SELECT * FROM roles";

    connection.query(queryEmp, (err, resEmp) => {
        if (err) throw err;

        connection.query(queryRole, (err, resRole) => {
            if (err) throw err;

            inquirer
            .prompt([
                {
                    type: "list",
                    message: "Employee to update:",
                    name: "employee",
                    choices: resEmp.map(
                        (employee) => `${employee.first_name} ${employee.last_name}`
                    ),
                },
                {
                    type: "list",
                    message: "Update role:",
                    name: "roles",
                    choices: resRole.map((roles) => roles.title),
                },

            ]) .then((answers) => {
                const employee = resEmp.find(
                    (employee) => `${employee.first_name} ${employee.last_name}` === answers.employee
                );

                const roles = resRole.find(
                    (roles) => roles.title === answers.roles
                );

                const query = "UPDATE employee SET role_id = ? WHERE id = ?";

                connection.query(
                    query,
                    [roles.id, employee.id],
                    (err, res) => {
                        if (err) throw err;

                        console.log(`${employee.first_name} ${employee.last_name} updated in the system.`);

                        start();
                    }
                )
            })
        })
    })
}

process.on("exit", () => {
    connection.end();
});