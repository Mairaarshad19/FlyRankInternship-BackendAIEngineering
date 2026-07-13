import express from 'express';

const app = express();
app.use(express.json());
const PORT = 3000;

let users = [
  { id: 1, name: "Ali" },
  { id: 2, name: "Sara" }
];

app.get('/', (req, res) => {
    res.send('Hello World! My first server is running!')
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})