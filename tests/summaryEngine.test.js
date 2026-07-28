import { buildSummary } from '../js/engines/summaryEngine.js';

const tests = [];

function assertEqual(actual, expected, message) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  tests.push({ pass, message, actual, expected });
}

function run() {
  const cases = [
    {
      name: 'LEVEL2 重症胸痛まとめ',
      input: {
        protocolId: 'chestPain',
        answers: {
          radiation: '左肩',
          chestPainSeverity: '10/10'
        },
        redFlags: [
          { id: 'sudden_onset', label: '突然発症' },
          { id: 'cold_sweat', label: '冷汗' },
          { id: 'breathing_difficulty', label: '呼吸困難' },
          { id: 'consciousness_impairment', label: '意識障害' }
        ],
        urgency: { level: 'LEVEL2', label: '高' }
      },
      expected: {
        summary: '突然発症の胸痛です。\n冷汗があります。\n呼吸困難があります。\n意識障害があります。\n左肩へ放散しています。\n疼痛は10/10です。\n緊急度はLEVEL2（高）です。'
      }
    },
    {
      name: 'LEVEL4 疼痛のみ',
      input: {
        protocolId: 'chestPain',
        answers: {
          chestPainSeverity: '5/10'
        },
        redFlags: [],
        urgency: { level: 'LEVEL4', label: '低' }
      },
      expected: {
        summary: '疼痛は5/10です。\n緊急度はLEVEL4（低）です。'
      }
    },
    {
      name: 'LEVEL1 RedFlagなし',
      input: {
        protocolId: 'chestPain',
        answers: {},
        redFlags: [],
        urgency: { level: 'LEVEL1', label: '最優先' }
      },
      expected: {
        summary: '緊急度はLEVEL1（最優先）です。'
      }
    },
    {
      name: '未入力時は空文字',
      input: {
        protocolId: 'chestPain',
        answers: null,
        redFlags: null,
        urgency: null
      },
      expected: {
        summary: ''
      }
    }
  ];

  for (const testCase of cases) {
    const actual = buildSummary(testCase.input.protocolId, testCase.input.answers, testCase.input.redFlags, testCase.input.urgency);
    assertEqual(actual, testCase.expected, testCase.name);
  }

  const passed = tests.filter(t => t.pass).length;
  const summary = `${passed}/${tests.length} tests passed`;
  document.getElementById('summary').innerHTML = `<h2>${summary}</h2>`;
  document.getElementById('output').textContent = tests
    .map(t => `${t.pass ? 'PASS' : 'FAIL'}: ${t.message}\nExpected: ${JSON.stringify(t.expected)}\nActual: ${JSON.stringify(t.actual)}\n`)
    .join('\n');
}

run();
