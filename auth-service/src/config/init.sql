CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS token_blacklist (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  token      TEXT NOT NULL,
  revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (name, email, password) VALUES
('Gabriel Takao', 'gabriel@email.com', '$2b$10$FbUc9o1QWaQTWAIDESJXxeOl7LUuNK2vDO5yPCoKsjg34HjSy7v5K'),
('Luiz Gustavo',  'luiz@email.com',    '$2b$10$FbUc9o1QWaQTWAIDESJXxeOl7LUuNK2vDO5yPCoKsjg34HjSy7v5K');