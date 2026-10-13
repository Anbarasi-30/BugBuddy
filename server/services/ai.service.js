/**
 * AI Mentor Service
 * 
 * Communicates with the AI API (Google Gemini) to generate
 * beginner-friendly progressive hints and error explanations.
 * 
 * IMPORTANT: The API key is NEVER exposed to the client.
 * All AI calls happen server-side only.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const CANDIDATE_MODELS = [
  process.env.AI_MODEL,
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
].filter(Boolean);

const HINT_LEVEL_INSTRUCTIONS = {
  1: `LEVEL 1 — GENTLE CLUE:
- Ask a friendly guiding question or point toward the relevant concept.
- Do NOT reveal the complete solution or full code.
- Use simple, plain English that a beginner can easily grasp.
- Keep it to 2-3 short, clear sentences.
Format with section:
### 💡 Gentle Clue
[Guiding question or conceptual pointer]`,

  2: `LEVEL 2 — EXPLAIN THE NEXT STEP:
- Explain the specific operation or concept the student needs to use next.
- Include a tiny illustrative example (1-2 lines of simple pseudo or snippet).
- Clearly explain WHY that step helps solve the problem.
Format with sections:
### 🧭 Next Step
[Clear explanation of the next operation]
### 🔍 Quick Example
[Tiny illustrative example]
### 🎯 Why This Helps
[1-2 sentences on why this step brings them closer to the answer]`,

  3: `LEVEL 3 — TARGETED CORRECTION:
- Identify the relevant line, loop, or operation where the issue occurs when possible.
- Explain specifically what is wrong and how to correct it.
- Provide a small targeted snippet showing just the corrected operation (NOT the entire solution file).
Format with sections:
### 🛠️ Targeted Correction
[Identification of the issue and how to correct it]
### 📝 Corrected Snippet
\`\`\`[language]
[Small corrected code snippet]
\`\`\`
### ⚠️ Key Takeaway
[1-2 sentences summarizing how to avoid this mistake in the future]`,
};

/**
 * Intelligent Fallback Generator for when AI API is unavailable or rate limited.
 * Ensures the student always gets structured, educational help.
 */
function getFallbackHint({ level, problemTitle, language, errorType, failedTestCase }) {
  const err = errorType || 'General';
  if (level === 1) {
    if (err === 'IndexError') {
      return `### 💡 Gentle Clue\nAre you checking the bounds of your collection? In ${language}, indices start at 0 and end at length - 1. Think about where your loop stops.`;
    }
    if (err === 'TypeError') {
      return `### 💡 Gentle Clue\nWhat data types are you combining? In ${language}, make sure variables are converted to the expected type before operations or return.`;
    }
    if (err === 'LogicError' || err === 'Wrong Answer') {
      return `### 💡 Gentle Clue\nYour program ran, but the answer didn't match the test case. Consider tracing through with an example: what should happen on the very first iteration?`;
    }
    if (err === 'SyntaxError' || err === 'CompilationError') {
      return `### 💡 Gentle Clue\nLook closely at your syntax near the flagged line. Are all parentheses, braces, or colons balanced and in place?`;
    }
    return `### 💡 Gentle Clue\nBreak the problem "${problemTitle}" down into smaller steps. What is the very first piece of data you need to inspect?`;
  }

  if (level === 2) {
    if (err === 'IndexError') {
      return `### 🧭 Next Step\nCheck your loop condition. If your array has size N, the last valid index is N - 1.\n\n### 🔍 Quick Example\n\`for (int i = 0; i < n; i++)\` instead of \`<= n\`\n\n### 🎯 Why This Helps\nThis prevents accessing elements beyond memory boundaries.`;
    }
    if (err === 'LogicError' || err === 'Wrong Answer') {
      const tc = failedTestCase ? `for input \`${failedTestCase.input}\`` : 'for the test input';
      return `### 🧭 Next Step\nTrace the value of your variables step-by-step ${tc}. Check if your return value updates on every step or only at the end.\n\n### 🔍 Quick Example\nPrint intermediate values before returning to see where the value diverges from expected.\n\n### 🎯 Why This Helps\nYou will immediately spot which iteration produced the unexpected result.`;
    }
    return `### 🧭 Next Step\nFocus on the core transformation needed for "${problemTitle}". Identify which variable should store the running result.\n\n### 🔍 Quick Example\nInitialize your accumulator variable before starting the loop.\n\n### 🎯 Why This Helps\nKeeping track of state across loop iterations is key to this problem.`;
  }

  // Level 3
  if (err === 'IndexError') {
    return `### 🛠️ Targeted Correction\nEnsure your index checks verify \`index < length\` before accessing elements.\n\n### 📝 Corrected Snippet\n\`\`\`${language}\n# Ensure loop bounds stop before len(arr)\nfor i in range(len(arr)):\n    # access arr[i] safely\n\`\`\`\n\n### ⚠️ Key Takeaway\nAlways check collection boundaries before indexing.`;
  }
  return `### 🛠️ Targeted Correction\nReview your return statement and condition checks to make sure the expected output format matches the requirements.\n\n### 📝 Corrected Snippet\n\`\`\`${language}\n# Verify return statement matches expected format\nreturn result\n\`\`\`\n\n### ⚠️ Key Takeaway\nTest with the smallest possible input to confirm the base logic before scaling up.`;
}

