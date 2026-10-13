/**
 * Code Execution Service
 * 
 * Executes student code in a sandboxed way using the Judge0 API.
 * Supports Python, Java, C, and C++.
 * Builds language-specific wrappers so function-based solutions are tested
 * against each test case independently without running hardcoded top-level inputs.
 */

const LANGUAGE_IDS = {
  python: 71,  // Python 3.8.1
  java: 62,    // Java (OpenJDK 13)
  c: 50,       // C (GCC 9.2.0)
  cpp: 54,     // C++ (GCC 9.2.0)
  'c++': 54,
};

const RAPID_API_URL = 'https://judge0-ce.p.rapidapi.com';
const PUBLIC_API_URL = 'https://ce.judge0.com';

function getJudge0Config() {
  const provider = process.env.JUDGE0_PROVIDER || (process.env.JUDGE0_API_KEY ? 'rapidapi' : 'public');
  const apiKey = process.env.JUDGE0_API_KEY;

  if (provider === 'rapidapi' && apiKey) {
    return {
      baseUrl: RAPID_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': apiKey,
      }
    };
  }
  
  return {
    baseUrl: PUBLIC_API_URL,
    headers: {
      'Content-Type': 'application/json',
    }
  };
}

/**
 * Builds a language-specific wrapper around student code for a specific test case.
 */
function buildWrappedCode({ language, code, input }) {
  const normLang = (language || '').toLowerCase().trim();

  if (normLang === 'python') {
    return `import sys
import io
import json
import ast

old_stdout = sys.stdout
sys.stdout = io.StringIO()

student_code = """${code.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')}\"""

global_ns = {}
try:
    exec(student_code, global_ns)
except Exception as e:
    sys.stdout = old_stdout
    raise e

sys.stdout = old_stdout

target_func = None
func_names = [name for name, val in global_ns.items() if callable(val) and not name.startswith('__')]
if func_names:
    target_func = global_ns[func_names[-1]]

if target_func:
    raw_inputs = """${input.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')}\""".strip().split('\\n')
    args = []
    for raw in raw_inputs:
        raw = raw.strip()
        if not raw:
            continue
        try:
            val = json.loads(raw)
        except Exception:
            try:
                val = ast.literal_eval(raw)
            except Exception:
                val = raw
        if isinstance(val, tuple):
            args.extend(val)
        else:
            args.append(val)
    
    res = target_func(*args)
    if res is None and len(args) > 0 and isinstance(args[0], list):
        print(args[0])
    else:
        if isinstance(res, bool):
            print(res)
        elif isinstance(res, (list, dict)):
            print(res)
        else:
            print(res)
`;
  }

  if (normLang === 'java') {
    const mainRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w*\s*\)\s*\{[\s\S]*?\n\s*\}/;
    const hasMain = mainRegex.test(code);
    
    const runnerMain = `
    public static void main(String[] args) {
        try {
            java.util.Scanner sc = new java.util.Scanner(System.in);
            java.lang.reflect.Method target = null;
            for (java.lang.reflect.Method m : Main.class.getDeclaredMethods()) {
                if (!m.getName().equals("main") && java.lang.reflect.Modifier.isStatic(m.getModifiers())) {
                    target = m;
                    break;
                }
            }
            if (target == null) return;
            Class<?>[] paramTypes = target.getParameterTypes();
            Object[] params = new Object[paramTypes.length];
            for (int i = 0; i < paramTypes.length; i++) {
                if (!sc.hasNextLine()) break;
                String line = sc.nextLine().trim();
                Class<?> p = paramTypes[i];
                if (p == int[].class) {
                    line = line.replace("[", "").replace("]", "").trim();
                    if (line.isEmpty()) { params[i] = new int[0]; }
                    else {
                        String[] parts = line.split(",");
                        int[] arr = new int[parts.length];
                        for (int j = 0; j < parts.length; j++) arr[j] = Integer.parseInt(parts[j].trim());
                        params[i] = arr;
                    }
                } else if (p == char[].class) {
                    line = line.replace("[", "").replace("]", "").replace("'", "").trim();
                    if (line.isEmpty()) { params[i] = new char[0]; }
                    else {
                        String[] parts = line.split(",");
                        char[] arr = new char[parts.length];
                        for (int j = 0; j < parts.length; j++) arr[j] = parts[j].trim().charAt(0);
                        params[i] = arr;
                    }
                } else if (p == String[].class) {
                    line = line.replace("[", "").replace("]", "").replace("'", "").replace("\\"", "").trim();
                    if (line.isEmpty()) { params[i] = new String[0]; }
                    else {
                        String[] parts = line.split(",");
                        String[] arr = new String[parts.length];
                        for (int j = 0; j < parts.length; j++) arr[j] = parts[j].trim();
                        params[i] = arr;
                    }
                } else if (p == int.class || p == Integer.class) {
                    params[i] = Integer.parseInt(line);
                } else if (p == String.class) {
                    params[i] = line.replace("\\"", "").replace("'", "").trim();
                } else if (p == boolean.class || p == Boolean.class) {
                    params[i] = Boolean.parseBoolean(line);
                }
            }
            Object result = target.invoke(null, params);
            if (target.getReturnType() == void.class && params.length > 0) {
                Object first = params[0];
                if (first instanceof char[]) System.out.println(java.util.Arrays.toString((char[]) first));
                else if (first instanceof int[]) System.out.println(java.util.Arrays.toString((int[]) first));
                else System.out.println(first);
            } else if (result instanceof int[]) {
                System.out.println(java.util.Arrays.toString((int[]) result));
            } else if (result instanceof String[]) {
                System.out.println(java.util.Arrays.toString((String[]) result));
            } else if (result instanceof Boolean) {
                String s = result.toString();
                System.out.println(Character.toUpperCase(s.charAt(0)) + s.substring(1));
            } else {
                System.out.println(result);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }`;

    if (hasMain) {
      return code.replace(mainRegex, runnerMain);
    } else {
      const lastBrace = code.lastIndexOf('}');
      if (lastBrace !== -1) {
        return code.slice(0, lastBrace) + runnerMain + '\n}';
      }
      return code + runnerMain;
    }
  }

  return code;
}

