/**
 * Error Classifier
 *
 * Analyzes raw error output and execution status to assign
 * one specific, accurate error category to a submission.
 *
 * ORDER IS IMPORTANT — patterns are checked most-specific first
 * to avoid misclassification (e.g. a generic "error:" match must
 * not override a specific NullPointerException match).
 *
 * Supported categories:
 *   - TimeLimitExceeded   (actual TLE from Judge0 status)
 *   - SyntaxError         (compiler/parser syntax errors)
 *   - CompilationError    (Java/C/C++ compile failures)
 *   - TypeError           (type mismatch, incompatible types)
 *   - IndexError          (array/string out of bounds)
 *   - NullError           (null/none pointer errors)
 *   - RuntimeError        (stack overflow, divide by zero, etc.)
 *   - LogicError          (wrong output, no other evidence of crash)
 *   - UnknownError        (status=failed but no useful evidence)
 */

// --- Pattern groups, ordered most-specific to least-specific ---
const CLASSIFIED_PATTERNS = [
  {
    errorType: 'SyntaxError',
    patterns: [
      /SyntaxError/i,
      /IndentationError/i,
      /TabError/i,
      /invalid syntax/i,
      /unexpected EOF/i,
      /unexpected indent/i,
      /unindent does not match/i,
      /expected an indented block/i,
      /illegal start of expression/i,
      /illegal start of type/i,
      /unclosed string literal/i,
      /error: ';' expected/i,
      /error: ',' expected/i,
      /error: illegal start/i,
      /unexpected token/i,
      /ParseError/i,
    ],
  },
  {
    errorType: 'CompilationError',
    // Only emit for compiled languages (java, c, cpp) — not python
    compiledOnly: true,
    patterns: [
      /cannot find symbol/i,
      /package .* does not exist/i,
      /error: .* is not applicable/i,
      /compilation failed/i,
      /undefined reference to/i,
      /ld returned 1 exit status/i,
      /note: .* errors?/i,
      /warning: .* error/i,
    ],
  },
  {
    errorType: 'TypeError',
    patterns: [
      /TypeError/i,
      /cannot invoke .* on null/i,
      /incompatible types/i,
      /type mismatch/i,
      /no suitable method/i,
      /method .* cannot be applied/i,
      /unsupported operand type/i,
      /cannot convert/i,
    ],
  },
  {
    errorType: 'IndexError',
    patterns: [
      /IndexError/i,
      /index out of /i,
      /list index out of range/i,
      /ArrayIndexOutOfBoundsException/i,
      /StringIndexOutOfBoundsException/i,
      /IndexOutOfBoundsException/i,
    ],
  },
  {
    errorType: 'NullError',
    patterns: [
      /NullPointerException/i,
      /AttributeError.*NoneType/i,
      /null pointer/i,
      /object reference not set/i,
      /dereferencing null/i,
    ],
  },
  {
    errorType: 'RuntimeError',
    patterns: [
      /RuntimeError/i,
      /StackOverflowError/i,
      /RecursionError/i,
      /maximum recursion depth/i,
      /ZeroDivisionError/i,
      /division by zero/i,
      /ArithmeticException/i,
      /ClassCastException/i,
      /SIGSEGV/i,
      /segmentation fault/i,
      /Killed/i,
    ],
  },
];

/**
 * Classifies the error from stderr/stdout output and execution status.
 *
 * @param {string} stderr - Standard error output
 * @param {string} stdout - Standard output from student's code
 * @param {string} language - 'python' | 'java' | 'c' | 'cpp'
 * @param {string} status   - 'passed' | 'failed' | 'timeout' | 'unavailable'
 * @param {string} [statusDescription] - Raw Judge0 status description string
 * @returns {{ errorType: string, errorLine: number|null }}
 */
function classifyError(stderr = '', stdout = '', language = 'python', status = 'failed', statusDescription = '') {
  // --- 1. Easy exits ---
  if (status === 'passed') {
    return { errorType: 'None', errorLine: null };
  }

  if (status === 'unavailable') {
    return { errorType: 'Execution Service Unavailable', errorLine: null };
  }

  // --- 2. True Time Limit Exceeded — only from explicit Judge0 TLE status ---
  // Judge0 status IDs: 5 = Time Limit Exceeded, description = "Time Limit Exceeded"
  // We match on the explicit statusDescription string, NOT on stderr content.
  if (
    status === 'timeout' ||
    /Time Limit Exceeded/i.test(statusDescription)
  ) {
    return { errorType: 'TimeLimitExceeded', errorLine: null };
  }

  // --- 3. Pattern-based classification from stderr (and optionally stdout) ---
  // Only use stderr for pattern matching to avoid false positives from student output.
  // For compile errors (Java/C/C++), also include compileOutput.
  const normLang = (language || '').toLowerCase().trim();
  const isPython = normLang === 'python';
  const isCompiled = normLang === 'java' || normLang === 'c' || normLang === 'cpp' || normLang === 'c++';

  // Use stderr only — do NOT include stdout (student's printed output) in pattern matching
  const errorText = stderr || '';

  for (const group of CLASSIFIED_PATTERNS) {
    // Skip CompilationError group for Python
    if (group.compiledOnly && !isCompiled) continue;

    if (group.patterns.some((p) => p.test(errorText))) {
      const errorLine = extractLineNumber(errorText, normLang);
      return { errorType: group.errorType, errorLine };
    }
  }

  // --- 4. If execution failed but stderr is empty or unhelpful ---
  // Distinguish by whether there is any stderr/compile output
  if (status === 'failed') {
    if (errorText.trim().length > 0) {
      // Has stderr but matched nothing specific above — still a runtime or unknown issue
      return { errorType: 'RuntimeError', errorLine: extractLineNumber(errorText, normLang) };
    }
    // No stderr — code ran but produced wrong output (wrong answer / logic error)
    return { errorType: 'LogicError', errorLine: null };
  }

  return { errorType: 'UnknownError', errorLine: null };
}

/**
 * Extracts line number from error output if present.
 */
function extractLineNumber(output, language) {
  if (!output) return null;

  if (language === 'python') {
    const match = output.match(/line (\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  // Java/C/C++: commonly "file.java:23: error:"
  const match = output.match(/:(\d+):/);
  return match ? parseInt(match[1], 10) : null;
}

module.exports = { classifyError };
