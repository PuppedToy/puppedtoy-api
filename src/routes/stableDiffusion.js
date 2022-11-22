// Express server

const express = require('express');
require('dotenv').config();

const {
  getModels, requestQuery, getCurrentQuery, getQuery,
} = require('../utils/stableDiffusion');

const router = express.Router();

router.use('/pics', express.static('pics'));
router.use(express.json({ limit: '50mb' }));

router.get('/models', (req, res) => {
  res.json(getModels());
});

router.post('/query', async (req, res) => {
  const {
    prompt, seed, ckpt, quantity,
  } = req.body;
  const query = requestQuery(prompt, seed, ckpt, quantity);
  res.status(201).send({
    id: query.id,
    seed: query.seed,
    prompt: query.prompt,
    ckpt: query.ckpt,
    quantity: query.quantity,
  });
});

router.get('/query/:id', (req, res) => {
  const { id } = req.params;
  const query = getQuery(id);
  res.json(query);
});

router.get('/query/current', (req, res) => {
  const query = getCurrentQuery();
  res.json(query);
});

module.exports = router;
