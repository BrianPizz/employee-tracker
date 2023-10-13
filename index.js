// Import and require inquirer and console table
const db = require('./config/connection')
const inquirer = require('inquirer');
const cTable = require('console.table');

const prompt = () => {
    inquirer
        .prompt([{
            type: 'list',
            name: 'options',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'View Employees by manager', 'View Employees by department', 'Add Employee', 'Update Employee Role', 'Update Employee manager', 'Remove an Employee', 'View All Roles', 'Add Role', 'Remove Role', 'View All Departments', 'View Department budget', 'Add Department', 'Remove Department', 'Exit']
        }])
        .then((answers) => {
            switch (answers.options) {
                case 'View All Employees':
                    return viewEmployees();
                case 'View Employees by manager':
                    return managerView();
                case 'View Employees by department':
                    return departmentView();
                case 'Add Employee':
                    return addEmployee();
                case 'Update Employee Role':
                    return updateEmployee();
                case 'Update Employee manager':
                    return updateManager();
                case 'Remove an Employee':
                    return deletEmployee();
                case 'View All Roles':
                    return viewRoles();
                case 'Add Role':
                    return addRole();
                case 'Remove Role':
                    return deleteRole();
                case 'View All Departments':
                    return viewDepartments();
                case 'View Department budget':
                    return viewBudget();
                case 'Add Department':
                    return addDepartment();
                case 'Remove Department':
                    return deleteDepartment();
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
};

// View employees by manager
const managerView = () => {
    db.query(`SELECT
	m.id AS manager_id,
    CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
	e.id AS employee_id,
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name
FROM
    employee AS m
LEFT JOIN
    employee AS e
ON
    m.id = e.manager_id
WHERE
    e.manager_id IS NOT NULL
ORDER BY
    manager_id, employee_id;
`, function (err, results) {
        if (err) throw err;
        console.table(results);
        prompt();
    });
};

// View employees by department
const departmentView = () => {
    db.query(`SELECT
    d.department_name AS department,
    e.id AS employee_id,
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    r.title AS employee_role
FROM
    employee AS e
INNER JOIN
    role AS r
ON
    e.role_id = r.id
INNER JOIN
    department AS d
ON
    r.department_id = d.id
ORDER BY
    department, employee_id;`, function (err, results) {
        if (err) throw err;
        console.table(results);
        prompt();
    });
    ;
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
};

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
};

// Delete employee
const deletEmployee = () => {
    let employeeChoices
    db.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`, function (err, results) {
        if (err) throw err;
        employeeChoices = results.map((result) => {
            return {
                name: result.name,
                value: result.id
            }
        });
        inquirer
            .prompt([{
                name: 'name',
                message: `Which employee would you like to remove?`,
                type: 'list',
                choices: employeeChoices
            },
            ])
            .then((answers) => {
                const { name } = answers;
                // create variable of selected employee
                const selectedEmployee = employeeChoices.find((emp) => emp.value === name);
                const employeeName = selectedEmployee.name;
                db.query(`DELETE FROM employee WHERE id = ${name};`, function (err, results) {
                    if (err) throw err;
                    console.log(`${employeeName} removed to the database`)
                    prompt();
                })
            });
    });
};

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

            });
    });
};

// Delete role
const deleteRole = () => {
    let roleChoices
    db.query(`SELECT * FROM role`, function (err, results) {
        if (err) throw err;
        roleChoices = results.map((result) => {
            return {
                name: result.title,
                value: result.id
            }
        });
        inquirer
            .prompt([{
                name: 'title',
                message: `Which role would you like to remove?`,
                type: 'list',
                choices: roleChoices
            },
            ])
            .then((answers) => {
                const { title } = answers;
                // create variable of selected employee
                const selectedRole = roleChoices.find((role) => role.value === title);
                const roleName = selectedRole.name;
                db.query(`DELETE FROM role WHERE id = ${title};`, function (err, results) {
                    if (err) throw err;
                    console.log(`${roleName} removed from database`)
                    prompt();
                })
            });
    });
};

// view all departments
const viewDepartments = () => {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) throw err;
        console.table(results);
        prompt();
    });
};

// view department budget
const viewBudget = () => {
    db.query(`SELECT
    d.department_name AS department,
    SUM(r.salary) AS total_budget
FROM
    department AS d
INNER JOIN
    role AS r
ON
    d.id = r.department_id
INNER JOIN
    employee AS e
ON
    r.id = e.role_id
GROUP BY
    d.department_name;`, function (err, results) {
        if (err) throw err;
        console.table(results);
        prompt();
    });
};

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
            });
        });
};

// Delete role
const deleteDepartment = () => {
    let departmentChoices
    db.query(`SELECT * FROM department`, function (err, results) {
        if (err) throw err;
        departmentChoices = results.map((result) => {
            return {
                name: result.department_name,
                value: result.id
            }
        });
        inquirer
            .prompt([{
                name: 'department',
                message: `Which department would you like to remove?`,
                type: 'list',
                choices: departmentChoices
            },
            ])
            .then((answers) => {
                const { department } = answers;
                // create variable of selected employee
                const selectedDepartment = departmentChoices.find((dep) => dep.value === department);
                const departmentName = selectedDepartment.name;
                db.query(`DELETE FROM department WHERE id = ${department};`, function (err, results) {
                    if (err) throw err;
                    console.log(`${departmentName} removed from database`)
                    prompt();
                });
            });
    });
};

prompt();