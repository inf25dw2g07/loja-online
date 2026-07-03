const db = require('../config/db');

// GET /produtos
exports.listar = async (req, res) => {
    const [rows] = await db.query(
        `SELECT p.*, c.nome AS categoria_nome
         FROM produtos p JOIN categorias c ON c.id = p.categoria_id
         ORDER BY p.id`
    );
    res.json(rows);
};

// GET /produtos/:id
exports.obter = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
};

// POST /produtos
exports.criar = async (req, res) => {
    const { nome, descricao, preco, stock, categoria_id } = req.body;
    if (!nome || preco === undefined || !categoria_id) {
        return res.status(400).json({ erro: 'Campos obrigatórios: nome, preco, categoria_id' });
    }

    const [result] = await db.query(
        'INSERT INTO produtos (nome, descricao, preco, stock, categoria_id) VALUES (?, ?, ?, ?, ?)',
        [nome, descricao || null, preco, stock || 0, categoria_id]
    );
    res.status(201).json({ id: result.insertId, nome, descricao, preco, stock, categoria_id });
};

// PUT /produtos/:id
exports.atualizar = async (req, res) => {
    const { nome, descricao, preco, stock, categoria_id } = req.body;
    const [result] = await db.query(
        'UPDATE produtos SET nome=?, descricao=?, preco=?, stock=?, categoria_id=? WHERE id=?',
        [nome, descricao, preco, stock, categoria_id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json({ id: Number(req.params.id), nome, descricao, preco, stock, categoria_id });
};

// DELETE /produtos/:id
exports.apagar = async (req, res) => {
    const [result] = await db.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.status(204).send();
};
