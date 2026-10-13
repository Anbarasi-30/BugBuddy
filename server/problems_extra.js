// Extra problems 24-35 (Arrays, Strings, Loops, Two Pointers)
module.exports = [
  // 24. Arrays - Rotate Array
  {
    title: 'Rotate Array',
    description: 'Given an array `nums` and an integer `k`, rotate the array to the right by `k` steps.\n\nExample: nums = [1,2,3,4,5,6,7], k = 3 → [5,6,7,1,2,3,4]',
    difficulty: 'medium',
    tags: ['Arrays', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the rotated array.',
    starterCode: [
      { language: 'python', code: `def rotate(nums, k):\n    # Rotate array right by k steps\n    pass\n\nnums = [1,2,3,4,5,6,7]\nrotate(nums, 3)\nprint(nums)` },
      { language: 'java', code: `import java.util.*;\npublic class Main {\n    public static void rotate(int[] nums, int k) {}\n    public static void main(String[] args) {\n        int[] nums = {1,2,3,4,5,6,7};\n        rotate(nums, 3);\n        System.out.println(Arrays.toString(nums));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid rotate(int nums[], int size, int k) {}\nint main() {\n    int nums[] = {1,2,3,4,5,6,7};\n    rotate(nums, 7, 3);\n    for(int i=0;i<7;i++) printf("%d%s",nums[i],i<6?", ":"\\n");\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nvoid rotate(vector<int>& nums, int k) {}\nint main() {\n    vector<int> nums = {1,2,3,4,5,6,7};\n    rotate(nums, 3);\n    for(int i=0;i<(int)nums.size();i++) cout<<nums[i]<<(i<(int)nums.size()-1?", ":"\\n");\n}` },
    ],
    testCases: [
      { input: '[1,2,3,4,5,6,7]\n3', expectedOutput: '[5, 6, 7, 1, 2, 3, 4]', isHidden: false },
      { input: '[-1,-100,3,99]\n2', expectedOutput: '[3, 99, -1, -100]', isHidden: false },
      { input: '[1,2]\n3', expectedOutput: '[2, 1]', isHidden: true },
    ],
    order: 24,
  },
  // 25. Arrays - Product of Array Except Self
  {
    title: 'Product of Array Except Self',
    description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`.\n\nYou must not use the division operator.',
    difficulty: 'medium',
    tags: ['Arrays'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the product array.',
    starterCode: [
      { language: 'python', code: `def product_except_self(nums):\n    # No division allowed\n    pass\n\nprint(product_except_self([1,2,3,4]))` },
      { language: 'java', code: `import java.util.*;\npublic class Main {\n    public static int[] productExceptSelf(int[] nums) { return new int[]{}; }\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(productExceptSelf(new int[]{1,2,3,4})));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid productExceptSelf(int nums[], int size, int res[]) {}\nint main() {\n    int nums[]={1,2,3,4}, res[4];\n    productExceptSelf(nums,4,res);\n    printf("[%d, %d, %d, %d]\\n",res[0],res[1],res[2],res[3]);\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nvector<int> productExceptSelf(vector<int>& nums) { return {}; }\nint main() {\n    vector<int> nums={1,2,3,4};\n    auto res=productExceptSelf(nums);\n    cout<<"[";\n    for(int i=0;i<(int)res.size();i++) cout<<res[i]<<(i<(int)res.size()-1?", ":"");\n    cout<<"]"<<endl;\n}` },
    ],
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24, 12, 8, 6]', isHidden: false },
      { input: '[2,3]', expectedOutput: '[3, 2]', isHidden: false },
      { input: '[-1,1,0,-3,3]', expectedOutput: '[0, 0, 9, 0, 0]', isHidden: true },
    ],
    order: 25,
  },
  // 26. Arrays - Subarray Sum Equals K
  {
    title: 'Subarray Sum Equals K',
    description: 'Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals `k`.',
    difficulty: 'medium',
    tags: ['Arrays', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the count of subarrays with sum equal to k.',
    starterCode: [
      { language: 'python', code: `def subarray_sum(nums, k):\n    pass\n\nprint(subarray_sum([1,1,1], 2))` },
      { language: 'java', code: `public class Main {\n    public static int subarraySum(int[] nums, int k) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(subarraySum(new int[]{1,1,1}, 2));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint subarraySum(int nums[], int size, int k) { return 0; }\nint main() {\n    int nums[]={1,1,1};\n    printf("%d\\n", subarraySum(nums,3,2));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint subarraySum(vector<int>& nums, int k) { return 0; }\nint main() {\n    vector<int> nums={1,1,1};\n    cout<<subarraySum(nums,2)<<endl;\n}` },
    ],
    testCases: [
      { input: '[1,1,1]\n2', expectedOutput: '2', isHidden: false },
      { input: '[1,2,3]\n3', expectedOutput: '2', isHidden: false },
      { input: '[1]\n0', expectedOutput: '0', isHidden: true },
    ],
    order: 26,
  },
  // 27. Arrays - Max Consecutive Ones
  {
    title: 'Max Consecutive Ones',
    description: 'Given a binary array `nums`, return the maximum number of consecutive 1s in the array.',
    difficulty: 'easy',
    tags: ['Arrays', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the maximum number of consecutive 1s.',
    starterCode: [
      { language: 'python', code: `def find_max_consecutive_ones(nums):\n    pass\n\nprint(find_max_consecutive_ones([1,1,0,1,1,1]))` },
      { language: 'java', code: `public class Main {\n    public static int findMaxConsecutiveOnes(int[] nums) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(findMaxConsecutiveOnes(new int[]{1,1,0,1,1,1}));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint findMaxConsecutiveOnes(int nums[], int size) { return 0; }\nint main() {\n    int nums[]={1,1,0,1,1,1};\n    printf("%d\\n",findMaxConsecutiveOnes(nums,6));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint findMaxConsecutiveOnes(vector<int>& nums) { return 0; }\nint main() {\n    vector<int> nums={1,1,0,1,1,1};\n    cout<<findMaxConsecutiveOnes(nums)<<endl;\n}` },
    ],
    testCases: [
      { input: '[1,1,0,1,1,1]', expectedOutput: '3', isHidden: false },
      { input: '[1,0,1,1,0,1]', expectedOutput: '2', isHidden: false },
      { input: '[0,0,0]', expectedOutput: '0', isHidden: true },
    ],
    order: 27,
  },
  // 28. Strings - Anagram Check
  {
    title: 'Valid Anagram',
    description: 'Given two strings `s` and `t`, return True if `t` is an anagram of `s`, and False otherwise.\n\nAn anagram uses the same characters the same number of times.',
    difficulty: 'easy',
    tags: ['Strings', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print True if anagram, False otherwise.',
    starterCode: [
      { language: 'python', code: `def is_anagram(s, t):\n    pass\n\nprint(is_anagram("anagram", "nagaram"))` },
      { language: 'java', code: `public class Main {\n    public static boolean isAnagram(String s, String t) { return false; }\n    public static void main(String[] args) {\n        System.out.println(isAnagram("anagram","nagaram"));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\n#include <stdbool.h>\nbool isAnagram(char* s, char* t) { return false; }\nint main() {\n    printf("%s\\n", isAnagram("anagram","nagaram")?"True":"False");\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <string>\nusing namespace std;\nbool isAnagram(string s, string t) { return false; }\nint main() {\n    cout<<(isAnagram("anagram","nagaram")?"True":"False")<<endl;\n}` },
    ],
    testCases: [
      { input: 'anagram\nnagaram', expectedOutput: 'True', isHidden: false },
      { input: 'rat\ncar', expectedOutput: 'False', isHidden: false },
      { input: 'a\nab', expectedOutput: 'False', isHidden: true },
    ],
    order: 28,
  },
  // 29. Strings - Longest Common Prefix
  {
    title: 'Longest Common Prefix',
    description: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".',
    difficulty: 'easy',
    tags: ['Strings', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the longest common prefix, or empty string if none.',
    starterCode: [
      { language: 'python', code: `def longest_common_prefix(strs):\n    pass\n\nprint(longest_common_prefix(["flower","flow","flight"]))` },
      { language: 'java', code: `public class Main {\n    public static String longestCommonPrefix(String[] strs) { return ""; }\n    public static void main(String[] args) {\n        System.out.println(longestCommonPrefix(new String[]{"flower","flow","flight"}));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\n#include <string.h>\nvoid longestCommonPrefix(char* strs[], int n, char* result) { result[0]='\\0'; }\nint main() {\n    char* strs[]={"flower","flow","flight"};\n    char res[100];\n    longestCommonPrefix(strs,3,res);\n    printf("%s\\n",res);\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\nstring longestCommonPrefix(vector<string>& strs) { return ""; }\nint main() {\n    vector<string> strs={"flower","flow","flight"};\n    cout<<longestCommonPrefix(strs)<<endl;\n}` },
    ],
    testCases: [
      { input: '["flower","flow","flight"]', expectedOutput: 'fl', isHidden: false },
      { input: '["dog","racecar","car"]', expectedOutput: '(empty)', isHidden: false },
      { input: '["interview","interact","internal"]', expectedOutput: 'inter', isHidden: true },
    ],
    order: 29,
  },
  // 30. Strings - Reverse Words in a String
  {
    title: 'Reverse Words in a String',
    description: 'Given a string `s`, reverse the order of the words.\n\nA word is a sequence of non-space characters. Words in `s` are separated by at least one space.\n\nExample: "the sky is blue" → "blue is sky the"',
    difficulty: 'medium',
    tags: ['Strings', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the string with words in reversed order.',
    starterCode: [
      { language: 'python', code: `def reverse_words(s):\n    pass\n\nprint(reverse_words("the sky is blue"))` },
      { language: 'java', code: `public class Main {\n    public static String reverseWords(String s) { return ""; }\n    public static void main(String[] args) {\n        System.out.println(reverseWords("the sky is blue"));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid reverseWords(char* s, char* result) { result[0]='\\0'; }\nint main() {\n    char res[200];\n    reverseWords("the sky is blue", res);\n    printf("%s\\n", res);\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <string>\nusing namespace std;\nstring reverseWords(string s) { return ""; }\nint main() {\n    cout<<reverseWords("the sky is blue")<<endl;\n}` },
    ],
    testCases: [
      { input: 'the sky is blue', expectedOutput: 'blue is sky the', isHidden: false },
      { input: '  hello world  ', expectedOutput: 'world hello', isHidden: false },
      { input: 'a good   example', expectedOutput: 'example good a', isHidden: true },
    ],
    order: 30,
  },
  // 31. Strings - Count Words in a Sentence
  {
    title: 'Count Words in a Sentence',
    description: 'Given a string `sentence`, count the number of words in it. Words are separated by one or more spaces.\n\nReturn the word count.',
    difficulty: 'easy',
    tags: ['Strings', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the number of words.',
    starterCode: [
      { language: 'python', code: `def count_words(sentence):\n    pass\n\nprint(count_words("Hello world how are you"))` },
      { language: 'java', code: `public class Main {\n    public static int countWords(String sentence) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(countWords("Hello world how are you"));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\n#include <string.h>\nint countWords(char* sentence) { return 0; }\nint main() {\n    printf("%d\\n", countWords("Hello world how are you"));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <string>\nusing namespace std;\nint countWords(string sentence) { return 0; }\nint main() {\n    cout<<countWords("Hello world how are you")<<endl;\n}` },
    ],
    testCases: [
      { input: 'Hello world how are you', expectedOutput: '5', isHidden: false },
      { input: 'one', expectedOutput: '1', isHidden: false },
      { input: '  spaces   between   words ', expectedOutput: '3', isHidden: true },
    ],
    order: 31,
  },
  // 32. Loops - Print Multiplication Table
  {
    title: 'Multiplication Table',
    description: 'Given an integer `n`, print its multiplication table from 1 to 10.\n\nEach line should be in the format: "n x i = result"',
    difficulty: 'easy',
    tags: ['Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the multiplication table for n from 1 to 10.',
    starterCode: [
      { language: 'python', code: `def print_table(n):\n    for i in range(1, 11):\n        pass  # print each line\n\nprint_table(5)` },
      { language: 'java', code: `public class Main {\n    public static void printTable(int n) {\n        for(int i=1;i<=10;i++) {\n            // print each line\n        }\n    }\n    public static void main(String[] args) { printTable(5); }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid printTable(int n) {\n    for(int i=1;i<=10;i++) {\n        // print each line\n    }\n}\nint main() { printTable(5); return 0; }` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nvoid printTable(int n) {\n    for(int i=1;i<=10;i++) {\n        // print each line\n    }\n}\nint main() { printTable(5); }` },
    ],
    testCases: [
      { input: '5', expectedOutput: '5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50', isHidden: false },
      { input: '1', expectedOutput: '1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10', isHidden: true },
    ],
    order: 32,
  },
  // 33. Loops - FizzBuzz
  {
    title: 'FizzBuzz',
    description: 'Print numbers from 1 to n. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both 3 and 5 print "FizzBuzz", otherwise print the number.',
    difficulty: 'easy',
    tags: ['Loops', 'Conditions'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print FizzBuzz sequence from 1 to n.',
    starterCode: [
      { language: 'python', code: `def fizz_buzz(n):\n    for i in range(1, n+1):\n        pass  # print Fizz, Buzz, FizzBuzz or number\n\nfizz_buzz(15)` },
      { language: 'java', code: `public class Main {\n    public static void fizzBuzz(int n) {\n        for(int i=1;i<=n;i++) {\n            // print Fizz, Buzz, FizzBuzz or i\n        }\n    }\n    public static void main(String[] args) { fizzBuzz(15); }\n}` },
      { language: 'c', code: `#include <stdio.h>\nvoid fizzBuzz(int n) {\n    for(int i=1;i<=n;i++) {}\n}\nint main() { fizzBuzz(15); return 0; }` },
      { language: 'cpp', code: `#include <iostream>\nusing namespace std;\nvoid fizzBuzz(int n) {\n    for(int i=1;i<=n;i++) {}\n}\nint main() { fizzBuzz(15); }` },
    ],
    testCases: [
      { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: false },
      { input: '3', expectedOutput: '1\n2\nFizz', isHidden: false },
    ],
    order: 33,
  },
  // 34. Two Pointers - Container With Most Water
  {
    title: 'Container With Most Water',
    description: 'Given an integer array `height` of length n, find two lines that together with the x-axis form a container that stores the most water.\n\nReturn the maximum amount of water the container can store.',
    difficulty: 'medium',
    tags: ['Arrays', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the maximum water the container can hold.',
    starterCode: [
      { language: 'python', code: `def max_area(height):\n    # Use two pointers\n    pass\n\nprint(max_area([1,8,6,2,5,4,8,3,7]))` },
      { language: 'java', code: `public class Main {\n    public static int maxArea(int[] height) { return 0; }\n    public static void main(String[] args) {\n        System.out.println(maxArea(new int[]{1,8,6,2,5,4,8,3,7}));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\nint maxArea(int height[], int size) { return 0; }\nint main() {\n    int h[]={1,8,6,2,5,4,8,3,7};\n    printf("%d\\n",maxArea(h,9));\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint maxArea(vector<int>& height) { return 0; }\nint main() {\n    vector<int> h={1,8,6,2,5,4,8,3,7};\n    cout<<maxArea(h)<<endl;\n}` },
    ],
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isHidden: false },
      { input: '[1,1]', expectedOutput: '1', isHidden: false },
      { input: '[4,3,2,1,4]', expectedOutput: '16', isHidden: true },
    ],
    order: 34,
  },
  // 35. Two Pointers - Three Sum
  {
    title: 'Three Sum',
    description: 'Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0.\n\nThe solution set must not contain duplicate triplets.',
    difficulty: 'medium',
    tags: ['Arrays', 'Two Pointer', 'Sorting'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print all unique triplets that sum to zero.',
    starterCode: [
      { language: 'python', code: `def three_sum(nums):\n    # Sort, then use two pointers\n    pass\n\nprint(three_sum([-1,0,1,2,-1,-4]))` },
      { language: 'java', code: `import java.util.*;\npublic class Main {\n    public static List<List<Integer>> threeSum(int[] nums) { return new ArrayList<>(); }\n    public static void main(String[] args) {\n        System.out.println(threeSum(new int[]{-1,0,1,2,-1,-4}));\n    }\n}` },
      { language: 'c', code: `#include <stdio.h>\n#include <stdlib.h>\nvoid threeSum(int nums[], int size) {}\nint main() {\n    int nums[]={-1,0,1,2,-1,-4};\n    threeSum(nums,6);\n    return 0;\n}` },
      { language: 'cpp', code: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nvector<vector<int>> threeSum(vector<int>& nums) { return {}; }\nint main() {\n    vector<int> nums={-1,0,1,2,-1,-4};\n    auto res=threeSum(nums);\n    for(auto& t:res) cout<<"["<<t[0]<<","<<t[1]<<","<<t[2]<<"]";\n    cout<<endl;\n}` },
    ],
    testCases: [
      { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1, -1, 2], [-1, 0, 1]]', isHidden: false },
      { input: '[0,1,1]', expectedOutput: '[]', isHidden: false },
      { input: '[0,0,0]', expectedOutput: '[[0, 0, 0]]', isHidden: true },
    ],
    order: 35,
  },
];
