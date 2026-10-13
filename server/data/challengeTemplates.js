/**
 * Challenge Templates for Personalized Recurring Mistake Interventions
 *
 * Short 10-30 second challenges targeting specific error patterns.
 * generateContextualChallenge() uses real run evidence (actual code, error
 * message, error line) to produce a challenge grounded in what the student
 * actually did wrong, rather than showing a random generic question.
 *
 * Priority order for challenge generation:
 *  1. Actual problematic code pattern (from the student's real run)
 *  2. Actual detected mistake category
 *  3. Generic category template as fallback
 */

// ---------------------------------------------------------------------------
// Helper — truncate code to ≤5 lines for the challenge snippet
// ---------------------------------------------------------------------------
function excerptCode(code = '', maxLines = 5) {
  if (!code) return '';
  const lines = code.trim().split('\n');
  return lines.slice(0, maxLines).join('\n');
}

// ---------------------------------------------------------------------------
// Context-aware challenge builder
//
// Receives real run evidence and mixes it with category-specific didactics.
// Returns a { challenge, quickCheck, concept, id, title, intro } object
// compatible with the existing InterventionModal UI.
// ---------------------------------------------------------------------------
function generateContextualChallenge(category, runContext = {}) {
  const { errorMessage = '', errorLine = null, code = '', passedTestCases = 0, totalTestCases = 0 } = runContext;

  const codeSnippet = excerptCode(code, 5);
  const hasCode = codeSnippet.trim().length > 0 && codeSnippet.trim().length < 400;
  const hasError = errorMessage.trim().length > 0 && errorMessage.trim().length < 500;

  // ----- IndexError / OFF_BY_ONE -----------------------------------------------
  if (category === 'IndexError') {
    const loopHint = hasCode && /range\s*\(\s*1/.test(codeSnippet)
      ? codeSnippet
      : 'for i in range(1, len(arr)):\n    print(arr[i])';

    return {
      id: 'INDEX_CTX',
      concept: 'Array/string boundary indexing',
      title: "🧠 Let's Fix This Pattern",
      intro: "You've run into index boundary issues in a few problems. Quick 20-second check:",
      challenge: {
        question: "What is wrong with starting a loop at index 1?",
        code: loopHint,
        options: [
          'A. It skips the first element at index 0',
          'B. The loop never terminates',
          'C. len() cannot be used inside range()',
          'D. Nothing is wrong',
        ],
        correctIndex: 0,
        explanation: "Correct! Python indices start at 0. range(1, ...) skips arr[0].",
        incorrectHint: "Almost! Python lists are 0-indexed, so arr[0] is the first element. Starting at 1 skips it.",
      },
      quickCheck: {
        question: "🎯 Quick Check: Which statement accesses the last element safely?",
        code: "arr = [10, 20, 30]",
        options: [
          'A. arr[len(arr) - 1]',
          'B. arr[len(arr)]',
          'C. arr[-0]',
          'D. arr[3]',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! arr[len(arr)-1] is the last valid index.",
        incorrectHint: "Almost! arr[len(arr)] is one past the last element and causes IndexError.",
      },
    };
  }

  if (category === 'OFF_BY_ONE') {
    return {
      id: 'OBO_CTX',
      concept: 'Loop boundary selection',
      title: "🧠 Let's Fix This Pattern",
      intro: "You've used an incorrect loop boundary in recent problems. Let's clarify it quickly:",
      challenge: {
        question: "Which range visits all indices of a list with 5 items?",
        code: "items = [10, 20, 30, 40, 50]",
        options: [
          'A. range(0, len(items))',
          'B. range(1, len(items) + 1)',
          'C. range(0, len(items) + 1)',
          'D. range(1, 5)',
        ],
        correctIndex: 0,
        explanation: "Correct! range(0, len(items)) gives indices 0–4 for a 5-item list.",
        incorrectHint: "Almost! range(a, b) excludes b. Valid indices are 0 to len-1, so range(0, len(items)) is correct.",
      },
      quickCheck: {
        question: "🎯 Quick Check: arr has 3 elements. What does range(len(arr)) produce?",
        code: "arr = ['a', 'b', 'c']",
        options: [
          'A. 0, 1, 2',
          'B. 1, 2, 3',
          'C. 0, 1, 2, 3',
          'D. 1, 2',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! range(3) yields 0, 1, 2.",
        incorrectHint: "Almost! range(3) starts at 0 and stops before 3.",
      },
    };
  }

  // ----- LogicError / WrongCondition -------------------------------------------
  if (category === 'LogicError') {
    // If we have code, try to surface a relevant snippet
    const conditionSnippet = hasCode && /if\s+.+[><=!]/.test(codeSnippet)
      ? codeSnippet
      : '# Goal: n > 0 AND n is divisible by 2';

    return {
      id: 'LOGIC_CTX',
      concept: 'Conditional logic evaluation',
      title: "🧠 Let's Fix This Pattern",
      intro: hasError
        ? `Your code produced wrong output. The expected result didn't match for ${totalTestCases - passedTestCases} test case(s). Let's spot the logic issue:`
        : "Your code's logic produced the wrong output in recent problems. Quick check:",
      challenge: {
        question: "Which condition checks that n is positive AND even?",
        code: conditionSnippet,
        options: [
          'A. n > 0 and n % 2 == 0',
          'B. n > 0 or n % 2 == 0',
          'C. n >= 0 and n / 2 == 0',
          'D. n > 0 and n % 2 == 1',
        ],
        correctIndex: 0,
        explanation: "Correct! Both conditions must hold — use `and`. `or` would pass negative even numbers.",
        incorrectHint: "Almost! `or` accepts numbers that satisfy either condition. You need `and` so BOTH must be true.",
      },
      quickCheck: {
        question: "🎯 Quick Check: Which checks x is between 10 and 20 inclusive?",
        code: "# Goal: 10 <= x <= 20",
        options: [
          'A. x >= 10 and x <= 20',
          'B. x >= 10 or x <= 20',
          'C. x == 10 and x == 20',
          'D. 10 < x < 20',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! Combine upper and lower bounds with `and`.",
        incorrectHint: "Almost! `or` would match almost any number. You need `and` for a range check.",
      },
    };
  }

  // ----- TypeError -------------------------------------------------------------
  if (category === 'TypeError') {
    const typeSnippet = hasCode && /\+\s*\d|\d\s*\+/.test(codeSnippet)
      ? codeSnippet
      : "age = '20'\ntotal = age + 5";

    return {
      id: 'TYPE_CTX',
      concept: 'Incompatible data type operations',
      title: "🧠 Let's Fix This Pattern",
      intro: hasError
        ? `A TypeError occurred in your code. ${errorMessage.slice(0, 120)}. Let's pin down the cause:`
        : "Type mismatches appeared in recent sessions. Let's review quickly:",
      challenge: {
        question: "What causes a TypeError when running this code?",
        code: typeSnippet,
        options: [
          "A. Adding a string and an integer directly",
          'B. Variable name "age" is reserved',
          'C. Python does not support the + operator',
          'D. Missing semicolon at end',
        ],
        correctIndex: 0,
        explanation: "Correct! Python can't add str '20' and int 5 directly. Use int(age) + 5.",
        incorrectHint: "Almost! '20' is a string. Python requires an explicit conversion: int(age) + 5.",
      },
      quickCheck: {
        question: "🎯 Quick Check: How do you print a number inside a sentence?",
        code: "score = 100",
        options: [
          'A. print("Score: " + str(score))',
          'B. print("Score: " + score)',
          'C. print("Score: " + int(score))',
          'D. print(Score + 100)',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! Convert numbers to strings with str() before concatenating.",
        incorrectHint: "Almost! You need str(score) to concatenate a number inside a string.",
      },
    };
  }

  // ----- NullError -------------------------------------------------------------
  if (category === 'NullError') {
    return {
      id: 'NULL_CTX',
      concept: 'Null / None value handling',
      title: "🧠 Let's Fix This Pattern",
      intro: "A None/null pointer error appeared in recent sessions. Let's review how to guard against it:",
      challenge: {
        question: "Why does res.upper() crash when res is None?",
        code: "res = None\nprint(res.upper())",
        options: [
          'A. None has no method named upper()',
          'B. upper() only works on numbers',
          'C. res must be declared global',
          'D. print() cannot accept uppercase',
        ],
        correctIndex: 0,
        explanation: "Correct! Calling string methods on None raises AttributeError. Check `if res is not None:` first.",
        incorrectHint: "Almost! NoneType has no attribute `upper`. Always check `if res is not None:` before calling methods.",
      },
      quickCheck: {
        question: "🎯 Quick Check: Which guard prevents calling a method on None?",
        code: "def process(val):\n    return val.strip()",
        options: [
          'A. if val is not None: return val.strip()',
          'B. if val == None: return val.strip()',
          'C. while val is None: return val.strip()',
          'D. if val != "": return val.strip()',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! `if val is not None:` prevents AttributeError on None.",
        incorrectHint: "Almost! Use `is not None` — not `== None`.",
      },
    };
  }

  // ----- SyntaxError -----------------------------------------------------------
  if (category === 'SyntaxError') {
    const errCtx = hasError ? errorMessage.slice(0, 150) : '';
    const syntaxSnippet = hasCode ? codeSnippet : "if x > 10\n    print('Greater')";

    return {
      id: 'SYNTAX_CTX',
      concept: 'Syntax structures and punctuation',
      title: "🧠 Let's Fix This Pattern",
      intro: errCtx
        ? `Your code had a syntax error: "${errCtx.split('\n')[0]}". Let's practice identifying this pattern:`
        : "Syntax errors appeared in recent problems. Quick 20-second review:",
      challenge: {
        question: "What syntax error is in this Python if statement?",
        code: syntaxSnippet,
        options: [
          'A. Missing colon (:) at end of if line',
          'B. Single quotes are not allowed',
          'C. print() must use capital P',
          'D. x > 10 must be in quotes',
        ],
        correctIndex: 0,
        explanation: "Correct! Python requires a colon after `if`, `for`, `while`, `def`, etc.",
        incorrectHint: "Almost! Python control statements need a colon at the end: `if x > 10:`.",
      },
      quickCheck: {
        question: "🎯 Quick Check: Which line correctly defines a function?",
        code: "",
        options: [
          'A. def my_func(a, b):',
          'B. function my_func(a, b)',
          'C. def my_func(a, b)',
          'D. define my_func(a, b):',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! `def name(args):` with trailing colon.",
        incorrectHint: "Almost! Python uses `def name():` with a colon at the end.",
      },
    };
  }

  // ----- CompilationError ------------------------------------------------------
  if (category === 'CompilationError') {
    return {
      id: 'COMP_CTX',
      concept: 'Compiler syntax and declaration rules',
      title: "🧠 Let's Fix This Pattern",
      intro: "A compilation error appeared in recent attempts. Let's nail this quickly:",
      challenge: {
        question: "Why does this C/Java snippet fail to compile?",
        code: "int total = 0;\ntotal = total + 5",
        options: [
          'A. Missing terminating semicolon (;) on line 2',
          'B. Variable total cannot be modified',
          'C. int cannot hold value 0',
          'D. Missing quotes around 5',
        ],
        correctIndex: 0,
        explanation: "Correct! Every statement in Java/C must end with a semicolon `;`.",
        incorrectHint: "Almost! Statements in compiled languages must end with `;`.",
      },
      quickCheck: {
        question: "🎯 Quick Check: Which correctly declares an integer in Java/C?",
        code: "",
        options: [
          'A. int count = 10;',
          'B. count = 10',
          'C. integer count = 10',
          'D. var count = 10',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! Specify the type and end with `;`.",
        incorrectHint: "Almost! Use `int` type and `;` at the end.",
      },
    };
  }

  // ----- TimeLimitExceeded -----------------------------------------------------
  if (category === 'TimeLimitExceeded') {
    return {
      id: 'TLE_CTX',
      concept: 'Loop termination and progression',
      title: "🧠 Let's Fix This Pattern",
      intro: "A time limit / infinite loop issue appeared in recent sessions. Let's check loop updates:",
      challenge: {
        question: "Why does this while loop run forever?",
        code: "count = 0\nwhile count < 5:\n    print(count)",
        options: [
          'A. `count` is never incremented inside the loop',
          'B. The while condition cannot compare integers',
          'C. count should start at 1',
          'D. print() causes infinite loops',
        ],
        correctIndex: 0,
        explanation: "Correct! `count` stays 0 forever — add `count += 1` inside the loop.",
        incorrectHint: "Almost! The condition stays True forever unless `count` is updated inside the loop.",
      },
      quickCheck: {
        question: "🎯 Quick Check: What ensures this while loop terminates after 3 iterations?",
        code: "i = 0\nwhile i < 3:\n    process(i)\n    # What goes here?",
        options: [
          'A. i += 1',
          'B. i = 0',
          'C. break = True',
          'D. i -= 1',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! `i += 1` moves i toward 3 so the loop exits.",
        incorrectHint: "Almost! You need `i += 1` to eventually make `i < 3` false.",
      },
    };
  }

  // ----- RuntimeError ----------------------------------------------------------
  if (category === 'RuntimeError') {
    return {
      id: 'RUNTIME_CTX',
      concept: 'Runtime crash prevention',
      title: "🧠 Let's Fix This Pattern",
      intro: hasError
        ? `Your code crashed at runtime: "${errorMessage.slice(0, 100)}". Let's understand why:`
        : "A runtime crash appeared in recent problems. Quick check:",
      challenge: {
        question: "What causes a ZeroDivisionError in Python?",
        code: "def avg(nums):\n    return sum(nums) / len(nums)",
        options: [
          'A. Calling avg([]) when the list is empty — len([]) is 0',
          'B. sum() returns a float instead of int',
          'C. len() cannot be applied to a list',
          'D. Division always fails in Python',
        ],
        correctIndex: 0,
        explanation: "Correct! Dividing by 0 (empty list → len = 0) raises ZeroDivisionError. Guard: if not nums: return 0.",
        incorrectHint: "Almost! When nums is empty, len(nums) is 0, causing division by zero. Check the length first.",
      },
      quickCheck: {
        question: "🎯 Quick Check: Which guard prevents ZeroDivisionError?",
        code: "def avg(nums):\n    # Safe version?",
        options: [
          'A. if not nums: return 0',
          'B. if nums > 0: return 0',
          'C. while len(nums) < 0: return 0',
          'D. if sum(nums) == 0: return 0',
        ],
        correctIndex: 0,
        explanation: "🎯 Pattern practiced! `if not nums:` safely handles the empty list case.",
        incorrectHint: "Almost! `if not nums:` checks for an empty list before dividing.",
      },
    };
  }

  // ----- Generic Fallback -------------------------------------------------------
  return {
    id: 'GENERIC_CTX',
    concept: 'General code accuracy',
    title: "🧠 Let's Fix This Pattern",
    intro: "This error pattern appeared across a few of your sessions. Let me help you recognize it:",
    challenge: {
      question: "Which habit best prevents repeating the same coding mistake?",
      code: "",
      options: [
        'A. Test manually with sample inputs before running',
        'B. Copy and paste code without reading errors',
        'C. Ignore boundary test cases like 0 or empty lists',
        'D. Change random lines until it passes',
      ],
      correctIndex: 0,
      explanation: "Correct! Tracing inputs before running helps catch boundary and logic issues early.",
      incorrectHint: "Almost! Manually tracing your code against simple inputs reveals most common bugs.",
    },
    quickCheck: {
      question: "🎯 Quick Check: A test fails. What should you check FIRST?",
      code: "",
      options: [
        'A. Compare expected output vs actual output to find the discrepancy',
        'B. Delete all the code and start over',
        'C. Assume the judge is broken',
        'D. Reread the problem statement from scratch',
      ],
      correctIndex: 0,
      explanation: "🎯 Pattern practiced! Expected vs actual output comparison is always the first step.",
      incorrectHint: "Almost! Comparing expected vs actual output highlights where the logic went wrong.",
    },
  };
}

// ---------------------------------------------------------------------------
// Kept for backward-compat in the existing analytics/history endpoints
// ---------------------------------------------------------------------------
const challengeTemplates = {};

function getChallengeTemplate(errorCategory, runContext = {}) {
  return generateContextualChallenge(errorCategory, runContext);
}

module.exports = { challengeTemplates, getChallengeTemplate, generateContextualChallenge };
