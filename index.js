const express = require('express');
// Import and require mysql2 and inquirer
const mysql = require('mysql12');
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

function init() { 
    inquirer
        .prompt()

        .then()
}
