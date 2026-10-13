/**
 * outputRushData.js
 * 
 * 102 distinct, verified code-tracing questions across Python and Java for Output Rush 2.0.
 * Covers operator precedence, slicing, recursion, collections, references, and type coercion.
 */

const PYTHON_OUTPUT_QUESTIONS = [
  // 1 - 10: Basic Variables, Arithmetic & Slicing
  {
    id: 'or_py_1', language: 'python', difficulty: 'easy',
    snippet: ['a = [1, 2, 3]', 'b = a', 'b.append(4)', 'print(len(a))'],
    options: ['3', '4', 'None', 'Error'], correctAnswer: '4',
    explanation: 'b = a copies the reference, not the list. Appending to b mutates the single shared list in memory, so len(a) is 4.',
  },
  {
    id: 'or_py_2', language: 'python', difficulty: 'easy',
    snippet: ['text = "BugBuddy"', 'print(text[3:6])'],
    options: ['Bud', 'Budo', 'gBu', 'udd'], correctAnswer: 'Bud',
    explanation: 'Slice [3:6] starts at index 3 ("B") and stops before index 6 ("d"), yielding characters at indices 3, 4, 5: "Bud".',
  },
  {
    id: 'or_py_3', language: 'python', difficulty: 'easy',
    snippet: ['total = 0', 'for i in range(1, 4):', '    total += i * 2', 'print(total)'],
    options: ['6', '12', '18', '24'], correctAnswer: '12',
    explanation: 'range(1, 4) produces 1, 2, 3. Iteration sums: 2 + 4 + 6 = 12.',
  },
  {
    id: 'or_py_4', language: 'python', difficulty: 'easy',
    snippet: ['s = "10"', 'print(s * 2 + "2")'],
    options: ['22', '10102', '102', '202'], correctAnswer: '10102',
    explanation: 'String multiplication "10" * 2 produces "1010". Concatenating "2" results in "10102".',
  },
  {
    id: 'or_py_5', language: 'python', difficulty: 'easy',
    snippet: ['nums = [10, 20, 30, 40]', 'print(nums[-2])'],
    options: ['20', '30', '40', 'IndexError'], correctAnswer: '30',
    explanation: 'Negative index -1 is the last item (40), and -2 is the second-to-last item (30).',
  },
  {
    id: 'or_py_6', language: 'python', difficulty: 'easy',
    snippet: ['x = [i for i in range(5) if i % 2 == 1]', 'print(sum(x))'],
    options: ['4', '9', '6', '1'], correctAnswer: '4',
    explanation: 'range(5) gives 0, 1, 2, 3, 4. The odd elements are 1 and 3. sum([1, 3]) = 4.',
  },
  {
    id: 'or_py_7', language: 'python', difficulty: 'easy',
    snippet: ['val = 7 // 2', 'print(val)'],
    options: ['3.5', '3', '4', '3.0'], correctAnswer: '3',
    explanation: 'Floor division // rounds down to the nearest integer, so 7 // 2 is 3.',
  },
  {
    id: 'or_py_8', language: 'python', difficulty: 'easy',
    snippet: ['x = True + True + False', 'print(x)'],
    options: ['True', '2', '1', 'TypeError'], correctAnswer: '2',
    explanation: 'In Python, bool inherits from int where True == 1 and False == 0. 1 + 1 + 0 = 2.',
  },
  {
    id: 'or_py_9', language: 'python', difficulty: 'easy',
    snippet: ['items = [1, 2, 3]', 'items.pop(1)', 'print(items)'],
    options: ['[1, 2]', '[2, 3]', '[1, 3]', '[3]'], correctAnswer: '[1, 3]',
    explanation: 'pop(1) removes the element at index 1 (which is 2), leaving [1, 3].',
  },
  {
    id: 'or_py_10', language: 'python', difficulty: 'easy',
    snippet: ['data = {"a": 1, "b": 2}', 'print(data.get("c", 99))'],
    options: ['None', 'KeyError', '99', '0'], correctAnswer: '99',
    explanation: 'dict.get(key, default) returns the specified default value (99) when the key does not exist.',
  },

  // 11 - 25: Intermediate Logic, Loops & Functions
  {
    id: 'or_py_11', language: 'python', difficulty: 'medium',
    snippet: ['def foo(x=[]):', '    x.append(1)', '    return len(x)', 'foo()', 'print(foo())'],
    options: ['1', '2', 'None', 'Error'], correctAnswer: '2',
    explanation: 'The default argument x=[] is shared across calls. The first call appends 1 (len=1); the second appends another 1, resulting in length 2.',
  },
  {
    id: 'or_py_12', language: 'python', difficulty: 'medium',
    snippet: ['word = "banana"', 'print(word.count("an"))'],
    options: ['1', '2', '3', '0'], correctAnswer: '2',
    explanation: '"banana" contains two non-overlapping occurrences of "an" at indices 1 and 3.',
  },
  {
    id: 'or_py_13', language: 'python', difficulty: 'medium',
    snippet: ['a = (1, 2, 3)', 'b = a[1:]', 'print(b[0])'],
    options: ['1', '2', '3', 'TypeError'], correctAnswer: '2',
    explanation: 'Slice a[1:] produces tuple (2, 3). b[0] is the first element, 2.',
  },
  {
    id: 'or_py_14', language: 'python', difficulty: 'medium',
    snippet: ['def check(n):', '    return "Even" if n % 2 == 0 else "Odd"', 'print(check(9))'],
    options: ['Even', 'Odd', 'True', 'False'], correctAnswer: 'Odd',
    explanation: '9 % 2 is 1 (non-zero), so the ternary else branch evaluates to "Odd".',
  },
  {
    id: 'or_py_15', language: 'python', difficulty: 'medium',
    snippet: ['x = 5', 'def outer():', '    x = 10', '    return x', 'outer()', 'print(x)'],
    options: ['10', '5', 'None', 'UnboundLocalError'], correctAnswer: '5',
    explanation: 'x = 10 creates a local variable inside outer(). The global x remains unchanged at 5.',
  },
  {
    id: 'or_py_16', language: 'python', difficulty: 'medium',
    snippet: ['nums = [3, 1, 4, 1, 5]', 'nums.sort()', 'print(nums[1])'],
    options: ['3', '1', '4', '5'], correctAnswer: '1',
    explanation: 'Sorting produces [1, 1, 3, 4, 5]. Index 1 holds the second 1.',
  },
  {
    id: 'or_py_17', language: 'python', difficulty: 'medium',
    snippet: ['nums = [1, 2, 3, 4]', 'evens = list(filter(lambda x: x % 2 == 0, nums))', 'print(len(evens))'],
    options: ['1', '2', '3', '4'], correctAnswer: '2',
    explanation: 'The even numbers are 2 and 4, producing a filtered list of length 2.',
  },
  {
    id: 'or_py_18', language: 'python', difficulty: 'medium',
    snippet: ['s = "hello"', 'print(s[::-1])'],
    options: ['hello', 'olleh', 'h', 'o'], correctAnswer: 'olleh',
    explanation: 'Step -1 reverses the entire string from end to start: "olleh".',
  },
  {
    id: 'or_py_19', language: 'python', difficulty: 'medium',
    snippet: ['val = 2 ** 3 ** 2', 'print(val)'],
    options: ['64', '512', '128', '256'], correctAnswer: '512',
    explanation: 'Exponentiation ** is right-associative: 3 ** 2 is 9 first, then 2 ** 9 is 512.',
  },
  {
    id: 'or_py_20', language: 'python', difficulty: 'medium',
    snippet: ['x = [1, 2]', 'y = [3, 4]', 'x.extend(y)', 'print(len(x))'],
    options: ['2', '3', '4', '5'], correctAnswer: '4',
    explanation: 'extend unpacks elements from y into x, resulting in [1, 2, 3, 4] with length 4.',
  },
  {
    id: 'or_py_21', language: 'python', difficulty: 'medium',
    snippet: ['print(bool([]) == bool([0]))'],
    options: ['True', 'False', 'None', 'Error'], correctAnswer: 'False',
    explanation: 'Empty list bool([]) is False. Non-empty list bool([0]) is True. False == True evaluates to False.',
  },
  {
    id: 'or_py_22', language: 'python', difficulty: 'medium',
    snippet: ['matrix = [[1, 2], [3, 4]]', 'print(matrix[1][0])'],
    options: ['1', '2', '3', '4'], correctAnswer: '3',
    explanation: 'matrix[1] selects row [3, 4]. Index 0 of that row is 3.',
  },
  {
    id: 'or_py_23', language: 'python', difficulty: 'medium',
    snippet: ['text = "a-b-c-d"', 'parts = text.split("-", 2)', 'print(len(parts))'],
    options: ['2', '3', '4', '1'], correctAnswer: '3',
    explanation: 'The maxsplit parameter 2 splits at the first 2 hyphens only: ["a", "b", "c-d"] (length 3).',
  },
  {
    id: 'or_py_24', language: 'python', difficulty: 'medium',
    snippet: ['x = {1, 2, 3}', 'y = {2, 3, 4}', 'print(len(x & y))'],
    options: ['1', '2', '3', '4'], correctAnswer: '2',
    explanation: 'Set intersection & finds common elements {2, 3}, which has length 2.',
  },
  {
    id: 'or_py_25', language: 'python', difficulty: 'medium',
    snippet: ['nums = [10, 20, 30]', 'print(nums.index(20))'],
    options: ['0', '1', '2', '20'], correctAnswer: '1',
    explanation: '20 is located at index 1.',
  },

  // 26 - 40: Advanced Functions, Recursion & Scope
  {
    id: 'or_py_26', language: 'python', difficulty: 'hard',
    snippet: ['def f(n):', '    if n <= 1: return 1', '    return n + f(n - 2)', 'print(f(5))'],
    options: ['9', '8', '15', '5'], correctAnswer: '9',
    explanation: 'f(5) = 5 + f(3) = 5 + 3 + f(1) = 5 + 3 + 1 = 9.',
  },
  {
    id: 'or_py_27', language: 'python', difficulty: 'hard',
    snippet: ['a = [[]] * 3', 'a[0].append(7)', 'print(len(a[2]))'],
    options: ['0', '1', '3', '7'], correctAnswer: '1',
    explanation: 'List multiplication [[]] * 3 duplicates references to the single inner list. All 3 elements point to [7], so len(a[2]) is 1.',
  },
  {
    id: 'or_py_28', language: 'python', difficulty: 'hard',
    snippet: ['funcs = [lambda x=i: x for i in range(3)]', 'print([f() for f in funcs])'],
    options: ['[0, 1, 2]', '[2, 2, 2]', '[0, 0, 0]', 'Error'], correctAnswer: '[0, 1, 2]',
    explanation: 'Using default argument x=i binds the current value of i at lambda creation time, preserving [0, 1, 2].',
  },
  {
    id: 'or_py_29', language: 'python', difficulty: 'hard',
    snippet: ['x = [1, 2, 3]', 'y = x[:]', 'print(x is y)'],
    options: ['True', 'False', 'None', 'Error'], correctAnswer: 'False',
    explanation: 'x[:] creates a shallow clone in a distinct memory location. "is" tests identity, returning False.',
  },
  {
    id: 'or_py_30', language: 'python', difficulty: 'hard',
    snippet: ['def memo(n, c={}):', '    if n in c: return c[n]', '    c[n] = n * 2', '    return c[n]', 'memo(3); memo(4)', 'print(len(memo.__defaults__[0]))'],
    options: ['0', '1', '2', '3'], correctAnswer: '2',
    explanation: 'The default dict c accumulates entries across calls. After memo(3) and memo(4), it holds 2 keys.',
  },
  {
    id: 'or_py_31', language: 'python', difficulty: 'hard',
    snippet: ['print(any([0, False, "", 5]))'],
    options: ['True', 'False', '5', 'None'], correctAnswer: 'True',
    explanation: 'any() returns True if at least one element is truthy. 5 is non-zero (truthy), so any() is True.',
  },
  {
    id: 'or_py_32', language: 'python', difficulty: 'hard',
    snippet: ['print(all([1, 2, True, 0]))'],
    options: ['True', 'False', '0', 'None'], correctAnswer: 'False',
    explanation: 'all() requires all elements to be truthy. 0 is falsy, so all() returns False.',
  },
  {
    id: 'or_py_33', language: 'python', difficulty: 'hard',
    snippet: ['a = 10', 'b = 20', 'a, b = b, a + b', 'print(a, b)'],
    options: ['20 30', '30 20', '20 20', '10 30'], correctAnswer: '20 30',
    explanation: 'The right side (b, a + b) evaluates to (20, 30) before assignment. Then a becomes 20 and b becomes 30.',
  },
  {
    id: 'or_py_34', language: 'python', difficulty: 'hard',
    snippet: ['text = "abc"', 'print("".join(reversed(text)))'],
    options: ['cba', 'abc', 'reversed', 'Error'], correctAnswer: 'cba',
    explanation: 'reversed("abc") yields iterator of characters "c", "b", "a". join() concatenates them into "cba".',
  },
  {
    id: 'or_py_35', language: 'python', difficulty: 'hard',
    snippet: ['nums = [1, 2, 3]', 'nums[1:2] = [8, 9]', 'print(nums)'],
    options: ['[1, 8, 9, 3]', '[1, 8, 3]', '[8, 9]', 'IndexError'], correctAnswer: '[1, 8, 9, 3]',
    explanation: 'Slice replacement replaces the slice [2] (at 1:2) with the list [8, 9], resulting in [1, 8, 9, 3].',
  },
  {
    id: 'or_py_36', language: 'python', difficulty: 'hard',
    snippet: ['d = {1: "a", 1.0: "b"}', 'print(len(d))'],
    options: ['1', '2', 'TypeError', 'None'], correctAnswer: '1',
    explanation: 'In Python, 1 == 1.0 and hash(1) == hash(1.0). The key 1.0 overwrites key 1 in the dictionary, leaving length 1.',
  },
  {
    id: 'or_py_37', language: 'python', difficulty: 'hard',
    snippet: ['print("hello"[1:4:2])'],
    options: ['el', 'eo', 'lo', 'hlo'], correctAnswer: 'el',
    explanation: 'Indices 1 to 3 with step 2 extracts index 1 ("e"), jumps 2 to index 3 ("l") -> "el".',
  },
  {
    id: 'or_py_38', language: 'python', difficulty: 'hard',
    snippet: ['x = [1, 2, 3]', 'del x[1]', 'print(x)'],
    options: ['[1, 3]', '[2, 3]', '[1, 2]', 'IndexError'], correctAnswer: '[1, 3]',
    explanation: 'del x[1] removes the element at index 1 (2), leaving [1, 3].',
  },
  {
    id: 'or_py_39', language: 'python', difficulty: 'hard',
    snippet: ['print(round(2.5), round(3.5))'],
    options: ['2 4', '3 4', '3 3', '2 3'], correctAnswer: '2 4',
    explanation: 'Python 3 uses banker rounding (round half to even). 2.5 rounds down to 2; 3.5 rounds up to 4.',
  },
  {
    id: 'or_py_40', language: 'python', difficulty: 'hard',
    snippet: ['x = (1, ) * 3', 'print(x)'],
    options: ['(1, 1, 1)', '(3,)', '(1,)', 'TypeError'], correctAnswer: '(1, 1, 1)',
    explanation: 'Tuple multiplication replicates elements, producing (1, 1, 1).',
  },
  // 41 - 51: Capstone Tracing & Edge Cases
  {
    id: 'or_py_41', language: 'python', difficulty: 'medium',
    snippet: ['print(type(1 / 1).__name__)'],
    options: ['float', 'int', 'number', 'double'], correctAnswer: 'float',
    explanation: 'In Python 3, single slash / always performs true floating-point division and returns a float.',
  },
  {
    id: 'or_py_42', language: 'python', difficulty: 'easy',
    snippet: ['x = [0] * 4', 'print(len(x))'],
    options: ['4', '0', '1', 'TypeError'], correctAnswer: '4',
    explanation: 'Multiplying [0] by 4 produces a four-element list [0, 0, 0, 0].',
  },
  {
    id: 'or_py_43', language: 'python', difficulty: 'medium',
    snippet: ['nums = [5, 4, 3, 2, 1]', 'print(min(nums) + max(nums))'],
    options: ['6', '5', '1', '7'], correctAnswer: '6',
    explanation: 'min is 1 and max is 5. 1 + 5 = 6.',
  },
  {
    id: 'or_py_44', language: 'python', difficulty: 'hard',
    snippet: ['a = {1, 2}', 'b = {2, 3}', 'print(len(a ^ b))'],
    options: ['2', '1', '4', '0'], correctAnswer: '2',
    explanation: 'Symmetric difference ^ returns elements in either set but not both: {1, 3} (length 2).',
  },
  {
    id: 'or_py_45', language: 'python', difficulty: 'easy',
    snippet: ['s = "BugBuddy"', 'print("B" in s and "z" not in s)'],
    options: ['True', 'False', 'None', 'Error'], correctAnswer: 'True',
    explanation: '"B" is present and "z" is not present, so both conditions evaluate to True.',
  },
  {
    id: 'or_py_46', language: 'python', difficulty: 'medium',
    snippet: ['print(list(zip([1, 2], ["a", "b", "c"]))[1])'],
    options: ['(2, "b")', '(1, "a")', '(2, "c")', 'IndexError'], correctAnswer: '(2, "b")',
    explanation: 'zip pairs up to the shortest iterable: [(1, "a"), (2, "b")]. Index 1 is (2, "b").',
  },
  {
    id: 'or_py_47', language: 'python', difficulty: 'hard',
    snippet: ['gen = (x * 2 for x in [1, 2])', 'print(next(gen) + next(gen))'],
    options: ['6', '4', '2', 'StopIteration'], correctAnswer: '6',
    explanation: 'next(gen) yields 2, then next(gen) yields 4. 2 + 4 = 6.',
  },
  {
    id: 'or_py_48', language: 'python', difficulty: 'medium',
    snippet: ['x = [1, 2, 3]', 'print(x.pop())'],
    options: ['3', '1', '2', 'None'], correctAnswer: '3',
    explanation: 'pop() without arguments removes and returns the last element, 3.',
  },
  {
    id: 'or_py_49', language: 'python', difficulty: 'hard',
    snippet: ['print(sorted([-5, 2, -1, 4], key=abs)[0])'],
    options: ['-1', '-5', '2', '4'], correctAnswer: '-1',
    explanation: 'Sorting by absolute value: abs(-1)=1, abs(2)=2, abs(4)=4, abs(-5)=5. The first element is -1.',
  },
  {
    id: 'or_py_50', language: 'python', difficulty: 'easy',
    snippet: ['print("Python"[0:2])'],
    options: ['Py', 'Pyt', 'P', 'y'], correctAnswer: 'Py',
    explanation: 'Slice [0:2] takes characters at indices 0 and 1: "Py".',
  },
  {
    id: 'or_py_51', language: 'python', difficulty: 'medium',
    snippet: ['x = "123"', 'print(isinstance(int(x), int))'],
    options: ['True', 'False', '123', 'None'], correctAnswer: 'True',
    explanation: 'int("123") parses to integer 123, which is an instance of int.',
  },
];

