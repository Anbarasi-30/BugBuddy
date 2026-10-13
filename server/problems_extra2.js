// Extra problems 36-53 (HashMap, Sorting, Recursion, Binary Search, Math)
module.exports = [
  // 36. HashMap - Group Anagrams
  {
    title: 'Group Anagrams',
    description: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nExample: ["eat","tea","tan","ate","nat","bat"] → [["bat"],["nat","tan"],["ate","eat","tea"]]',
    difficulty: 'medium',
    tags: ['Strings', 'HashMap', 'Sorting'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print groups of anagrams.',
    starterCode: [
      { language: 'python', code: `def group_anagrams(strs):\n    pass\n\nprint(group_anagrams(["eat","tea","tan","ate","nat","bat"]))` },
      { language: 'java', code: `import java.util.*;\npublic class Main {\n    public static List<List<String>> groupAnagrams(String[] strs) { return new ArrayList<>(); }\n    public static void main(String[] args) {\n        System.out.println(groupAnagrams(new String[]{"eat","tea","tan","ate","nat","bat"}));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid groupAnagrams(char* strs[], int n) {}\nint main() {\n    char* strs[]={"eat","tea","tan","ate","nat","bat"};\n    groupAnagrams(strs,6);\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\nvector<vector<string>> groupAnagrams(vector<string>& strs) { return {}; }\nint main() {\n    vector<string> strs={"eat","tea","tan","ate","nat","bat"};\n    auto res=groupAnagrams(strs);\n    for(auto& g:res){cout<<"[";for(int i=0;i<(int)g.size();i++)cout<<g[i]<<(i<(int)g.size()-1?",":"");cout<<"]";}\n    cout<<endl;\n}` },
    ],
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]', isHidden: false },
      { input: '[""]', expectedOutput: '[[""]]', isHidden: false },
      { input: '["a"]', expectedOutput: '[["a"]]', isHidden: true },
    ],
    order: 36,
  },
  // 37. HashMap - Longest Consecutive Sequence
  {
    title: 'Longest Consecutive Sequence',
    description: 'Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.',
    difficulty: 'medium',
    tags: ['Arrays', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the length of the longest consecutive sequence.',
    starterCode: [
      { language: 'python', code: `def longest_consecutive(nums):\n    pass\n\nprint(longest_consecutive([100,4,200,1,3,2]))` },
      { language: 'java', code: `import java.util.*;\npublic class Main {\n    public static int longestConsecutive(int[] nums) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(longestConsecutive(new int[]{100,4,200,1,3,2}));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint longestConsecutive(int nums[], int size) { return 0; }\nint main() {\n    int nums[]={100,4,200,1,3,2};\n    printf("%d\\n",longestConsecutive(nums,6));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\n#include <unordered_set>\nusing namespace std;\nint longestConsecutive(vector<int>& nums) { return 0; }\nint main() {\n    vector<int> nums={100,4,200,1,3,2};\n    cout<<longestConsecutive(nums)<<endl;\n}` },
    ],
    testCases: [
      { input: '[100,4,200,1,3,2]', expectedOutput: '4', isHidden: false },
      { input: '[0,3,7,2,5,8,4,6,0,1]', expectedOutput: '9', isHidden: false },
      { input: '[]', expectedOutput: '0', isHidden: true },
    ],
    order: 37,
  },
  // 38. HashMap - Word Count
  {
    title: 'Word Frequency Counter',
    description: 'Given a string `sentence`, count the frequency of each word and print the word with its count, sorted alphabetically.\n\nWords are case-insensitive.',
    difficulty: 'easy',
    tags: ['Strings', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print each word and its frequency in sorted order.',
    starterCode: [
      { language: 'python', code: `def word_frequency(sentence):\n    pass\n\nword_frequency("the cat sat on the mat the cat")` },
      { language: 'java', code: `import java.util.*;\npublic class Main {\n    public static void wordFrequency(String sentence) {}\n    public static void main(String[] args) {\n        wordFrequency("the cat sat on the mat the cat");\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid wordFrequency(char* sentence) {}\nint main() {\n    wordFrequency("the cat sat on the mat the cat");\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <map>\n#include <string>\n#include <sstream>\nusing namespace std;\nvoid wordFrequency(string sentence) {}\nint main() {\n    wordFrequency("the cat sat on the mat the cat");\n}` },
    ],
    testCases: [
      { input: 'the cat sat on the mat the cat', expectedOutput: 'cat: 2\nmat: 1\non: 1\nsat: 1\nthe: 3', isHidden: false },
      { input: 'hello world', expectedOutput: 'hello: 1\nworld: 1', isHidden: false },
    ],
    order: 38,
  },
  // 39. Sorting - Insertion Sort
  {
    title: 'Insertion Sort',
    description: 'Implement the Insertion Sort algorithm to sort an array of integers in ascending order.\n\nDo not use any built-in sort functions.',
    difficulty: 'easy',
    tags: ['Arrays', 'Sorting'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the sorted array.',
    starterCode: [
      { language: 'python', code: `def insertion_sort(nums):\n    # Implement insertion sort\n    pass\n\nnums = [12, 11, 13, 5, 6]\ninsertion_sort(nums)\nprint(nums)` },
      { language: 'java', code: `import java.util.*;\npublic class Main {\n    public static void insertionSort(int[] nums) {}\n    public static void main(String[] args) {\n        int[] nums={12,11,13,5,6};\n        insertionSort(nums);\n        System.out.println(Arrays.toString(nums));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid insertionSort(int nums[], int size) {}\nint main() {\n    int nums[]={12,11,13,5,6};\n    insertionSort(nums,5);\n    for(int i=0;i<5;i++) printf("%d%s",nums[i],i<4?", ":"\\n");\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nvoid insertionSort(vector<int>& nums) {}\nint main() {\n    vector<int> nums={12,11,13,5,6};\n    insertionSort(nums);\n    for(int i=0;i<(int)nums.size();i++) cout<<nums[i]<<(i<(int)nums.size()-1?", ":"\\n");\n}` },
    ],
    testCases: [
      { input: '[12,11,13,5,6]', expectedOutput: '[5, 6, 11, 12, 13]', isHidden: false },
      { input: '[64,34,25,12,22,11,90]', expectedOutput: '[11, 12, 22, 25, 34, 64, 90]', isHidden: false },
    ],
    order: 39,
  },
  // 40. Sorting - Find Kth Largest
  {
    title: 'Find Kth Largest Element',
    description: 'Given an integer array `nums` and an integer `k`, return the kth largest element in the array.\n\nNote that it is the kth largest element in sorted order, not the kth distinct element.',
    difficulty: 'medium',
    tags: ['Arrays', 'Sorting'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the kth largest element.',
    starterCode: [
      { language: 'python', code: `def find_kth_largest(nums, k):\n    pass\n\nprint(find_kth_largest([3,2,1,5,6,4], 2))` },
      { language: 'java', code: `public class Main {\n    public static int findKthLargest(int[] nums, int k) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(findKthLargest(new int[]{3,2,1,5,6,4}, 2));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint findKthLargest(int nums[], int size, int k) { return 0; }\nint main() {\n    int nums[]={3,2,1,5,6,4};\n    printf("%d\\n",findKthLargest(nums,6,2));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint findKthLargest(vector<int>& nums, int k) { return 0; }\nint main() {\n    vector<int> nums={3,2,1,5,6,4};\n    cout<<findKthLargest(nums,2)<<endl;\n}` },
    ],
    testCases: [
      { input: '[3,2,1,5,6,4]\n2', expectedOutput: '5', isHidden: false },
      { input: '[3,2,3,1,2,4,5,5,6]\n4', expectedOutput: '4', isHidden: false },
      { input: '[1]\n1', expectedOutput: '1', isHidden: true },
    ],
    order: 40,
  },
  // 41. Sorting - Count Inversions
  {
    title: 'Count Inversions in Array',
    description: 'Given an array of integers `nums`, count the number of inversions. An inversion is a pair (i, j) where i < j and nums[i] > nums[j].',
    difficulty: 'hard',
    tags: ['Arrays', 'Sorting'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the total number of inversions.',
    starterCode: [
      { language: 'python', code: `def count_inversions(nums):\n    # Hint: merge sort approach works in O(n log n)\n    pass\n\nprint(count_inversions([8, 4, 2, 1]))` },
      { language: 'java', code: `public class Main {\n    public static long countInversions(int[] nums) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(countInversions(new int[]{8,4,2,1}));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nlong countInversions(int nums[], int size) { return 0; }\nint main() {\n    int nums[]={8,4,2,1};\n    printf("%ld\\n",countInversions(nums,4));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nlong countInversions(vector<int>& nums) { return 0; }\nint main() {\n    vector<int> nums={8,4,2,1};\n    cout<<countInversions(nums)<<endl;\n}` },
    ],
    testCases: [
      { input: '[8,4,2,1]', expectedOutput: '6', isHidden: false },
      { input: '[3,1,2]', expectedOutput: '2', isHidden: false },
      { input: '[1,2,3]', expectedOutput: '0', isHidden: true },
    ],
    order: 41,
  },
  // 42. Recursion - Factorial
  {
    title: 'Factorial Using Recursion',
    description: 'Write a recursive function to compute the factorial of a non-negative integer `n`.\n\nFactorial: n! = n × (n-1) × ... × 1, and 0! = 1.',
    difficulty: 'easy',
    tags: ['Recursion', 'Math'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the factorial of n.',
    starterCode: [
      { language: 'python', code: `def factorial(n):\n    # Use recursion\n    pass\n\nprint(factorial(5))\nprint(factorial(0))` },
      { language: 'java', code: `public class Main {\n    public static long factorial(int n) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n        System.out.println(factorial(0));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nlong factorial(int n) { return 0; }\nint main() {\n    printf("%ld\\n", factorial(5));\n    printf("%ld\\n", factorial(0));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nlong factorial(int n) { return 0; }\nint main() {\n    cout<<factorial(5)<<endl;\n    cout<<factorial(0)<<endl;\n}` },
    ],
    testCases: [
      { input: '5', expectedOutput: '120', isHidden: false },
      { input: '0', expectedOutput: '1', isHidden: false },
      { input: '10', expectedOutput: '3628800', isHidden: true },
    ],
    order: 42,
  },
  // 43. Recursion - Power Function
  {
    title: 'Power Function (Recursion)',
    description: 'Implement `power(base, exp)` that computes base raised to the power exp using recursion. Assume exp >= 0.\n\nDo not use the built-in power operator or function.',
    difficulty: 'easy',
    tags: ['Recursion', 'Math'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print base^exp.',
    starterCode: [
      { language: 'python', code: `def power(base, exp):\n    # Use recursion\n    pass\n\nprint(power(2, 10))\nprint(power(3, 0))` },
      { language: 'java', code: `public class Main {\n    public static long power(long base, int exp) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(power(2, 10));\n        System.out.println(power(3, 0));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nlong power(long base, int exp) { return 0; }\nint main() {\n    printf("%ld\\n", power(2,10));\n    printf("%ld\\n", power(3,0));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nlong power(long base, int exp) { return 0; }\nint main() {\n    cout<<power(2,10)<<endl;\n    cout<<power(3,0)<<endl;\n}` },
    ],
    testCases: [
      { input: '2\n10', expectedOutput: '1024', isHidden: false },
      { input: '3\n0', expectedOutput: '1', isHidden: false },
      { input: '5\n3', expectedOutput: '125', isHidden: true },
    ],
    order: 43,
  },
  // 44. Recursion - Tower of Hanoi
  {
    title: 'Tower of Hanoi',
    description: 'Solve the Tower of Hanoi puzzle for n disks. Print each move as "Move disk X from peg A to peg C".\n\nn disks start on peg A, need to reach peg C using peg B as auxiliary.',
    difficulty: 'medium',
    tags: ['Recursion'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print all move steps to solve Tower of Hanoi.',
    starterCode: [
      { language: 'python', code: `def hanoi(n, source, target, aux):\n    # Recursive solution\n    pass\n\nhanoi(3, 'A', 'C', 'B')` },
      { language: 'java', code: `public class Main {\n    public static void hanoi(int n, char src, char tgt, char aux) {}\n    public static void main(String[] args) {\n        hanoi(3, 'A', 'C', 'B');\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid hanoi(int n, char src, char tgt, char aux) {}\nint main() {\n    hanoi(3,'A','C','B');\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nvoid hanoi(int n, char src, char tgt, char aux) {}\nint main() {\n    hanoi(3,'A','C','B');\n}` },
    ],
    testCases: [
      { input: '3', expectedOutput: 'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B\nMove disk 3 from A to C\nMove disk 1 from B to A\nMove disk 2 from B to C\nMove disk 1 from A to C', isHidden: false },
      { input: '2', expectedOutput: 'Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C', isHidden: false },
    ],
    order: 44,
  },
  // 45. Recursion - Flatten Nested List
  {
    title: 'Count Digits Recursively',
    description: 'Write a recursive function that counts the number of digits in a positive integer n without converting to string.',
    difficulty: 'easy',
    tags: ['Recursion', 'Math'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the number of digits.',
    starterCode: [
      { language: 'python', code: `def count_digits(n):\n    # Use recursion\n    pass\n\nprint(count_digits(12345))\nprint(count_digits(7))` },
      { language: 'java', code: `public class Main {\n    public static int countDigits(int n) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(countDigits(12345));\n        System.out.println(countDigits(7));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint countDigits(int n) { return 0; }\nint main() {\n    printf("%d\\n", countDigits(12345));\n    printf("%d\\n", countDigits(7));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nint countDigits(int n) { return 0; }\nint main() {\n    cout<<countDigits(12345)<<endl;\n    cout<<countDigits(7)<<endl;\n}` },
    ],
    testCases: [
      { input: '12345', expectedOutput: '5', isHidden: false },
      { input: '7', expectedOutput: '1', isHidden: false },
      { input: '1000', expectedOutput: '4', isHidden: true },
    ],
    order: 45,
  },
  // 46. Binary Search - Search Insert Position
  {
    title: 'Search Insert Position',
    description: 'Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be inserted in order.\n\nYou must use an O(log n) algorithm.',
    difficulty: 'easy',
    tags: ['Arrays', 'Binary Search'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the index of target or its insertion position.',
    starterCode: [
      { language: 'python', code: `def search_insert(nums, target):\n    pass\n\nprint(search_insert([1,3,5,6], 5))\nprint(search_insert([1,3,5,6], 2))` },
      { language: 'java', code: `public class Main {\n    public static int searchInsert(int[] nums, int target) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(searchInsert(new int[]{1,3,5,6}, 5));\n        System.out.println(searchInsert(new int[]{1,3,5,6}, 2));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint searchInsert(int nums[], int size, int target) { return 0; }\nint main() {\n    int nums[]={1,3,5,6};\n    printf("%d\\n",searchInsert(nums,4,5));\n    printf("%d\\n",searchInsert(nums,4,2));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint searchInsert(vector<int>& nums, int target) { return 0; }\nint main() {\n    vector<int> nums={1,3,5,6};\n    cout<<searchInsert(nums,5)<<endl;\n    cout<<searchInsert(nums,2)<<endl;\n}` },
    ],
    testCases: [
      { input: '[1,3,5,6]\n5', expectedOutput: '2', isHidden: false },
      { input: '[1,3,5,6]\n2', expectedOutput: '1', isHidden: false },
      { input: '[1,3,5,6]\n7', expectedOutput: '4', isHidden: true },
    ],
    order: 46,
  },
  // 47. Binary Search - First and Last Position
  {
    title: 'First and Last Position of Element',
    description: 'Given a sorted array of integers `nums` and a target value, find the starting and ending position of the given target value.\n\nIf target is not found, return [-1, -1].',
    difficulty: 'medium',
    tags: ['Arrays', 'Binary Search'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print [first_index, last_index] or [-1, -1].',
    starterCode: [
      { language: 'python', code: `def search_range(nums, target):\n    pass\n\nprint(search_range([5,7,7,8,8,10], 8))` },
      { language: 'java', code: `import java.util.*;\npublic class Main {\n    public static int[] searchRange(int[] nums, int target) { return new int[]{-1,-1}; }\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(searchRange(new int[]{5,7,7,8,8,10},8)));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid searchRange(int nums[], int size, int target, int res[]) { res[0]=-1; res[1]=-1; }\nint main() {\n    int nums[]={5,7,7,8,8,10}, res[2];\n    searchRange(nums,6,8,res);\n    printf("[%d, %d]\\n",res[0],res[1]);\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nvector<int> searchRange(vector<int>& nums, int target) { return {-1,-1}; }\nint main() {\n    vector<int> nums={5,7,7,8,8,10};\n    auto res=searchRange(nums,8);\n    cout<<"["<<res[0]<<", "<<res[1]<<"]"<<endl;\n}` },
    ],
    testCases: [
      { input: '[5,7,7,8,8,10]\n8', expectedOutput: '[3, 4]', isHidden: false },
      { input: '[5,7,7,8,8,10]\n6', expectedOutput: '[-1, -1]', isHidden: false },
      { input: '[]\n0', expectedOutput: '[-1, -1]', isHidden: true },
    ],
    order: 47,
  },
  // 48. Binary Search - Find Peak Element
  {
    title: 'Find Peak Element',
    description: 'A peak element is an element that is strictly greater than its neighbors. Given an array `nums`, find a peak element and return its index. If the array has multiple peaks, return the index of any peak.\n\nYou must write an O(log n) solution.',
    difficulty: 'medium',
    tags: ['Arrays', 'Binary Search'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the index of a peak element.',
    starterCode: [
      { language: 'python', code: `def find_peak_element(nums):\n    pass\n\nprint(find_peak_element([1,2,3,1]))` },
      { language: 'java', code: `public class Main {\n    public static int findPeakElement(int[] nums) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(findPeakElement(new int[]{1,2,3,1}));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint findPeakElement(int nums[], int size) { return 0; }\nint main() {\n    int nums[]={1,2,3,1};\n    printf("%d\\n",findPeakElement(nums,4));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint findPeakElement(vector<int>& nums) { return 0; }\nint main() {\n    vector<int> nums={1,2,3,1};\n    cout<<findPeakElement(nums)<<endl;\n}` },
    ],
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: '2', isHidden: false },
      { input: '[1,2,1,3,5,6,4]', expectedOutput: '5', isHidden: false },
      { input: '[1]', expectedOutput: '0', isHidden: true },
    ],
    order: 48,
  },
  // 49. Binary Search - Square Root
  {
    title: 'Integer Square Root',
    description: 'Given a non-negative integer `x`, compute and return the integer square root of `x`.\n\nThe integer square root is the largest integer `r` such that r*r <= x. Do not use any built-in exponent functions or operators.',
    difficulty: 'easy',
    tags: ['Math', 'Binary Search'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the integer square root of x.',
    starterCode: [
      { language: 'python', code: `def my_sqrt(x):\n    # Use binary search\n    pass\n\nprint(my_sqrt(8))\nprint(my_sqrt(4))` },
      { language: 'java', code: `public class Main {\n    public static int mySqrt(int x) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(mySqrt(8));\n        System.out.println(mySqrt(4));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint mySqrt(int x) { return 0; }\nint main() {\n    printf("%d\\n", mySqrt(8));\n    printf("%d\\n", mySqrt(4));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nint mySqrt(int x) { return 0; }\nint main() {\n    cout<<mySqrt(8)<<endl;\n    cout<<mySqrt(4)<<endl;\n}` },
    ],
    testCases: [
      { input: '8', expectedOutput: '2', isHidden: false },
      { input: '4', expectedOutput: '2', isHidden: false },
      { input: '0', expectedOutput: '0', isHidden: true },
    ],
    order: 49,
  },
  // 50. Math - GCD and LCM
  {
    title: 'GCD and LCM',
    description: 'Given two positive integers `a` and `b`, compute and print their Greatest Common Divisor (GCD) and Least Common Multiple (LCM).\n\nPrint as: "GCD: X" and "LCM: Y"',
    difficulty: 'easy',
    tags: ['Math', 'Recursion'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print GCD and LCM on separate lines.',
    starterCode: [
      { language: 'python', code: `def gcd(a, b):\n    pass\n\ndef lcm(a, b):\n    pass\n\na, b = 12, 18\nprint(f"GCD: {gcd(a, b)}")\nprint(f"LCM: {lcm(a, b)}")` },
      { language: 'java', code: `public class Main {\n    public static int gcd(int a, int b) { return 0; }\n    public static int lcm(int a, int b) { return 0; }\n    public static void main(String[] args) {\n        System.out.println("GCD: " + gcd(12,18));\n        System.out.println("LCM: " + lcm(12,18));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint gcd(int a, int b) { return 0; }\nint lcm(int a, int b) { return 0; }\nint main() {\n    printf("GCD: %d\\nLCM: %d\\n", gcd(12,18), lcm(12,18));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nint gcd(int a, int b) { return 0; }\nint lcm(int a, int b) { return 0; }\nint main() {\n    cout<<"GCD: "<<gcd(12,18)<<endl;\n    cout<<"LCM: "<<lcm(12,18)<<endl;\n}` },
    ],
    testCases: [
      { input: '12\n18', expectedOutput: 'GCD: 6\nLCM: 36', isHidden: false },
      { input: '7\n13', expectedOutput: 'GCD: 1\nLCM: 91', isHidden: false },
      { input: '100\n75', expectedOutput: 'GCD: 25\nLCM: 300', isHidden: true },
    ],
    order: 50,
  },
  // 51. Math - Is Perfect Number
  {
    title: 'Perfect Number Check',
    description: 'A perfect number is a positive integer equal to the sum of its proper divisors (excluding itself).\n\nExample: 28 = 1 + 2 + 4 + 7 + 14. Return True if n is perfect, False otherwise.',
    difficulty: 'easy',
    tags: ['Math', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print True if perfect number, False otherwise.',
    starterCode: [
      { language: 'python', code: `def is_perfect(n):\n    pass\n\nprint(is_perfect(28))\nprint(is_perfect(12))` },
      { language: 'java', code: `public class Main {\n    public static boolean isPerfect(int n) { return false; }\n    public static void main(String[] args) {\n        System.out.println(isPerfect(28));\n        System.out.println(isPerfect(12));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\n#include <stdbool.h>\nbool isPerfect(int n) { return false; }\nint main() {\n    printf("%s\\n", isPerfect(28)?"True":"False");\n    printf("%s\\n", isPerfect(12)?"True":"False");\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nbool isPerfect(int n) { return false; }\nint main() {\n    cout<<(isPerfect(28)?"True":"False")<<endl;\n    cout<<(isPerfect(12)?"True":"False")<<endl;\n}` },
    ],
    testCases: [
      { input: '28', expectedOutput: 'True', isHidden: false },
      { input: '12', expectedOutput: 'False', isHidden: false },
      { input: '6', expectedOutput: 'True', isHidden: true },
    ],
    order: 51,
  },
  // 52. Math - Roman to Integer
  {
    title: 'Roman to Integer',
    description: 'Given a roman numeral string `s`, convert it to an integer.\n\nRoman numerals: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.\nSubtraction rules apply (e.g., IV=4, IX=9).',
    difficulty: 'easy',
    tags: ['Math', 'Strings', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the integer value of the roman numeral.',
    starterCode: [
      { language: 'python', code: `def roman_to_int(s):\n    pass\n\nprint(roman_to_int("III"))\nprint(roman_to_int("LVIII"))\nprint(roman_to_int("MCMXCIV"))` },
      { language: 'java', code: `public class Main {\n    public static int romanToInt(String s) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(romanToInt("III"));\n        System.out.println(romanToInt("LVIII"));\n        System.out.println(romanToInt("MCMXCIV"));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint romanToInt(char* s) { return 0; }\nint main() {\n    printf("%d\\n", romanToInt("III"));\n    printf("%d\\n", romanToInt("MCMXCIV"));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <string>\nusing namespace std;\nint romanToInt(string s) { return 0; }\nint main() {\n    cout<<romanToInt("III")<<endl;\n    cout<<romanToInt("MCMXCIV")<<endl;\n}` },
    ],
    testCases: [
      { input: 'III', expectedOutput: '3', isHidden: false },
      { input: 'LVIII', expectedOutput: '58', isHidden: false },
      { input: 'MCMXCIV', expectedOutput: '1994', isHidden: true },
    ],
    order: 52,
  },
  // 53. Math - Palindrome Number
  {
    title: 'Palindrome Number',
    description: 'Given an integer `x`, return True if `x` is a palindrome, and False otherwise.\n\nAn integer is a palindrome when it reads the same backward as forward. Negative numbers are not palindromes.\n\nDo not convert the integer to a string.',
    difficulty: 'easy',
    tags: ['Math'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print True if x is palindrome, else False.',
    starterCode: [
      { language: 'python', code: `def is_palindrome(x):\n    # Do not convert to string\n    pass\n\nprint(is_palindrome(121))\nprint(is_palindrome(-121))\nprint(is_palindrome(10))` },
      { language: 'java', code: `public class Main {\n    public static boolean isPalindrome(int x) { return false; }\n    public static void main(String[] args) {\n        System.out.println(isPalindrome(121));\n        System.out.println(isPalindrome(-121));\n        System.out.println(isPalindrome(10));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\n#include <stdbool.h>\nbool isPalindrome(int x) { return false; }\nint main() {\n    printf("%s\\n", isPalindrome(121)?"True":"False");\n    printf("%s\\n", isPalindrome(-121)?"True":"False");\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nbool isPalindrome(int x) { return false; }\nint main() {\n    cout<<(isPalindrome(121)?"True":"False")<<endl;\n    cout<<(isPalindrome(-121)?"True":"False")<<endl;\n}` },
    ],
    testCases: [
      { input: '121', expectedOutput: 'True', isHidden: false },
      { input: '-121', expectedOutput: 'False', isHidden: false },
      { input: '10', expectedOutput: 'False', isHidden: true },
    ],
    order: 53,
  },
];
