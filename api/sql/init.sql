-- ============================================================
-- Loja Online - Schema + Seed Data
-- Universidade da Maia - DW2 - Exame Prático 2025/26
-- ============================================================

CREATE DATABASE IF NOT EXISTS loja_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE loja_online;

-- ------------------------------------------------------------
-- Tabela: utilizadores
-- ------------------------------------------------------------
CREATE TABLE utilizadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Tabela: categorias
-- ------------------------------------------------------------
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    descricao VARCHAR(255)
);

-- ------------------------------------------------------------
-- Tabela: produtos  (N:1 com categorias => 1:N categorias->produtos)
-- ------------------------------------------------------------
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(255),
    preco DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ------------------------------------------------------------
-- Tabela: encomendas  (pertence a um utilizador -> recurso "próprio")
-- ------------------------------------------------------------
CREATE TABLE encomendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT NOT NULL,
    data_encomenda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendente', 'pago', 'enviado', 'entregue', 'cancelado') NOT NULL DEFAULT 'pendente',
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ------------------------------------------------------------
-- Tabela: linhas_encomenda (detalhe de cada encomenda)
-- ------------------------------------------------------------
CREATE TABLE linhas_encomenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    encomenda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (encomenda_id) REFERENCES encomendas(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- ------------------------------------------------------------
-- Tabela: oauth2 tokens (necessária para oauth2-server)
-- ------------------------------------------------------------
CREATE TABLE oauth_clients (
    id VARCHAR(80) PRIMARY KEY,
    client_secret VARCHAR(80) NOT NULL,
    grants VARCHAR(255) NOT NULL,
    redirect_uris VARCHAR(255)
);

CREATE TABLE oauth_tokens (
    access_token VARCHAR(255) PRIMARY KEY,
    access_token_expires_at DATETIME,
    refresh_token VARCHAR(255),
    refresh_token_expires_at DATETIME,
    client_id VARCHAR(80),
    utilizador_id INT,
    scope VARCHAR(255)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Cliente OAuth2 "app" pré-registado (necessário para o grant password)
INSERT INTO oauth_clients (id, client_secret, grants, redirect_uris) VALUES
('loja-web-client', 'loja-web-secret', 'password,refresh_token', '');

-- --- Utilizadores (password em texto simples nos comentários: "password123")
-- hash bcrypt gerado para 'password123'
INSERT INTO utilizadores (username, password_hash, nome, email, role) VALUES
('admin', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Administrador', 'admin@loja.pt', 'admin'),
('jsilva', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'João Silva', 'jsilva@mail.pt', 'cliente'),
('amartins', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Ana Martins', 'amartins@mail.pt', 'cliente'),
('pcosta', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Pedro Costa', 'pcosta@mail.pt', 'cliente'),
('mferreira', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Maria Ferreira', 'mferreira@mail.pt', 'cliente'),
('ttavares', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Tiago Tavares', 'ttavares@mail.pt', 'cliente'),
('rlima', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Rita Lima', 'rlima@mail.pt', 'cliente'),
('cnunes', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Carlos Nunes', 'cnunes@mail.pt', 'cliente'),
('sfreitas', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Sofia Freitas', 'sfreitas@mail.pt', 'cliente'),
('dalves', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Diogo Alves', 'dalves@mail.pt', 'cliente'),
('lribeiro', '$2a$10$zPYgBrLpJGyT5yyX/F/WTeIb5s0Nr9DE3FxKKe8diWhOTVCYNxTYy', 'Luísa Ribeiro', 'lribeiro@mail.pt', 'cliente');

-- --- Categorias (10)
INSERT INTO categorias (nome, descricao) VALUES
('Informática', 'Computadores, portáteis e acessórios'),
('Smartphones', 'Telemóveis e acessórios'),
('Áudio', 'Colunas, auscultadores e equipamento de som'),
('Gaming', 'Consolas, jogos e periféricos'),
('Casa Inteligente', 'Dispositivos smart home'),
('Fotografia', 'Câmaras e acessórios fotográficos'),
('Wearables', 'Smartwatches e pulseiras de atividade'),
('Redes', 'Routers, switches e equipamento de rede'),
('Armazenamento', 'Discos externos e pen drives'),
('Acessórios', 'Cabos, capas e outros acessórios diversos');

-- --- Produtos (30) - distribuídos pelas categorias
INSERT INTO produtos (nome, descricao, preco, stock, categoria_id) VALUES
('Portátil UltraBook 14"', 'Portátil leve com SSD 512GB', 899.99, 15, 1),
('PC Desktop Gamer', 'Torre com placa gráfica dedicada', 1299.00, 8, 1),
('Teclado Mecânico RGB', 'Teclado mecânico com switches azuis', 59.90, 40, 1),
('Rato Óptico Sem Fios', 'Rato ergonómico 2.4GHz', 19.99, 60, 1),
('Monitor 27" 4K', 'Monitor IPS UHD 27 polegadas', 349.00, 12, 1),
('Smartphone Galaxy X10', 'Ecrã AMOLED 6.5", 128GB', 649.00, 25, 2),
('Smartphone Lite 5G', 'Bateria 5000mAh, câmara tripla', 329.00, 30, 2),
('Capa Silicone Universal', 'Capa protetora anti-choque', 9.99, 100, 2),
('Carregador Rápido 65W', 'Carregador USB-C PD', 24.99, 80, 2),
('Coluna Bluetooth Portátil', 'Som 360º, resistente a água', 45.00, 35, 3),
('Auscultadores Noise Cancelling', 'Cancelamento ativo de ruído', 129.90, 20, 3),
('Soundbar 2.1', 'Soundbar com subwoofer sem fios', 179.00, 10, 3),
('Consola NextGen', 'Consola de nova geração 1TB', 499.00, 6, 4),
('Comando Sem Fios', 'Comando adicional compatível NextGen', 64.99, 25, 4),
('Cadeira Gaming Pro', 'Cadeira ergonómica reclinável', 219.00, 9, 4),
('Headset Gaming 7.1', 'Som surround virtual', 74.90, 18, 4),
('Lâmpada Inteligente RGB', 'Controlo por app e voz', 14.99, 50, 5),
('Ficha Smart Plug', 'Tomada inteligente Wi-Fi', 12.50, 45, 5),
('Câmara de Segurança WiFi', 'Câmara interior Full HD', 39.99, 22, 5),
('Câmara DSLR Entry-Level', 'Câmara reflex 24MP com lente kit', 549.00, 7, 6),
('Tripé de Alumínio', 'Tripé leve extensível até 1.6m', 29.90, 26, 6),
('Cartão SD 128GB', 'Cartão de memória classe 10', 18.50, 70, 6),
('Smartwatch FitPro', 'Monitor cardíaco e GPS', 149.00, 20, 7),
('Pulseira de Atividade', 'Contador de passos e sono', 34.90, 40, 7),
('Router WiFi 6', 'Router dual-band alta velocidade', 89.90, 15, 8),
('Switch 8 Portas Gigabit', 'Switch de rede não gerido', 32.00, 20, 8),
('Repetidor WiFi', 'Extensor de sinal Wi-Fi', 22.90, 33, 8),
('Disco Externo 2TB', 'Disco rígido portátil USB 3.0', 69.90, 28, 9),
('Pen Drive 64GB', 'Pen USB 3.1 alta velocidade', 11.99, 90, 9),
('Cabo USB-C 2m', 'Cabo de carregamento reforçado', 8.99, 120, 10);

-- --- Encomendas (30) - distribuídas pelos clientes (utilizador_id 2..11)
INSERT INTO encomendas (utilizador_id, estado, total) VALUES
(2, 'entregue', 919.98), (3, 'pago', 649.00), (4, 'pendente', 59.90),
(5, 'enviado', 349.00), (6, 'entregue', 89.89), (7, 'cancelado', 129.90),
(8, 'pago', 499.00), (9, 'pendente', 24.99), (10, 'entregue', 179.00),
(11, 'enviado', 45.00), (2, 'pago', 74.90), (3, 'pendente', 549.00),
(4, 'entregue', 18.50), (5, 'enviado', 149.00), (6, 'pago', 34.90),
(7, 'entregue', 89.90), (8, 'pendente', 32.00), (9, 'enviado', 22.90),
(10, 'entregue', 69.90), (11, 'pago', 11.99), (2, 'pendente', 8.99),
(3, 'enviado', 219.00), (4, 'entregue', 64.99), (5, 'pago', 329.00),
(6, 'pendente', 9.99), (7, 'entregue', 39.99), (8, 'enviado', 29.90),
(9, 'pago', 12.50), (10, 'pendente', 14.99), (11, 'entregue', 1299.00);

-- --- Linhas de encomenda (relação com produtos, para consistência dos totais acima nas primeiras)
INSERT INTO linhas_encomenda (encomenda_id, produto_id, quantidade, preco_unitario) VALUES
(1, 1, 1, 899.99), (1, 4, 1, 19.99), (2, 6, 1, 649.00), (3, 3, 1, 59.90),
(4, 5, 1, 349.00), (5, 18, 1, 12.50), (5, 4, 1, 19.99), (5, 8, 1, 9.99),
(6, 11, 1, 129.90), (7, 13, 1, 499.00), (8, 9, 1, 24.99), (9, 12, 1, 179.00),
(10, 10, 1, 45.00), (11, 16, 1, 74.90), (12, 20, 1, 549.00), (13, 22, 1, 18.50),
(14, 23, 1, 149.00), (15, 24, 1, 34.90), (16, 25, 1, 89.90), (17, 26, 1, 32.00),
(18, 27, 1, 22.90), (19, 28, 1, 69.90), (20, 29, 1, 11.99), (21, 30, 1, 8.99),
(22, 15, 1, 219.00), (23, 14, 1, 64.99), (24, 7, 1, 329.00), (25, 17, 1, 14.99);