async function executeCode({ language, code, testCases }) {
  const normLang = (language || '').toLowerCase().trim();
  const languageId = LANGUAGE_IDS[normLang];

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const config = getJudge0Config();

  const results = [];
  let allPassed = true;
  let firstError = null;
  let isUnavailable = false;

  for (const testCase of testCases) {
    const codeToRun = buildWrappedCode({ language: normLang, code, input: testCase.input });
    const result = await runSingleTestCase({
      languageId,
      code: codeToRun,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      config,
    });

    if (result.statusDescription === 'Execution Service Unavailable') {
      isUnavailable = true;
      firstError = result;
      break;
    }

    results.push({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: (result.stdout || '').trim(),
      passed: result.passed,
      isHidden: testCase.isHidden || false,
    });

    if (!result.passed) {
      allPassed = false;
      if (!firstError) {
        firstError = {
          stderr: result.stderr || result.compileOutput || '',
          stdout: result.stdout || '',
          compileOutput: result.compileOutput || '',
          executionTimeMs: result.executionTimeMs || null,
          statusDescription: result.statusDescription || '',
          statusId: result.statusId || null,
        };
      }
    }
  }

  if (isUnavailable) {
    return {
      status: 'unavailable',
      passedTestCases: 0,
      totalTestCases: testCases.length,
      testResults: [],
      stderr: firstError?.stderr || 'Execution Service Unavailable',
      stdout: '',
      executionTimeMs: null,
    };
  }

  const passedCount = results.filter((r) => r.passed).length;

  // Only mark as 'timeout' if Judge0 returned actual TLE status (ID 5 = TLE)
  // Network timeouts or aborts are still 'failed' — they don't mean user's code looped
  const isTLE = firstError?.statusId === 5 ||
    firstError?.statusDescription === 'Time Limit Exceeded';

  return {
    status: allPassed ? 'passed' : isTLE ? 'timeout' : 'failed',
    passedTestCases: passedCount,
    totalTestCases: testCases.length,
    testResults: results,
    stderr: firstError?.stderr || firstError?.compileOutput || '',
    stdout: results.map((r) => r.actualOutput).join('\n'),
    executionTimeMs: firstError?.executionTimeMs || null,
    statusDescription: firstError?.statusDescription || '',
  };
}

async function runSingleTestCase({ languageId, code, input, expectedOutput, config }) {
  try {
    const submitRes = await fetch(`${config.baseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: input,
        cpu_time_limit: 5,
        memory_limit: 128000,
      }),
    });

    if (!submitRes.ok) {
      if (submitRes.status === 401 || submitRes.status === 403) {
        return {
          passed: false,
          statusDescription: 'Execution Service Unavailable',
          stderr: 'Code execution failed: Invalid Judge0 API Key or Rate Limit Exceeded.',
          stdout: '',
          compileOutput: '',
          executionTimeMs: null,
        };
      }
      if (submitRes.status === 429) {
        return {
          passed: false,
          statusDescription: 'Execution Service Unavailable',
          stderr: 'Code execution failed: Too many requests (Rate Limit Exceeded). Please try again later.',
          stdout: '',
          compileOutput: '',
          executionTimeMs: null,
        };
      }
      throw new Error(`Judge0 submission failed: ${submitRes.status}`);
    }

    const submission = await submitRes.json();

    const actualOutput = (submission.stdout || '').trim();
    const expected = (expectedOutput || '').trim();

    const normalize = (str) => str.replace(/\s+/g, '').toLowerCase();
    const passed = (actualOutput === expected || normalize(actualOutput) === normalize(expected)) && submission.status?.id === 3;

    return {
      passed,
      stdout: submission.stdout || '',
      stderr: submission.stderr || submission.compile_output || '',
      compileOutput: submission.compile_output || '',
      executionTimeMs: submission.time ? Math.round(parseFloat(submission.time) * 1000) : null,
      statusDescription: submission.status?.description || 'Accepted',
      statusId: submission.status?.id || null,
    };
  } catch (error) {
    return {
      passed: false,
      statusDescription: 'Execution Service Unavailable',
      stderr: `Code execution failed: Network error linking to execution provider (${error.message}).`,
      stdout: '',
      compileOutput: '',
      executionTimeMs: null,
    };
  }
}

module.exports = { executeCode };
