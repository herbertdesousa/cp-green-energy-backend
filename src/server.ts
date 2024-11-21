import express from 'express';
import cors from 'cors';
import { addDays, format } from 'date-fns';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.get('/balance', (req, res) => {
  res.json({
    amount: '55.98',
    closesIn: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
  });
});

app.listen(3333, () => {
  console.log('Server started on port 3333');
});
