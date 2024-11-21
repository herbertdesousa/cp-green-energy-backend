import express from 'express';
import cors from 'cors';
import z from 'zod';
import { addDays, format } from 'date-fns';
import { generateId } from './utils/generateId';

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

type Source = {
  id: string;
  label: string;
  powers: Power[];
};

type Power = {
  id: string;
  label: string;
  status: boolean;
};

const sources: Source[] = [
  {
    id: generateId(),
    label: 'Luzes',
    powers: [
      { id: generateId(), label: 'Luz 1', status: true },
      { id: generateId(), label: 'Luz 2', status: true },
      { id: generateId(), label: 'Luz 3', status: false },
    ],
  },
  {
    id: generateId(),
    label: 'Geladeira',
    powers: [
      { id: generateId(), label: 'Geladeira 1', status: false },
      { id: generateId(), label: 'Geladeira 2', status: true },
    ],
  },
  {
    id: generateId(),
    label: "TV's",
    powers: [
      { id: generateId(), label: 'TV 1', status: true },
      { id: generateId(), label: 'TV 2', status: false },
    ],
  },
  {
    id: generateId(),
    label: "Outros",
    powers: [
      { id: generateId(), label: 'Computador', status: false },
    ],
  },
];

const getSourcesDTO = z.object({
  active: z.string().transform((val) => val === 'true').optional().default('false'),
});

app.get('/sources', (req, res) => {
  const DTO = getSourcesDTO.parse(req.query);

  res.json(sources.map(source => ({
    id: source.id,
    label: source.label,
    activeAmount: source.powers.filter(power => power.status).length,
  })));
});

app.get('/sources/:sourceId', (req, res) => {
  const { sourceId } = req.params;
  const source = sources.find(source => source.id === sourceId);

  if (source) {
    res.json(source);
  } else {
    res.status(404).json({ message: 'Source not found' });
  }
});

const addPowerDTO = z.object({
  label: z.string().min(1),
});

app.post('/sources/:sourceId', (req, res) => {
  const { sourceId } = req.params;
  const dto = addPowerDTO.safeParse(req.body);

  if (!dto.success) {
    res.status(400).json({ errors: dto.error.errors });
    return;
  }

  const { label } = dto.data;

  const source = sources.find(source => source.id === sourceId);

  if (!source) {
    res.status(404).json({ message: 'Source not found' });
    return;
  }

  const newPower = {
    id: generateId(),
    label,
    status: false,
  };

  source.powers.push(newPower);

  res.status(201).json(newPower);
});

app.patch('/sources/:sourceId/:powerId', (req, res) => {
  const { sourceId, powerId } = req.params;

  const source = sources.find(source => source.id === sourceId);

  if (!source) {
    res.status(404).json({ message: 'Source not found' });
    return;
  }

  const power = source.powers.find(power => power.id === powerId);

  if (!power) {
    res.status(404).json({ message: 'Power not found' });
    return;
  }

  power.status = !power.status;
  res.status(200).json({ message: 'Power status toggled successfully' });
});



app.listen(3333, () => {
  console.log('Server started on port 3333');
});
