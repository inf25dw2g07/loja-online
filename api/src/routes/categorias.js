const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoriasController');
const { autenticar } = require('../middleware/auth');

router.get('/', autenticar, ctrl.listar);
router.get('/:id', autenticar, ctrl.obter);
router.get('/:id/produtos', autenticar, ctrl.listarProdutos);
router.post('/', autenticar, ctrl.criar);
router.put('/:id', autenticar, ctrl.atualizar);
router.delete('/:id', autenticar, ctrl.apagar);

module.exports = router;