function getFallbackExplanation({ errorType, errorMessage, errorLine, language }) {
  const err = errorType || 'Runtime Issue';
  return `### What Went Wrong
Your code encountered a ${err} during execution. ${errorMessage ? `The system reported: "${errorMessage}".` : 'The program stopped before completing all test cases.'}

### Why It Happened
${errorLine ? `Around line ${errorLine}, ` : ''}an operation was attempted that the ${language} runtime could not complete safely. Common causes include uninitialized variables, out-of-range indexing, or syntax mismatches.

### How to Fix It
1. Inspect the highlighted line and check variable types and loop boundaries.
2. Add a print/log statement right before the error line to inspect the variables.
3. Test your code with the "Run" button to see if the error is resolved.`;
}

/**
 * Calls the AI to generate a hint for the student.
 * 
 * @param {object} params
 * @param {string} params.problemTitle - Problem title
 * @param {string} params.problemDescription - Full problem description
 * @param {string} params.submittedCode - Student's code
 * @param {string} params.language - 'python' | 'java' | 'c' | 'cpp'
 * @param {string} params.errorType - Classified error type
 * @param {string} params.errorMessage - Raw error output
 * @param {number} params.errorLine - Line number (or null)
 * @param {number} params.hintLevel - 1-4
 * @param {object} [params.failedTestCase] - { input, expectedOutput, actualOutput }
 * @param {string[]} [params.recurringErrors] - Recurring errors
 * @param {boolean} [params.isUnavailable] - Execution service status
 * @returns {Promise<string>} The generated hint text
 */
async function generateHint({
  problemTitle,
  problemDescription,
  submittedCode,
  language,
  errorType,
  errorMessage,
  errorLine,
  hintLevel,
  failedTestCase,
  recurringErrors = [],
  isUnavailable = false,
}) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.warn('[AI Service] No AI_API_KEY configured, using structured pedagogical fallback.');
    return getFallbackHint({ level: hintLevel, problemTitle, language, errorType, failedTestCase });
  }

  const recurringContext = recurringErrors.length > 0
    ? `\n\nPersonalization note: This student previously had trouble with ${recurringErrors.join(', ')}. Keep hints focused on these patterns.`
    : '';

  let failedTestContext = '';
  if (failedTestCase) {
    failedTestContext = `
FAILED TEST EVIDENCE:
Input: ${failedTestCase.input}
Expected Output: ${failedTestCase.expectedOutput}
Actual Output Received: ${failedTestCase.actualOutput}
`;
  }

  let prompt;
  if (isUnavailable) {
    prompt = `You are BugBuddy, a friendly coding mentor helping a beginner learn programming.

Code execution is currently unavailable, so perform a simple Code Review.

PROBLEM: ${problemTitle}
DESCRIPTION: ${problemDescription}

STUDENT CODE (${language}):
\`\`\`${language}
${submittedCode}
\`\`\`

IMPORTANT RULES:
- Start your response with: "Code Review — Not Verified by Execution"
- Explain possible code mistakes in simple English.
- Do NOT use complex technical jargon.
- Keep explanation under 4 sentences.`;
  } else {
    prompt = `You are BugBuddy, a patient, friendly coding mentor teaching a student who is learning programming for the first time.

PROBLEM: ${problemTitle}
DESCRIPTION: ${problemDescription}

STUDENT CODE (${language}):
\`\`\`${language}
${submittedCode}
\`\`\`

ERROR TYPE: ${errorType}
ERROR MESSAGE: ${errorMessage || 'No compiler message'}
${errorLine ? `APPROXIMATE LINE: Line ${errorLine}` : ''}
${failedTestContext}
${recurringContext}

HINT LEVEL: ${hintLevel}
LEVEL INSTRUCTIONS:
${HINT_LEVEL_INSTRUCTIONS[hintLevel] || HINT_LEVEL_INSTRUCTIONS[1]}

TONE & STYLE GUIDELINES:
- Use simple, friendly English as if talking to a beginner.
- Avoid complicated jargon (e.g. avoid 'invariant', 'initialization strategy', 'algorithmic complexity').
- Ground your hint on the student's actual code and failed input evidence.
- Respond ONLY with the formatted hint text.`;
  }

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 512,
    },
  };

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(
        `${GEMINI_API_URL}/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const hintText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (hintText) {
          return hintText.trim();
        }
      } else {
        const errText = await response.text();
        lastError = new Error(`AI API error (${response.status}) on model ${modelName}: ${errText}`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
    }
  }

  console.warn('[AI Service] Candidate models exhausted, using fallback hint:', lastError?.message);
  return getFallbackHint({ level: hintLevel, problemTitle, language, errorType, failedTestCase });
}

async function generateFocusRecommendation({ userName, topErrors, weakTopics }) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || (topErrors.length === 0 && weakTopics.length === 0)) {
    return null;
  }

  const prompt = `You are BugBuddy. Generate a short, friendly 1-2 sentence recommendation for a student learning programming.

Student name: ${userName}
Errors: ${topErrors.join(', ') || 'none'}
Weak Topics: ${weakTopics.join(', ') || 'none'}

Keep it simple, friendly, and encouraging. Respond only with the recommendation.`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 128 },
  };

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `${GEMINI_API_URL}/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch {
      continue;
    }
  }

  return null;
}

