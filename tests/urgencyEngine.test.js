import { evaluateUrgency } from '../js/engines/urgencyEngine.js';

const tests = [];

function assertEqual(actual, expected, message) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  tests.push({ pass, message, actual, expected });
}

async function runTests() {
  const rules = await fetch('../protocols/urgencyRules.json').then(r => r.json());
  document.getElementById('output').textContent = 'Loaded urgency rules: ' + rules.length + '\n\n';

  const cases = [
    {
      name: '正常系 LEVEL1',
      input: {
        protocolId: 'chestPain',
        answers: {},
        redFlags: [
          { id: 'sudden_onset', label: '突然発症' },
          { id: 'consciousness_impairment', label: '意識障害' }
        ]
      },
      expected: {
        level: 'LEVEL1',
        priority: 1,
        label: '最優先',
        severity: 'critical',
        stars: 5,
        color: 'red',
        reasons: ['突然発症', '意識障害']
      }
    },
    {
      name: '正常系 RULE LEVEL2',
      input: {
        protocolId: 'chestPain',
        answers: {},
        redFlags: [
          { id: 'cold_sweat', label: '冷汗' },
          { id: 'breathing_difficulty', label: '呼吸困難' }
        ]
      },
      expected: {
        level: 'LEVEL2',
        priority: 2,
        label: '高',
        severity: 'high',
        stars: 4,
        color: 'orange',
        reasons: ['冷汗', '呼吸困難']
      }
    },
    {
      name: '正常系 RULE LEVEL3',
      input: {
        protocolId: 'chestPain',
        answers: {},
        redFlags: [
          { id: 'radiation_pain', label: '放散痛' }
        ]
      },
      expected: {
        level: 'LEVEL3',
        priority: 3,
        label: '中',
        severity: 'medium',
        stars: 3,
        color: 'yellow',
        reasons: ['放散痛']
      }
    },
    {
      name: '正常系 RULE LEVEL4 default',
      input: {
        protocolId: 'chestPain',
        answers: {},
        redFlags: []
      },
      expected: {
        level: 'LEVEL4',
        priority: 4,
        label: '低',
        severity: 'low',
        stars: 1,
        color: 'blue',
        reasons: []
      }
    },
    {
      name: '異常系 JSON未読込',
      input: {
        protocolId: 'chestPain',
        answers: {},
        redFlags: []
      },
      expected: {
        level: 'LEVEL4',
        priority: 4,
        label: '低',
        severity: 'low',
        stars: 1,
        color: 'blue',
        reasons: []
      },
      simulateFetchFail: true
    },
    {
      name: '異常系 不正な入力',
      input: {
        protocolId: null,
        answers: null,
        redFlags: null
      },
      expected: {
        level: 'LEVEL4',
        priority: 4,
        label: '低',
        severity: 'low',
        stars: 1,
        color: 'blue',
        reasons: []
      }
    },
    {
      name: '異常系 Rule未一致',
      input: {
        protocolId: 'chestPain',
        answers: {},
        redFlags: [
          { id: 'unknown_flag', label: '未知フラグ' }
        ]
      },
      expected: {
        level: 'LEVEL4',
        priority: 4,
        label: '低',
        severity: 'low',
        stars: 1,
        color: 'blue',
        reasons: []
      }
    }
  ];

  for (const testCase of cases) {
    let actual;
    let error = null;

    try {
      if (testCase.simulateFetchFail) {
        const originalFetch = window.fetch;
        window.fetch = () => Promise.reject(new Error('fetch failed'));
        actual = await evaluateUrgency(testCase.input.protocolId, testCase.input.answers, testCase.input.redFlags);
        window.fetch = originalFetch;
      } else {
        actual = await evaluateUrgency(testCase.input.protocolId, testCase.input.answers, testCase.input.redFlags);
      }
    } catch (err) {
      error = err;
    }

    assertEqual(error, null, testCase.name + ' should not throw');
    assertEqual(actual, testCase.expected, testCase.name);
  }

  const passed = tests.filter(t => t.pass).length;
  const summary = `${passed}/${tests.length} tests passed`;
  document.getElementById('summary').innerHTML = `<h2>${summary}</h2>`;

  const output = tests.map(t => {
    const status = t.pass ? 'PASS' : 'FAIL';
    return `${status}: ${t.message}\nExpected: ${JSON.stringify(t.expected)}\nActual: ${JSON.stringify(t.actual)}\n`;
  }).join('\n');

  document.getElementById('output').textContent += output;
}

runTests().catch(err => {
  document.getElementById('summary').innerHTML = '<h2 class="fail">Test runner failed</h2>';
  document.getElementById('output').textContent = err.stack || err.message;
});
