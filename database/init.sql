-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tododb;

USE tododb;

-- Create the todos table
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data (optional)
INSERT INTO todos (task) VALUES ('Sample task - Welcome to your To-Do App!');
