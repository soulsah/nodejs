const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/webhook', (req,res) => {
  return res.status(200).json(req.body)
})

app.post('/processarPagamento', (req, res) => {
  const { pedidoId, valorTotal, dadosPagamento } = req.body;

  // Verificar se todos os campos necessários foram enviados
  if (!pedidoId || !valorTotal || !dadosPagamento) {
    return res.status(400).json({ error: 'Todos os campos de pagamento devem ser enviados' });
  }

  // Verificar se o número do cartão possui a quantidade correta de caracteres
  if (!dadosPagamento.numCartao || dadosPagamento.numCartao.length !== 16) {
    return res.status(400).json({ error: 'Número de cartão inválido' });
  }

  // Verificar se a data enviada é válida
  const today = new Date();
  const [mesValidade, anoValidade] = dadosPagamento.validade.split('/');

  // Validar se o mês está entre 1 e 12
  const mesValidadeNumero = parseInt(mesValidade, 10);
  if (mesValidadeNumero < 1 || mesValidadeNumero > 12) {
    return res.status(400).json({ error: 'Mês de validade inválido' });
  }

  // Modificação para verificar apenas mês e ano
  const validade = new Date(anoValidade, mesValidadeNumero - 1, 1);

  if (isNaN(validade) || validade <= today) {
    return res.status(400).json({ error: 'Data de validade inválida' });
  }

  axios.post(`http://localhost:${PORT}/webhook`, {
    pedidoId,
    status: 'approved'
  })
  .then(response => {
    res.json(response.data);
  })
  .catch(error => {
    console.error('Erro ao fazer o request para o webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  });
});

app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}/`);
});
