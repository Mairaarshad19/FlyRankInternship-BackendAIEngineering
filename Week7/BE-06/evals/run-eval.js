const cases = require('./cases.json');
const axios = require('axios');

async function runEval() {
  let correct = 0;
  const failed = [];
  for (const c of cases) {
    const res = await axios.post('http://localhost:3000/classify-book', c.input);
    if (res.data.category === c.expected_category) correct++;
    else failed.push({ input: c.input, expected: c.expected_category, got: res.data.category });
  }
  console.log(`${correct}/${cases.length} correct`);
  console.log('Failed:', failed);
}
runEval();