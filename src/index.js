const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { PORT } = require('./config');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
