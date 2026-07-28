import { buildSummary } from '../js/engines/summaryEngine.js';

const tests = [];

function assertEqual(actual, expected, message) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  tests.push({ pass, message, actual, expected });
}

function run() {
  const cases = [
    {
      name: '正常系 入力あり',
      input: {
        dispatch: {
          age: '68',
          sex: '男性',
          chiefComplaint: '胸痛',
          patientName: '山田太郎'
        },
        answers: {},
        redFlags: [
          { id: 'sudden_onset', label: '突然発症' },
          { id: 'consciousness_impairment', label: '意識障害' }
        ],
        urgency: { label: '最優先' }
      },
      expected: {
        handover: '68歳男性。 胸痛。 突然発症、意識障害を伴います。 最優先の緊急度です。',
        patient: {
          age: 68,
          sex: '男性'
        }
      }
    },
    {
      name: '異常系 JSON未読込的な空入力',
      input: {
        dispatch: null,
        answers: null,
        redFlags: null,
        urgency: null
      },
      expected: {
        handover: '年齢不明。 胸痛。',
        patient: {
          age: null,
          sex: '不明'
        }
      }
    },
    {
      name: '異常系 不正な年齢',
      input: {
        dispatch: { age: 'abc', sex: '女性', chiefComplaint: '' },
        answers: {},
        redFlags: [],
        urgency: { label: '低' }
      },
      expected: {
        handover: '年齢不明。 女性。 胸痛。 低の緊急度です。',
        patient: {
          age: null,
          sex: '女性'
        }
      }
    }
  ];

  for (const testCase of cases) {
    const actual = buildSummary(testCase.input.dispatch, testCase.input.answers, testCase.input.redFlags, testCase.input.urgency);
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