const JAVA_OUTPUT_QUESTIONS = [
  // 1 - 10: Basic Types, Arithmetic & Pre/Post Increments
  {
    id: 'or_jv_1', language: 'java', difficulty: 'easy',
    snippet: ['int x = 5;', 'int y = ++x;', 'System.out.println(x + " " + y);'],
    options: ['5 6', '6 5', '6 6', '5 5'], correctAnswer: '6 6',
    explanation: 'Prefix increment ++x increments x to 6 first and then assigns 6 to y, so both evaluate to 6.',
  },
  {
    id: 'or_jv_2', language: 'java', difficulty: 'easy',
    snippet: ['int x = 5;', 'int y = x++;', 'System.out.println(x + " " + y);'],
    options: ['6 5', '5 6', '6 6', '5 5'], correctAnswer: '6 5',
    explanation: 'Postfix increment x++ returns original value 5 to y before incrementing x to 6.',
  },
  {
    id: 'or_jv_3', language: 'java', difficulty: 'easy',
    snippet: ['int[] nums = {10, 20, 30};', 'System.out.println(nums[nums.length - 2]);'],
    options: ['10', '20', '30', 'ArrayIndexOutOfBoundsException'], correctAnswer: '20',
    explanation: 'nums.length is 3. 3 - 2 = 1. Index 1 holds 20.',
  },
  {
    id: 'or_jv_4', language: 'java', difficulty: 'easy',
    snippet: ['String a = "hello";', 'String b = "hel" + "lo";', 'System.out.println(a == b);'],
    options: ['true', 'false', 'Compilation Error', 'NullPointerException'], correctAnswer: 'true',
    explanation: 'Compile-time constant string expressions are interned into the string constant pool, so both point to the same object.',
  },
  {
    id: 'or_jv_5', language: 'java', difficulty: 'easy',
    snippet: ['int val = 9 / 2;', 'System.out.println(val);'],
    options: ['4.5', '4', '5', '4.0'], correctAnswer: '4',
    explanation: 'Integer division in Java truncates fractional values, giving 4.',
  },
  {
    id: 'or_jv_6', language: 'java', difficulty: 'easy',
    snippet: ['System.out.println(1 + 2 + "3");'],
    options: ['33', '123', '6', 'Error'], correctAnswer: '33',
    explanation: 'Addition evaluates left-to-right: 1 + 2 = 3. Then 3 + "3" performs string concatenation -> "33".',
  },
  {
    id: 'or_jv_7', language: 'java', difficulty: 'easy',
    snippet: ['System.out.println("1" + 2 + 3);'],
    options: ['123', '15', '6', 'Error'], correctAnswer: '123',
    explanation: '"1" + 2 creates "12". Then "12" + 3 creates "123".',
  },
  {
    id: 'or_jv_8', language: 'java', difficulty: 'easy',
    snippet: ['int a = 10;', 'int b = 3;', 'System.out.println(a % b);'],
    options: ['1', '3', '0', '3.33'], correctAnswer: '1',
    explanation: '10 divided by 3 has remainder 1 (10 % 3 = 1).',
  },
  {
    id: 'or_jv_9', language: 'java', difficulty: 'easy',
    snippet: ['boolean flag = 5 > 3 && 2 < 1;', 'System.out.println(flag);'],
    options: ['false', 'true', '1', '0'], correctAnswer: 'false',
    explanation: '5 > 3 is true, but 2 < 1 is false. true && false is false.',
  },
  {
    id: 'or_jv_10', language: 'java', difficulty: 'easy',
    snippet: ['int[] arr = new int[3];', 'System.out.println(arr[0]);'],
    options: ['0', 'null', 'undefined', 'Garbage Value'], correctAnswer: '0',
    explanation: 'Primitive int array elements in Java are automatically initialized to default 0.',
  },

  // 11 - 25: Strings, Loops & Conditionals
  {
    id: 'or_jv_11', language: 'java', difficulty: 'medium',
    snippet: ['String s = "Java";', 's.concat("Script");', 'System.out.println(s);'],
    options: ['Java', 'JavaScript', 'Script', 'null'], correctAnswer: 'Java',
    explanation: 'Strings in Java are immutable. s.concat returns a new String, but s is not reassigned.',
  },
  {
    id: 'or_jv_12', language: 'java', difficulty: 'medium',
    snippet: ['int sum = 0;', 'for (int i = 0; i < 3; i++) {', '    sum += i;', '}', 'System.out.println(sum);'],
    options: ['3', '6', '2', '0'], correctAnswer: '3',
    explanation: 'Loop runs for i = 0, 1, 2. sum = 0 + 1 + 2 = 3.',
  },
  {
    id: 'or_jv_13', language: 'java', difficulty: 'medium',
    snippet: ['String s = "BugBuddy";', 'System.out.println(s.substring(3, 7));'],
    options: ['Budd', 'Buddy', 'gBud', 'Bud'], correctAnswer: 'Budd',
    explanation: 'substring(3, 7) takes chars from index 3 up to index 6: "B", "u", "d", "d" -> "Budd".',
  },
  {
    id: 'or_jv_14', language: 'java', difficulty: 'medium',
    snippet: ['int x = 2;', 'switch (x) {', '    case 1: x += 1;', '    case 2: x += 2;', '    case 3: x += 3;', '}', 'System.out.println(x);'],
    options: ['4', '7', '2', '5'], correctAnswer: '7',
    explanation: 'No break statement causes fall-through! Matching case 2: x becomes 2 + 2 = 4. Falling into case 3: x becomes 4 + 3 = 7.',
  },
  {
    id: 'or_jv_15', language: 'java', difficulty: 'medium',
    snippet: ['String s1 = new String("hi");', 'String s2 = new String("hi");', 'System.out.println(s1.equals(s2));'],
    options: ['true', 'false', 'Compilation Error', 'null'], correctAnswer: 'true',
    explanation: '.equals() compares the character sequence values of the strings, which are identical ("hi").',
  },
  {
    id: 'or_jv_16', language: 'java', difficulty: 'medium',
    snippet: ['int a = 5;', 'int b = 10;', 'System.out.println(a > b ? a : b);'],
    options: ['10', '5', 'true', 'false'], correctAnswer: '10',
    explanation: 'Ternary evaluates false condition, returning b (10).',
  },
  {
    id: 'or_jv_17', language: 'java', difficulty: 'medium',
    snippet: ['int count = 0;', 'while (count < 3) {', '    count++;', '}', 'System.out.println(count);'],
    options: ['3', '2', '4', '0'], correctAnswer: '3',
    explanation: 'The loop increments count until count is no longer < 3, exiting with count = 3.',
  },
  {
    id: 'or_jv_18', language: 'java', difficulty: 'medium',
    snippet: ['char c = "abc".charAt(1);', 'System.out.println(c);'],
    options: ['b', 'a', 'c', '1'], correctAnswer: 'b',
    explanation: '0-indexed: index 0 is "a", index 1 is "b".',
  },
  {
    id: 'or_jv_19', language: 'java', difficulty: 'medium',
    snippet: ['int x = (int) 7.9;', 'System.out.println(x);'],
    options: ['7', '8', '7.9', 'Compilation Error'], correctAnswer: '7',
    explanation: 'Explicit cast (int) truncates fractional digits without rounding, yielding 7.',
  },
  {
    id: 'or_jv_20', language: 'java', difficulty: 'medium',
    snippet: ['System.out.println(Math.max(12, Math.min(8, 15)));'],
    options: ['12', '8', '15', '0'], correctAnswer: '12',
    explanation: 'Math.min(8, 15) is 8. Math.max(12, 8) is 12.',
  },
  {
    id: 'or_jv_21', language: 'java', difficulty: 'medium',
    snippet: ['String s = "code";', 'System.out.println(s.length());'],
    options: ['4', '3', '5', 'Error'], correctAnswer: '4',
    explanation: '"code" contains 4 characters.',
  },
  {
    id: 'or_jv_22', language: 'java', difficulty: 'medium',
    snippet: ['int[] arr = {1, 2, 3, 4};', 'System.out.println(arr.length);'],
    options: ['4', '3', '5', 'Error'], correctAnswer: '4',
    explanation: 'Array has 4 elements.',
  },
  {
    id: 'or_jv_23', language: 'java', difficulty: 'medium',
    snippet: ['boolean b = false;', 'if (b = true) {', '    System.out.println("Yes");', '}'],
    options: ['Yes', 'No', 'Nothing printed', 'Compilation Error'], correctAnswer: 'Yes',
    explanation: 'Single = assigns true to b, yielding true for the if condition, so "Yes" is printed.',
  },
  {
    id: 'or_jv_24', language: 'java', difficulty: 'medium',
    snippet: ['int n = 4;', 'System.out.println(n << 1);'],
    options: ['8', '2', '4', '16'], correctAnswer: '8',
    explanation: 'Left bitshift << 1 multiplies by 2: 4 * 2 = 8.',
  },
  {
    id: 'or_jv_25', language: 'java', difficulty: 'medium',
    snippet: ['int n = 8;', 'System.out.println(n >> 2);'],
    options: ['2', '4', '16', '1'], correctAnswer: '2',
    explanation: 'Right bitshift >> 2 divides by 2^2 (4): 8 / 4 = 2.',
  },

  // 26 - 40: Advanced Reference Types, Arrays & OOP Concepts
  {
    id: 'or_jv_26', language: 'java', difficulty: 'hard',
    snippet: ['Integer a = 127;', 'Integer b = 127;', 'System.out.println(a == b);'],
    options: ['true', 'false', 'Compilation Error', 'NullPointerException'], correctAnswer: 'true',
    explanation: 'Java caches Integer wrapper objects in the range -128 to 127 in the IntegerCache, so == returns true.',
  },
  {
    id: 'or_jv_27', language: 'java', difficulty: 'hard',
    snippet: ['Integer a = 128;', 'Integer b = 128;', 'System.out.println(a == b);'],
    options: ['false', 'true', 'Compilation Error', 'NullPointerException'], correctAnswer: 'false',
    explanation: '128 exceeds the IntegerCache limit (127), so distinct heap objects are instantiated and == returns false.',
  },
  {
    id: 'or_jv_28', language: 'java', difficulty: 'hard',
    snippet: ['int[] a = {1, 2};', 'int[] b = a;', 'b[0] = 99;', 'System.out.println(a[0]);'],
    options: ['99', '1', '2', 'ArrayIndexOutOfBoundsException'], correctAnswer: '99',
    explanation: 'b = a copies the array reference. Mutating b[0] mutates the single shared array.',
  },
  {
    id: 'or_jv_29', language: 'java', difficulty: 'hard',
    snippet: ['String s = "hello";', 's.replace("l", "w");', 'System.out.println(s);'],
    options: ['hello', 'hewwo', 'null', 'Error'], correctAnswer: 'hello',
    explanation: 'replace() returns a new string. Because s is not reassigned, s remains "hello".',
  },
  {
    id: 'or_jv_30', language: 'java', difficulty: 'hard',
    snippet: ['int x = 0;', 'for (int i = 0; i < 5; i++) {', '    if (i == 3) break;', '    x += i;', '}', 'System.out.println(x);'],
    options: ['3', '6', '10', '0'], correctAnswer: '3',
    explanation: 'Iterates for i = 0 (x=0), i = 1 (x=1), i = 2 (x=3). At i = 3, break exits the loop immediately.',
  },
  {
    id: 'or_jv_31', language: 'java', difficulty: 'hard',
    snippet: ['int x = 0;', 'for (int i = 0; i < 4; i++) {', '    if (i == 2) continue;', '    x += i;', '}', 'System.out.println(x);'],
    options: ['4', '6', '3', '0'], correctAnswer: '4',
    explanation: 'continue skips i = 2. Added values are 0 + 1 + 3 = 4.',
  },
  {
    id: 'or_jv_32', language: 'java', difficulty: 'hard',
    snippet: ['int a = 5;', 'int b = 2;', 'double c = a / b;', 'System.out.println(c);'],
    options: ['2.0', '2.5', '2', '3.0'], correctAnswer: '2.0',
    explanation: 'a / b is integer division resulting in 2. Assigning to double c converts 2 to 2.0.',
  },
  {
    id: 'or_jv_33', language: 'java', difficulty: 'hard',
    snippet: ['double a = 5.0;', 'int b = 2;', 'System.out.println(a / b);'],
    options: ['2.5', '2.0', '2', 'Error'], correctAnswer: '2.5',
    explanation: 'With a double operand (5.0), Java promotes b to double and performs floating-point division -> 2.5.',
  },
  {
    id: 'or_jv_34', language: 'java', difficulty: 'hard',
    snippet: ['StringBuilder sb = new StringBuilder("Bug");', 'sb.append("Buddy");', 'System.out.println(sb.length());'],
    options: ['8', '3', '5', 'Error'], correctAnswer: '8',
    explanation: '"BugBuddy" has 8 characters. StringBuilder mutates in-place.',
  },
  {
    id: 'or_jv_35', language: 'java', difficulty: 'hard',
    snippet: ['int x = 10;', 'System.out.println(x > 5 ? x < 15 ? 1 : 2 : 3);'],
    options: ['1', '2', '3', 'Error'], correctAnswer: '1',
    explanation: 'x > 5 is true. Then x < 15 is true, returning 1.',
  },
  {
    id: 'or_jv_36', language: 'java', difficulty: 'hard',
    snippet: ['int[] arr = {5, 3, 8};', 'java.util.Arrays.sort(arr);', 'System.out.println(arr[1]);'],
    options: ['5', '3', '8', '0'], correctAnswer: '5',
    explanation: 'Sorted array: [3, 5, 8]. Index 1 is 5.',
  },
  {
    id: 'or_jv_37', language: 'java', difficulty: 'hard',
    snippet: ['System.out.println(Boolean.parseBoolean("TRUE"));'],
    options: ['true', 'false', 'Compilation Error', 'NullPointerException'], correctAnswer: 'true',
    explanation: 'Boolean.parseBoolean is case-insensitive; "TRUE" parses to true.',
  },
  {
    id: 'or_jv_38', language: 'java', difficulty: 'hard',
    snippet: ['int x = -5;', 'System.out.println(Math.abs(x));'],
    options: ['5', '-5', '0', 'Error'], correctAnswer: '5',
    explanation: 'Math.abs(-5) returns the positive magnitude 5.',
  },
  {
    id: 'or_jv_39', language: 'java', difficulty: 'hard',
    snippet: ['int[][] m = {{1}, {2, 3}};', 'System.out.println(m[1].length);'],
    options: ['2', '1', '3', 'Error'], correctAnswer: '2',
    explanation: 'Row 1 is {2, 3}, which has length 2 (ragged array).',
  },
  {
    id: 'or_jv_40', language: 'java', difficulty: 'hard',
    snippet: ['String s = "  trim  ";', 'System.out.println(s.trim().length());'],
    options: ['4', '8', '6', '0'], correctAnswer: '4',
    explanation: 'trim() strips outer whitespace, leaving "trim" of length 4.',
  },
  // 41 - 51: Capstone Java Tracing
  {
    id: 'or_jv_41', language: 'java', difficulty: 'easy',
    snippet: ['System.out.println("abc".toUpperCase());'],
    options: ['ABC', 'abc', 'Abc', 'Error'], correctAnswer: 'ABC',
    explanation: 'toUpperCase() converts all letters to uppercase: "ABC".',
  },
  {
    id: 'or_jv_42', language: 'java', difficulty: 'medium',
    snippet: ['System.out.println(10 == 10.0);'],
    options: ['true', 'false', 'TypeMismatch', 'Error'], correctAnswer: 'true',
    explanation: 'Numeric promotion converts int 10 to double 10.0 before comparison, returning true.',
  },
  {
    id: 'or_jv_43', language: 'java', difficulty: 'hard',
    snippet: ['int x = 1;', 'x = x++ + ++x;', 'System.out.println(x);'],
    options: ['4', '3', '2', '5'], correctAnswer: '4',
    explanation: 'x++ evaluates to 1 (x becomes 2). ++x increments x to 3 and evaluates to 3. 1 + 3 = 4.',
  },
  {
    id: 'or_jv_44', language: 'java', difficulty: 'medium',
    snippet: ['String s = "apple";', 'System.out.println(s.indexOf("p"));'],
    options: ['1', '2', '0', '-1'], correctAnswer: '1',
    explanation: 'indexOf returns the first occurrence index: "p" appears at index 1.',
  },
  {
    id: 'or_jv_45', language: 'java', difficulty: 'easy',
    snippet: ['int a = 15;', 'System.out.println(a % 5 == 0);'],
    options: ['true', 'false', '0', 'Error'], correctAnswer: 'true',
    explanation: '15 is divisible by 5 with remainder 0, returning true.',
  },
  {
    id: 'or_jv_46', language: 'java', difficulty: 'medium',
    snippet: ['int[] arr = {10, 20, 30};', 'int sum = 0;', 'for (int n : arr) sum += n;', 'System.out.println(sum);'],
    options: ['60', '30', '10', '0'], correctAnswer: '60',
    explanation: '10 + 20 + 30 = 60.',
  },
  {
    id: 'or_jv_47', language: 'java', difficulty: 'hard',
    snippet: ['System.out.println(Integer.toBinaryString(6));'],
    options: ['110', '101', '011', '6'], correctAnswer: '110',
    explanation: '6 in binary is 4 + 2 = 110.',
  },
  {
    id: 'or_jv_48', language: 'java', difficulty: 'medium',
    snippet: ['System.out.println("Java".startsWith("Ja"));'],
    options: ['true', 'false', 'Ja', 'Error'], correctAnswer: 'true',
    explanation: '"Java" begins with prefix "Ja".',
  },
  {
    id: 'or_jv_49', language: 'java', difficulty: 'easy',
    snippet: ['int x = 100;', 'x /= 4;', 'System.out.println(x);'],
    options: ['25', '20', '50', '4'], correctAnswer: '25',
    explanation: '100 / 4 = 25.',
  },
  {
    id: 'or_jv_50', language: 'java', difficulty: 'hard',
    snippet: ['String s = "12345";', 'System.out.println(s.substring(2));'],
    options: ['345', '2345', '12', 'Error'], correctAnswer: '345',
    explanation: 'substring(2) begins at index 2 ("3") to the end: "345".',
  },
  {
    id: 'or_jv_51', language: 'java', difficulty: 'medium',
    snippet: ['int val = (int) Math.pow(2, 4);', 'System.out.println(val);'],
    options: ['16', '8', '32', 'Error'], correctAnswer: '16',
    explanation: '2^4 = 16.',
  },
];

const OUTPUT_RUSH_QUESTIONS = [
  ...PYTHON_OUTPUT_QUESTIONS,
  ...JAVA_OUTPUT_QUESTIONS,
];

module.exports = {
  OUTPUT_RUSH_QUESTIONS,
  PYTHON_OUTPUT_QUESTIONS,
  JAVA_OUTPUT_QUESTIONS,
};
