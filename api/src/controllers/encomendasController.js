const db = require('../config/db');

/**
 * Requisito 15: o utilizador autenticado só acede às SUAS encomendas.
 * Um admin pode ver todas.
 */

// GET /encomendas
exports.listar = async (req, res) => {
    let rows;
    if (req.utilizador.role === 'admin') {
        [rows] = await db.query('SELECT * FROM encomendas ORDER BY id');
    } else {
        [rows] = await db.query(
            'SELECT * FROM encomendas WHERE utilizador_id = ? ORDER BY id',
            [req.utilizador.id]
        );
    }
    res.json(rows);
};

// GET /encomendas/:id
exports.obter = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM encomendas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Encomenda não encontrada' });

    const encomenda = rows[0];
    if (req.utilizador.role !== 'admin' && encomenda.utilizador_id !== req.utilizador.id) {
        return res.status(403).json({ erro: 'Não tem permissão para aceder a esta encomenda' });
    }

    const [linhas] = await db.query(
        `SELECT le.*, p.nome AS produto_nome
         FROM linhas_encomenda le JOIN produtos p ON p.id = le.produto_id
         WHERE le.encomenda_id = ?`,
        [req.params.id]
    );

    res.json({ ...encomenda, linhas });
};

// POST /encomendas  -> cria sempre associada ao utilizador autenticado
exports.criar = async (req, res) => {
    const { estado, linhas } = req.body; // linhas: [{produto_id, quantidade}]
    if (!Array.isArray(linhas) || linhas.length === 0) {
        return res.status(400).json({ erro: 'É necessário indicar pelo menos uma linha de encomenda' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [result] = await conn.query(
            'INSERT INTO encomendas (utilizador_id, estado, total) VALUES (?, ?, 0)',
            [req.utilizador.id, estado || 'pendente']
        );
        const encomendaId = result.insertId;

        let total = 0;
        for (const linha of linhas) {
            const [[produto]] = await conn.query('SELECT preco FROM produtos WHERE id = ?', [linha.produto_id]);
            if (!produto) throw new Error(`Produto ${linha.produto_id} não existe`);

            const precoUnitario = produto.preco;
            total += precoUnitario * linha.quantidade;

            await conn.query(
                'INSERT INTO linhas_encomenda (encomenda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                [encomendaId, linha.produto_id, linha.quantidade, precoUnitario]
            );
        }

        await conn.query('UPDATE encomendas SET total = ? WHERE id = ?', [total, encomendaId]);
        await conn.commit();

        res.status(201).json({ id: encomendaId, utilizador_id: req.utilizador.id, estado: estado || 'pendente', total });
    } catch (err) {
        await conn.rollback();
        res.status(400).json({ erro: 'Erro ao criar encomenda', detalhe: err.message });
    } finally {
        conn.release();
    }
};

// PUT /encomendas/:id  -> normalmente só o estado é atualizado
exports.atualizar = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM encomendas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Encomenda não encontrada' });

    const encomenda = rows[0];
    if (req.utilizador.role !== 'admin' && encomenda.utilizador_id !== req.utilizador.id) {
        return res.status(403).json({ erro: 'Não tem permissão para alterar esta encomenda' });
    }

    const { estado } = req.body;
    await db.query('UPDATE encomendas SET estado = ? WHERE id = ?', [estado, req.params.id]);
    res.json({ id: Number(req.params.id), estado });
};

// DELETE /encomendas/:id
exports.apagar = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM encomendas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ erro: 'Encomenda não encontrada' });

    const encomenda = rows[0];
    if (req.utilizador.role !== 'admin' && encomenda.utilizador_id !== req.utilizador.id) {
        return res.status(403).json({ erro: 'Não tem permissão para apagar esta encomenda' });
    }

    await db.query('DELETE FROM encomendas WHERE id = ?', [req.params.id]);
    res.status(204).send();
};
