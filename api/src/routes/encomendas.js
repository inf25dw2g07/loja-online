const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/encomendasController');
const { autenticar } = require('../middleware/auth');

router.get('/', autenticar, ctrl.listar);
router.get('/:id', autenticar, ctrl.obter);
router.post('/', autenticar, ctrl.criar);
router.put('/:id', autenticar, ctrl.atualizar);
router.delete('/:id', autenticar, ctrl.apagar);

module.exports = router;
