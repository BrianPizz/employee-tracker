// Import and require mysql2 and inquirer
const mysql = require('mysql2');
const inquirer = require('inquirer');
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
            message: 'What would oyu like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit']
        }])
        .then((answers) => {
            switch (answers.options) {
                case 'View All Employees':
                    return viewEmployees();
                case 'Add Employee':
                // function 
                case 'Update Employee Role':
                // function 
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
    LEFT JOIN employee AS m ON e.manager_id = m.id;`, function (err, results) {
        if (err) throw err;
        console.log(results);
        prompt();
    })
}

// Add employee
const addEmployee = () => {
    db.query(`SELECT * FROM employee`, function (err, results) {
        if (err) throw err;

    })
}

// view all roles with id title and salary
const viewRoles = () => {
    db.query('SELECT role.id, role.title, role.salary, department.department_name AS department FROM role JOIN department ON role.department_id = department.id ORDER BY role.id;', function (err, results) {
        if (err) throw err;
        console.log(results);
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
        console.log(results);
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