async function generatePracticeRecommendation({ errorType, problemTitle, problemTags, problemDifficulty }) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are BugBuddy. Write a single friendly sentence (max 25 words) explaining why a student who struggles with ${errorType} errors should practice the "${problemTitle}" problem (tags: ${(problemTags || []).join(', ')}, difficulty: ${problemDifficulty}). Keep it encouraging and specific. Respond with only the sentence.`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 80 },
  };

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `${GEMINI_API_URL}/${modelName}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody), signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function explainError({
  problemTitle,
  problemDescription,
  submittedCode,
  language,
  errorType,
  errorMessage,
  errorLine,
  failedTestCase,
  testResults = [],
}) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.warn('[AI Service] No AI_API_KEY configured, using structured fallback explanation.');
    return getFallbackExplanation({ errorType, errorMessage, errorLine, language });
  }

  let failedTestContext = '';
  if (failedTestCase) {
    failedTestContext = `
FAILED TEST EVIDENCE:
Input: ${failedTestCase.input}
Expected Output: ${failedTestCase.expectedOutput}
Actual Output Received: ${failedTestCase.actualOutput}
`;
  } else if (testResults && testResults.length > 0) {
    const failed = testResults.find((t) => !t.passed);
    if (failed) {
      failedTestContext = `
FAILED TEST EVIDENCE:
Input: ${failed.input}
Expected Output: ${failed.expectedOutput}
Actual Output Received: ${failed.actualOutput}
`;
    }
  }

  const prompt = `You are BugBuddy, an expert, encouraging coding mentor helping a beginner learn programming.
The student ran into a specific execution or submission error while solving "${problemTitle}".

PROBLEM: ${problemTitle}
DESCRIPTION: ${problemDescription}

STUDENT CODE (${language}):
\`\`\`${language}
${submittedCode}
\`\`\`

EXPLICIT ERROR DETAILS:
- Error Type: ${errorType}
- Error Message: ${errorMessage || 'No compiler/runtime message'}
${errorLine ? `- Approximate Line: Line ${errorLine}` : ''}
${failedTestContext}

EXPLANATION INSTRUCTIONS:
Provide a clear, beginner-friendly explanation focusing directly on the student's actual error and code shown above.
Do NOT give generic clues or hints. Explain what happened, why it happened, and how to fix it.
Format your response using these exact section headings:
### What Went Wrong
[Clear explanation of the error in plain English]
### Why It Happened
[Specific cause in their code or logic]
### How to Fix It
[Actionable step-by-step guidance on how to fix the error]`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 600,
    },
  };

  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(
        `${GEMINI_API_URL}/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text.trim();
        }
      } else {
        const errText = await response.text();
        lastError = new Error(`AI API error (${response.status}) on model ${modelName}: ${errText}`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
    }
  }

  console.warn('[AI Service] Candidate models exhausted, using fallback error explanation:', lastError?.message);
  return getFallbackExplanation({ errorType, errorMessage, errorLine, language });
}

module.exports = {
  generateHint,
  explainError,
  generateFocusRecommendation,
  generatePracticeRecommendation,
};


