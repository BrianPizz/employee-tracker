-- Departments --
INSERT INTO department (department_name)
	VALUE('Engineering'),
		 ('Finance'),
         ('Legal'),
         ('Sales');
-- Roles --      
INSERT INTO role (title, salary, department_id)
	VALUE ('Sales Lead', 100000, 4),
		  ('Salesperson', 80000, 4),
          ('Lead Engineer', 150000, 1),
          ('Software Engineer', 120000, 1),
          ('Account Manager', 160000, 2),
          ('Accountant', 125000, 2),
          ('Legal Team Lead', 250000, 3),
          ('Lawyer', 190000, 3);
-- Employees --
INSERT INTO employee (first_name, last_name, role_id, manager_id)
	VALUE("Brian", "Pizzimenti", 1, Null),
         ("Mariah", "Lewis", 2, 1),
         ("Peyton", "Touma", 3, Null),
         ("Cameron", "Oberhoff", 4, 3),
         ("Ian", "Telechea", 5, Null),
         ("Kaitlin", "McCorkle", 6, 5),
         ("Nick", "Getsay", 7,Null);
