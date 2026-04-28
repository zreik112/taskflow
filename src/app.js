require('dotenv').config();
const express = require('express');
const tasksRouter = require('./routes/tasks');
const { errorHandler } = require('./middleware/error-handler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/tasks', tasksRouter);

// Error handler must be mounted last
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`TaskFlow API listening on port ${PORT}`));
}

module.exports = app;
