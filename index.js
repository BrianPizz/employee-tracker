// Import and require mysql2 and inquirer
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table')
// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password
        password: 'password',
        database: 'employees_db'
    },
    console.log(`Connected to the books_db database.`)
);

const prompt = () => {
    inquirer
        .prompt([{
            type: 'list',
            name: 'options',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'Update Employee manager', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit']
        }])
        .then((answers) => {
            switch (answers.options) {
                case 'View All Employees':
                    return viewEmployees();
                case 'Add Employee':
                    return addEmployee();
                case 'Update Employee Role':
                    return updateEmployee();
                case 'Update Employee manager':
                    return updateManager();
                case 'View All Roles':
                    return viewRoles();
                case 'Add Role':
                    return addRole();
                case 'View All Departments':
                    return viewDepartments();
                case 'Add Department':
                    return addDepartment();
                case 'Exit':
                    return process.exit()
            }
        })
}
// View all employees
const viewEmployees = () => {
    db.query(`SELECT e.id, e.first_name, e.last_name, r.title, d.department_name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee AS e
    JOIN role AS r ON e.role_id = r.id 
    JOIN department AS d ON r.department_id = d.id
    LEFT JOIN employee AS m ON e.manager_id = m.id
    ORDER BY e.id;`, function (err, results) {
        if (err) throw err;
        console.table(results);
        prompt();
    });
}

// Add employee
const addEmployee = () => {

    let managerChoices
    // pull manager names and id
    db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`, function (err, results) {
        if (err) throw err;
        managerChoices = results.map((result) => {
            return {
                name: result.name,
                value: result.id
            }
        });
        // add no manager option
        managerChoices.push({
            name: 'none',
            value: null
        })
        // pull roles
        db.query(`SELECT * FROM role`, function (err, results) {
            if (err) throw err;
            const roleChoices = results.map((result) => {
                return {
                    name: result.title,
                    value: result.id
                }
            });

            inquirer
                .prompt([{
                    name: 'firstName',
                    message: `What is the employee's first name?`
                },
                {
                    name: 'lastName',
                    message: `What is the employee's last name?`
                },
                {
                    name: 'role',
                    message: `What is the employee's role?`,
                    type: 'list',
                    choices: roleChoices
                },
                {
                    name: 'manager',
                    message: `Who is the employee's manager?`,
                    type: 'list',
                    choices: managerChoices
                }
                ])
                .then((answers) => {
                    const { firstName, lastName, role, manager } = answers;

                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUE (?, ?, ?, ?);`, [firstName, lastName, role, manager], function (err, results) {
                        if (err) throw err;
                        console.log(`Employee ${firstName} ${lastName} added to the database`)
                        prompt();
                    })
                });
        });
    });
}

// update employee
const updateEmployee = () => {
    let employeeList;
    let roleList;

    db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`, function (err, employeeResults) {
        if (err) throw err;
        employeeList = employeeResults.map((result) => {
            return {
                name: result.name,
                value: result.id,
            }
        });

        db.query(`SELECT id, title FROM role`, function (err, roleResults) {
            if (err) throw err;
            roleList = roleResults.map((result) => {
                return {
                    name: result.title,
                    value: result.id,
                }
            });

            inquirer
                .prompt([
                    {
                        name: 'employee',
                        message: `Which employee's role do you want to update?`,
                        type: 'list',
                        choices: employeeList,
                    },
                    {
                        name: 'role',
                        message: `Which role do you want to assign the employee?`,
                        type: 'list',
                        choices: roleList,
                    },
                ])
                .then((answers) => {
                    const { employee, role } = answers;
                    // create variable of selected employee
                    const selectedEmployee = employeeList.find((emp) => emp.value === employee);
                    const employeeName = selectedEmployee.name;

                    db.query(`UPDATE employee SET role_id = ${role} WHERE id = ${employee};`, function (err, results) {
                        if (err) throw err;
                        console.log(`${employeeName} role updated`)
                        prompt();
                    })
                });
        });
    });
};
// update manager
const updateManager = () => {
    let employeeList;
    let managerList;
    // grab employee list for employee prompt
    db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`, function (err, employeeResults) {
        if (err) throw err;
        employeeList = employeeResults.map((result) => {
            return {
                name: result.name,
                value: result.id,
            }
        });
    // grab employee list for manager prompt
        db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`, function (err, managerResults) {
            if (err) throw err;
            managerList = managerResults.map((result) => {
                return {
                    name: result.name,
                    value: result.id,
                }
            });

            inquirer
                .prompt([
                    {
                        name: 'employee',
                        message: `Which employee's manager do you want to update?`,
                        type: 'list',
                        choices: employeeList,
                    },
                    {
                        name: 'manager',
                        message: `Which manager do you want to assign the employee?`,
                        type: 'list',
                        choices: managerList,
                    },
                ])
                .then((answers) => {
                    const { employee, manager } = answers;
                    // create variable of selected employee
                    const selectedEmployee = employeeList.find((emp) => emp.value === employee);
                    const employeeName = selectedEmployee.name;
                    // update manager id column
                    db.query(`UPDATE employee SET manager_id = ${manager} WHERE id = ${employee};`, function (err, results) {
                        if (err) throw err;
                        console.log(`${employeeName} manager updated`)
                        prompt();
                    })
                });
        });
    });
}

// view all roles with id title and salary
const viewRoles = () => {
    db.query('SELECT role.id, role.title, role.salary, department.department_name AS department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id;', function (err, results) {
        if (err) throw err;
        console.table(results);
        prompt();
    })
}

// add role
const addRole = () => {
    db.query(`SELECT * FROM department`, function (err, results) {
        if (err) throw err;
        // create array of department table
        const departmentChoices = results.map((result) => {
            return {
                name: result.department_name,
                value: result.id
            };
        });

        inquirer
            .prompt([{
                name: 'name',
                message: 'What is the name of the role?'
            },
            {
                name: 'salary',
                message: 'What is the salary of the role?',
                type: 'number'
            },
            {
                name: 'department',
                message: 'Which department does the role belong to?',
                type: 'list',
                choices: departmentChoices
            }
            ])
            .then((answers) => {
                // pull answer values
                const { name, salary, department } = answers;

                db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [name, salary, department], function (err, results) {
                    if (err) throw err;
                    console.log(`${name} role added to the database`)
                    prompt();
                });

            })
    })
}

// view all departments
const viewDepartments = () => {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) throw err;
        console.table(results);
        prompt();
    })
}

// add department
const addDepartment = () => {
    inquirer
        .prompt([{
            name: 'department',
            message: 'What is the name of the department?'
        }])
        .then((answers) => {
            const departmentValue = answers.department
            db.query(`INSERT INTO department (department_name) VALUE (?) ;`, departmentValue, function (err, results) {
                if (err) throw err;
                console.log(`Added ${answers.department} to department database`);
                prompt();
            })
        })
}

prompt();