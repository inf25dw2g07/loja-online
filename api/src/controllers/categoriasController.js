const db = require('../config/db');

// GET /categorias
exports.listar = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY id');
    res.json(rows);
};

// GET /categorias/:id
exports.obter = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.json(rows[0]);
};

// POST /categorias
exports.criar = async (req, res) => {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ erro: 'O campo "nome" é obrigatório' });

    const [result] = await db.query(
        'INSERT INTO categorias (nome, descricao) VALUES (?, ?)',
        [nome, descricao || null]
    );
    res.status(201).json({ id: result.insertId, nome, descricao });
};

// PUT /categorias/:id
exports.atualizar = async (req, res) => {
    const { nome, descricao } = req.body;
    const [result] = await db.query(
        'UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?',
        [nome, descricao, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.json({ id: Number(req.params.id), nome, descricao });
};

// DELETE /categorias/:id
exports.apagar = async (req, res) => {
    const [result] = await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.status(204).send();
};

// GET /categorias/:id/produtos  (demonstra a relação 1:n)
exports.listarProdutos = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM produtos WHERE categoria_id = ?', [req.params.id]);
    res.json(rows);
};
