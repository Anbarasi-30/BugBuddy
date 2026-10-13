/**
 * Database Seeder
 * 
 * Seeds the database with 23 curated coding problems supporting Python, Java, C, and C++.
 * Run with: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');

const PROBLEMS = [
  // -------------------------------------------------------------------------
  // Existing Problems (1 - 8)
  // -------------------------------------------------------------------------
  {
    title: 'Two Sum',
    description:
      'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nReturn the answer in any order.',
    difficulty: 'easy',
    tags: ['Arrays', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Return a list/array of two indices whose values sum to the target.',
    starterCode: [
      {
        language: 'python',
        code: `def two_sum(nums, target):
    # Write your solution here
    pass

# Test
nums = [2, 7, 11, 15]
target = 9
print(two_sum(nums, target))`,
      },
      {
        language: 'java',
        code: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        System.out.println(Arrays.toString(twoSum(nums, target)));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <stdlib.h>

void twoSum(int nums[], int size, int target, int result[]) {
    // Write your solution here
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int result[2];
    twoSum(nums, 4, 9, result);
    printf("[%d, %d]\\n", result[0], result[1]);
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your solution here
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    vector<int> res = twoSum(nums, 9);
    cout << "[" << res[0] << ", " << res[1] << "]" << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0, 1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1, 2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0, 1]', isHidden: true },
    ],
    order: 1,
  },
  {
    title: 'Reverse String',
    description:
      'Write a function that reverses a string. The input is given as an array of characters.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    difficulty: 'easy',
    tags: ['Strings', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Reverse the array of characters in-place and print the result.',
    starterCode: [
      {
        language: 'python',
        code: `def reverse_string(s):
    # Modify s in-place
    pass

s = ['h', 'e', 'l', 'l', 'o']
reverse_string(s)
print(s)`,
      },
      {
        language: 'java',
        code: `import java.util.*;

public class Main {
    public static void reverseString(char[] s) {
        // Modify s in-place
    }

    public static void main(String[] args) {
        char[] s = {'h', 'e', 'l', 'l', 'o'};
        reverseString(s);
        System.out.println(Arrays.toString(s));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <string.h>

void reverseString(char s[], int len) {
    // Modify s in-place
}

int main() {
    char s[] = {'h', 'e', 'l', 'l', 'o'};
    reverseString(s, 5);
    printf("%s\\n", s);
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

void reverseString(vector<char>& s) {
    // Modify s in-place
}

int main() {
    vector<char> s = {'h', 'e', 'l', 'l', 'o'};
    reverseString(s);
    return 0;
}`,
      },
    ],
    testCases: [
      { input: "['h','e','l','l','o']", expectedOutput: "['o', 'l', 'l', 'e', 'h']", isHidden: false },
      { input: "['H','a','n','n','a','h']", expectedOutput: "['h', 'a', 'n', 'n', 'a', 'H']", isHidden: false },
    ],
    order: 2,
  },
  {
    title: 'Find Maximum in Array',
    description:
      'Given an array of integers, find and return the maximum value in the array.\n\nDo not use built-in max() functions — implement the loop yourself.',
    difficulty: 'easy',
    tags: ['Arrays', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the maximum integer in the array.',
    starterCode: [
      {
        language: 'python',
        code: `def find_max(nums):
    # Find the maximum without using max()
    pass

nums = [3, 1, 4, 1, 5, 9, 2, 6]
print(find_max(nums))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int findMax(int[] nums) {
        // Find the maximum without using Math.max or Arrays.sort
        return 0;
    }

    public static void main(String[] args) {
        int[] nums = {3, 1, 4, 1, 5, 9, 2, 6};
        System.out.println(findMax(nums));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int findMax(int nums[], int size) {
    // Find maximum without using built-ins
    return 0;
}

int main() {
    int nums[] = {3, 1, 4, 1, 5, 9, 2, 6};
    printf("%d\\n", findMax(nums, 8));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

int findMax(vector<int>& nums) {
    // Find maximum without using std::max
    return 0;
}

int main() {
    vector<int> nums = {3, 1, 4, 1, 5, 9, 2, 6};
    cout << findMax(nums) << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[3,1,4,1,5,9,2,6]', expectedOutput: '9', isHidden: false },
      { input: '[-1,-5,-2]', expectedOutput: '-1', isHidden: false },
      { input: '[100]', expectedOutput: '100', isHidden: true },
    ],
    order: 3,
  },
  {
    title: 'Count Occurrences',
    description:
      'Given a list of words and a target word, count how many times the target appears in the list.\n\nReturn the count.',
    difficulty: 'easy',
    tags: ['Arrays', 'Loops', 'Strings'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the number of times the target word appears in the list.',
    starterCode: [
      {
        language: 'python',
        code: `def count_occurrences(words, target):
    # Count without using .count()
    pass

words = ['apple', 'banana', 'apple', 'cherry', 'apple']
target = 'apple'
print(count_occurrences(words, target))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int countOccurrences(String[] words, String target) {
        // Count without using any library methods
        return 0;
    }

    public static void main(String[] args) {
        String[] words = {"apple", "banana", "apple", "cherry", "apple"};
        System.out.println(countOccurrences(words, "apple"));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <string.h>

int countOccurrences(char* words[], int count, char* target) {
    return 0;
}

int main() {
    char* words[] = {"apple", "banana", "apple", "cherry", "apple"};
    printf("%d\\n", countOccurrences(words, 5, "apple"));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int countOccurrences(vector<string>& words, string target) {
    return 0;
}

int main() {
    vector<string> words = {"apple", "banana", "apple", "cherry", "apple"};
    cout << countOccurrences(words, "apple") << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: "['apple','banana','apple','cherry','apple']\napple", expectedOutput: '3', isHidden: false },
      { input: "['dog','cat','bird']\nfish", expectedOutput: '0', isHidden: false },
    ],
    order: 4,
  },
  {
    title: 'Valid Parentheses',
    description:
      'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n- Open brackets must be closed by the same type of brackets.\n- Open brackets must be closed in the correct order.',
    difficulty: 'medium',
    tags: ['Strings', 'Conditions'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print True if the string has valid parentheses, False otherwise.',
    starterCode: [
      {
        language: 'python',
        code: `def is_valid(s):
    # Use a stack to track opening brackets
    pass

print(is_valid("()"))
print(is_valid("()[]{}"))
print(is_valid("(]"))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static boolean isValid(String s) {
        // Use a stack to track opening brackets
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isValid("()"));
        System.out.println(isValid("()[]{}"));
        System.out.println(isValid("(]"));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <stdbool.h>

bool isValid(char* s) {
    return false;
}

int main() {
    printf("%s\\n", isValid("()") ? "True" : "False");
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
using namespace std;

bool isValid(string s) {
    return false;
}

int main() {
    cout << (isValid("()") ? "True" : "False") << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '()', expectedOutput: 'True', isHidden: false },
      { input: '()[]{}', expectedOutput: 'True', isHidden: false },
      { input: '(]', expectedOutput: 'False', isHidden: false },
      { input: '([)]', expectedOutput: 'False', isHidden: true },
    ],
    order: 5,
  },
  {
    title: 'Fibonacci Sequence',
    description:
      'Write a function that returns the nth Fibonacci number.\n\nThe Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...\n\nFib(0) = 0, Fib(1) = 1, Fib(n) = Fib(n-1) + Fib(n-2)\n\nUse an iterative approach (not recursive) for efficiency.',
    difficulty: 'medium',
    tags: ['Loops', 'Recursion'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the nth Fibonacci number.',
    starterCode: [
      {
        language: 'python',
        code: `def fibonacci(n):
    # Implement iteratively
    pass

print(fibonacci(0))
print(fibonacci(1))
print(fibonacci(7))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int fibonacci(int n) {
        // Implement iteratively
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(fibonacci(0));
        System.out.println(fibonacci(1));
        System.out.println(fibonacci(7));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int fibonacci(int n) {
    return 0;
}

int main() {
    printf("%d\\n", fibonacci(7));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
using namespace std;

int fibonacci(int n) {
    return 0;
}

int main() {
    cout << fibonacci(7) << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '0', expectedOutput: '0', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '7', expectedOutput: '13', isHidden: false },
      { input: '10', expectedOutput: '55', isHidden: true },
    ],
    order: 6,
  },
  {
    title: 'Merge Sorted Arrays',
    description:
      'Given two sorted integer arrays `nums1` and `nums2`, merge them into a single sorted array.\n\nReturn the merged sorted array.',
    difficulty: 'medium',
    tags: ['Arrays', 'Sorting', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the merged and sorted array.',
    starterCode: [
      {
        language: 'python',
        code: `def merge_sorted(nums1, nums2):
    # Merge without using sorted()
    pass

print(merge_sorted([1, 3, 5], [2, 4, 6]))
print(merge_sorted([1, 2, 3], [4, 5, 6]))`,
      },
      {
        language: 'java',
        code: `import java.util.*;

public class Main {
    public static int[] mergeSorted(int[] nums1, int[] nums2) {
        // Implement merge without using Arrays.sort
        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(mergeSorted(new int[]{1,3,5}, new int[]{2,4,6})));
        System.out.println(Arrays.toString(mergeSorted(new int[]{1,2,3}, new int[]{4,5,6})));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

void mergeSorted(int n1[], int s1, int n2[], int s2, int res[]) {
    // Implement merge
}

int main() {
    int n1[] = {1, 3, 5}, n2[] = {2, 4, 6}, res[6];
    mergeSorted(n1, 3, n2, 3, res);
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> mergeSorted(vector<int>& nums1, vector<int>& nums2) {
    return {};
}

int main() {
    vector<int> n1 = {1, 3, 5}, n2 = {2, 4, 6};
    vector<int> res = mergeSorted(n1, n2);
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[1,3,5]\n[2,4,6]', expectedOutput: '[1, 2, 3, 4, 5, 6]', isHidden: false },
      { input: '[1,2,3]\n[4,5,6]', expectedOutput: '[1, 2, 3, 4, 5, 6]', isHidden: false },
    ],
    order: 7,
  },
  {
    title: 'Binary Search',
    description:
      'Given a sorted array of distinct integers and a target value, return the index if the target is found.\n\nIf not found, return -1.\n\nYou must implement the binary search algorithm — do not use linear search.',
    difficulty: 'medium',
    tags: ['Arrays', 'Sorting'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the index of the target, or -1 if not found.',
    starterCode: [
      {
        language: 'python',
        code: `def binary_search(nums, target):
    # Implement binary search
    pass

print(binary_search([-1, 0, 3, 5, 9, 12], 9))
print(binary_search([-1, 0, 3, 5, 9, 12], 2))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int binarySearch(int[] nums, int target) {
        // Implement binary search
        return -1;
    }

    public static void main(String[] args) {
        int[] nums = {-1, 0, 3, 5, 9, 12};
        System.out.println(binarySearch(nums, 9));
        System.out.println(binarySearch(nums, 2));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int binarySearch(int nums[], int size, int target) {
    return -1;
}

int main() {
    int nums[] = {-1, 0, 3, 5, 9, 12};
    printf("%d\\n", binarySearch(nums, 6, 9));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& nums, int target) {
    return -1;
}

int main() {
    vector<int> nums = {-1, 0, 3, 5, 9, 12};
    cout << binarySearch(nums, 9) << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
      { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
      { input: '[5]\n5', expectedOutput: '0', isHidden: true },
    ],
    order: 8,
  },

  // -------------------------------------------------------------------------
  // NEW CURATED PROBLEMS (9 - 23)
  // -------------------------------------------------------------------------

  // 9. ARRAYS: Second Largest Element
  {
    title: 'Second Largest Element',
    description:
      'Given an array of integers `nums`, find and return the second largest element in the array.\n\nIf no distinct second largest element exists (e.g. all elements are equal or array size is less than 2), return -1.',
    difficulty: 'easy',
    tags: ['Arrays', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the second largest integer, or -1 if non-existent.',
    starterCode: [
      {
        language: 'python',
        code: `def second_largest(nums):
    # Find second largest element without built-in sort
    pass

nums = [12, 35, 1, 10, 34, 1]
print(second_largest(nums))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int secondLargest(int[] nums) {
        // Write your solution here
        return -1;
    }

    public static void main(String[] args) {
        int[] nums = {12, 35, 1, 10, 34, 1};
        System.out.println(secondLargest(nums));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int secondLargest(int nums[], int size) {
    return -1;
}

int main() {
    int nums[] = {12, 35, 1, 10, 34, 1};
    printf("%d\\n", secondLargest(nums, 6));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

int secondLargest(vector<int>& nums) {
    return -1;
}

int main() {
    vector<int> nums = {12, 35, 1, 10, 34, 1};
    cout << secondLargest(nums) << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[12,35,1,10,34,1]', expectedOutput: '34', isHidden: false },
      { input: '[10,10,10]', expectedOutput: '-1', isHidden: false },
      { input: '[5,2]', expectedOutput: '2', isHidden: true },
    ],
    order: 9,
  },

  // 10. ARRAYS: Remove Duplicates from Sorted Array
  {
    title: 'Remove Duplicates from Sorted Array',
    description:
      'Given a sorted array of integers `nums`, remove the duplicate elements such that each element appears only once.\n\nReturn the list/array of unique elements in original sorted order.',
    difficulty: 'easy',
    tags: ['Arrays', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the array of unique sorted elements.',
    starterCode: [
      {
        language: 'python',
        code: `def remove_duplicates(nums):
    # Return array of unique elements
    pass

nums = [1, 1, 2]
print(remove_duplicates(nums))`,
      },
      {
        language: 'java',
        code: `import java.util.*;

public class Main {
    public static int[] removeDuplicates(int[] nums) {
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums = {1, 1, 2};
        System.out.println(Arrays.toString(removeDuplicates(nums)));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int removeDuplicates(int nums[], int size, int result[]) {
    return 0;
}

int main() {
    int nums[] = {1, 1, 2}, res[10];
    int len = removeDuplicates(nums, 3, res);
    printf("[%d, %d]\\n", res[0], res[1]);
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> removeDuplicates(vector<int>& nums) {
    return {};
}

int main() {
    vector<int> nums = {1, 1, 2};
    vector<int> res = removeDuplicates(nums);
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[1,1,2]', expectedOutput: '[1, 2]', isHidden: false },
      { input: '[0,0,1,1,2,2,3]', expectedOutput: '[0, 1, 2, 3]', isHidden: false },
    ],
    order: 10,
  },

  // 11. ARRAYS: Move Zeros to the End
  {
    title: 'Move Zeros to the End',
    description:
      'Given an array of integers `nums`, move all zeros to the end of the array while maintaining the relative order of non-zero elements.\n\nReturn the modified array.',
    difficulty: 'easy',
    tags: ['Arrays', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the array with zeros moved to the end.',
    starterCode: [
      {
        language: 'python',
        code: `def move_zeros(nums):
    # Move all zeros to end in-place or return modified list
    pass

nums = [0, 1, 0, 3, 12]
print(move_zeros(nums))`,
      },
      {
        language: 'java',
        code: `import java.util.*;

public class Main {
    public static int[] moveZeros(int[] nums) {
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums = {0, 1, 0, 3, 12};
        System.out.println(Arrays.toString(moveZeros(nums)));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

void moveZeros(int nums[], int size) {
}

int main() {
    int nums[] = {0, 1, 0, 3, 12};
    moveZeros(nums, 5);
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> moveZeros(vector<int>& nums) {
    return {};
}

int main() {
    vector<int> nums = {0, 1, 0, 3, 12};
    vector<int> res = moveZeros(nums);
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[0,1,0,3,12]', expectedOutput: '[1, 3, 12, 0, 0]', isHidden: false },
      { input: '[0]', expectedOutput: '[0]', isHidden: false },
    ],
    order: 11,
  },

  // 12. ARRAYS: Find Missing Number
  {
    title: 'Find Missing Number',
    description:
      'Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.',
    difficulty: 'easy',
    tags: ['Arrays', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the missing integer in the range [0, n].',
    starterCode: [
      {
        language: 'python',
        code: `def missing_number(nums):
    # Find missing number in range 0..n
    pass

nums = [3, 0, 1]
print(missing_number(nums))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int missingNumber(int[] nums) {
        return 0;
    }

    public static void main(String[] args) {
        int[] nums = {3, 0, 1};
        System.out.println(missingNumber(nums));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int missingNumber(int nums[], int size) {
    return 0;
}

int main() {
    int nums[] = {3, 0, 1};
    printf("%d\\n", missingNumber(nums, 3));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

int missingNumber(vector<int>& nums) {
    return 0;
}

int main() {
    vector<int> nums = {3, 0, 1};
    cout << missingNumber(nums) << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[3,0,1]', expectedOutput: '2', isHidden: false },
      { input: '[0,1]', expectedOutput: '2', isHidden: false },
      { input: '[9,6,4,2,3,5,7,0,1]', expectedOutput: '8', isHidden: true },
    ],
    order: 12,
  },

  // 13. STRINGS: Check Palindrome
  {
    title: 'Check Palindrome',
    description:
      'Given a string `s`, check whether it is a palindrome (reads the same forwards and backwards, case-insensitive).\n\nReturn True if it is a palindrome, False otherwise.',
    difficulty: 'easy',
    tags: ['Strings', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print True if palindrome, False otherwise.',
    starterCode: [
      {
        language: 'python',
        code: `def is_palindrome(s):
    # Check if s is palindrome
    pass

s = "racecar"
print(is_palindrome(s))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static boolean isPalindrome(String s) {
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("racecar"));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <stdbool.h>

bool isPalindrome(char* s) {
    return false;
}

int main() {
    printf("%s\\n", isPalindrome("racecar") ? "True" : "False");
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string s) {
    return false;
}

int main() {
    cout << (isPalindrome("racecar") ? "True" : "False") << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: 'racecar', expectedOutput: 'True', isHidden: false },
      { input: 'hello', expectedOutput: 'False', isHidden: false },
      { input: 'Madam', expectedOutput: 'True', isHidden: true },
    ],
    order: 13,
  },

  // 14. STRINGS: Count Vowels
  {
    title: 'Count Vowels',
    description:
      'Given a string `s`, count and return the total number of vowels (`a`, `e`, `i`, `o`, `u`, case-insensitive) present in the string.',
    difficulty: 'easy',
    tags: ['Strings', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print total vowel count.',
    starterCode: [
      {
        language: 'python',
        code: `def count_vowels(s):
    # Count vowels a, e, i, o, u
    pass

s = "Hello World"
print(count_vowels(s))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int countVowels(String s) {
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(countVowels("Hello World"));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int countVowels(char* s) {
    return 0;
}

int main() {
    printf("%d\\n", countVowels("Hello World"));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
using namespace std;

int countVowels(string s) {
    return 0;
}

int main() {
    cout << countVowels("Hello World") << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: 'Hello World', expectedOutput: '3', isHidden: false },
      { input: 'Python', expectedOutput: '1', isHidden: false },
      { input: 'AEIOU', expectedOutput: '5', isHidden: true },
    ],
    order: 14,
  },

  // 15. STRINGS: First Non-Repeating Character
  {
    title: 'First Non-Repeating Character',
    description:
      'Given a string `s`, find the first non-repeating character in it and return its 0-based index. If no non-repeating character exists, return -1.',
    difficulty: 'easy',
    tags: ['Strings', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print index of first non-repeating character or -1.',
    starterCode: [
      {
        language: 'python',
        code: `def first_uniq_char(s):
    # Return index of first non-repeating char
    pass

s = "leetcode"
print(first_uniq_char(s))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int firstUniqChar(String s) {
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(firstUniqChar("leetcode"));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int firstUniqChar(char* s) {
    return -1;
}

int main() {
    printf("%d\\n", firstUniqChar("leetcode"));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <string>
using namespace std;

int firstUniqChar(string s) {
    return -1;
}

int main() {
    cout << firstUniqChar("leetcode") << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: 'leetcode', expectedOutput: '0', isHidden: false },
      { input: 'loveleetcode', expectedOutput: '2', isHidden: false },
      { input: 'aabb', expectedOutput: '-1', isHidden: true },
    ],
    order: 15,
  },

  // 16. LOOPS AND CONDITIONS: Sum of Digits
  {
    title: 'Sum of Digits',
    description:
      'Given a non-negative integer `n`, write a function that returns the sum of all its individual digits.',
    difficulty: 'easy',
    tags: ['Loops', 'Conditions'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the sum of digits.',
    starterCode: [
      {
        language: 'python',
        code: `def sum_of_digits(n):
    # Calculate sum of digits
    pass

print(sum_of_digits(1234))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int sumOfDigits(int n) {
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(sumOfDigits(1234));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int sumOfDigits(int n) {
    return 0;
}

int main() {
    printf("%d\\n", sumOfDigits(1234));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
using namespace std;

int sumOfDigits(int n) {
    return 0;
}

int main() {
    cout << sumOfDigits(1234) << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '1234', expectedOutput: '10', isHidden: false },
      { input: '999', expectedOutput: '27', isHidden: false },
      { input: '0', expectedOutput: '0', isHidden: true },
    ],
    order: 16,
  },

  // 17. LOOPS AND CONDITIONS: Check Prime Number
  {
    title: 'Check Prime Number',
    description:
      'Given an integer `n`, check whether it is a prime number (an integer greater than 1 with no positive divisors other than 1 and itself).\n\nReturn True if prime, False otherwise.',
    difficulty: 'easy',
    tags: ['Loops', 'Conditions'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print True if prime, False otherwise.',
    starterCode: [
      {
        language: 'python',
        code: `def is_prime(n):
    # Return True if prime, False otherwise
    pass

print(is_prime(11))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static boolean isPrime(int n) {
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPrime(11));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <stdbool.h>

bool isPrime(int n) {
    return false;
}

int main() {
    printf("%s\\n", isPrime(11) ? "True" : "False");
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    return false;
}

int main() {
    cout << (isPrime(11) ? "True" : "False") << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '11', expectedOutput: 'True', isHidden: false },
      { input: '4', expectedOutput: 'False', isHidden: false },
      { input: '1', expectedOutput: 'False', isHidden: true },
    ],
    order: 17,
  },

  // 18. LOOPS AND CONDITIONS: Count Even and Odd Numbers
  {
    title: 'Count Even and Odd Numbers',
    description:
      'Given an array of integers `nums`, count how many numbers are even and how many are odd.\n\nReturn the counts as a list/array `[evenCount, oddCount]`.',
    difficulty: 'easy',
    tags: ['Arrays', 'Loops', 'Conditions'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print [evenCount, oddCount].',
    starterCode: [
      {
        language: 'python',
        code: `def count_even_odd(nums):
    # Return [even_count, odd_count]
    pass

nums = [1, 2, 3, 4, 5]
print(count_even_odd(nums))`,
      },
      {
        language: 'java',
        code: `import java.util.*;

public class Main {
    public static int[] countEvenOdd(int[] nums) {
        return new int[]{0, 0};
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        System.out.println(Arrays.toString(countEvenOdd(nums)));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

void countEvenOdd(int nums[], int size, int res[]) {
}

int main() {
    int nums[] = {1, 2, 3, 4, 5}, res[2];
    countEvenOdd(nums, 5, res);
    printf("[%d, %d]\\n", res[0], res[1]);
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> countEvenOdd(vector<int>& nums) {
    return {0, 0};
}

int main() {
    vector<int> nums = {1, 2, 3, 4, 5};
    vector<int> res = countEvenOdd(nums);
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[2, 3]', isHidden: false },
      { input: '[2,4,6]', expectedOutput: '[3, 0]', isHidden: false },
    ],
    order: 18,
  },

  // 19. HASHMAP: Character Frequency
  {
    title: 'Character Frequency',
    description:
      'Given a string `s`, count the frequency of each unique character and return a formatted dictionary/map string or count summary.',
    difficulty: 'easy',
    tags: ['Strings', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print character frequency representation.',
    starterCode: [
      {
        language: 'python',
        code: `def char_frequency(s):
    # Return dict of char frequencies
    pass

s = "apple"
print(char_frequency(s))`,
      },
      {
        language: 'java',
        code: `import java.util.*;

public class Main {
    public static Map<Character, Integer> charFrequency(String s) {
        return new HashMap<>();
    }

    public static void main(String[] args) {
        System.out.println(charFrequency("apple"));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

void charFrequency(char* s) {
}

int main() {
    charFrequency("apple");
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <map>
#include <string>
using namespace std;

map<char, int> charFrequency(string s) {
    return {};
}

int main() {
    map<char, int> res = charFrequency("apple");
    return 0;
}`,
      },
    ],
    testCases: [
      { input: 'apple', expectedOutput: "{'a': 1, 'p': 2, 'l': 1, 'e': 1}", isHidden: false },
      { input: 'aba', expectedOutput: "{'a': 2, 'b': 1}", isHidden: false },
    ],
    order: 19,
  },

  // 20. HASHMAP: First Repeating Element
  {
    title: 'First Repeating Element',
    description:
      'Given an array of integers `nums`, find and return the first element that occurs more than once. If no element repeats, return -1.',
    difficulty: 'easy',
    tags: ['Arrays', 'HashMap'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print the first repeating integer or -1.',
    starterCode: [
      {
        language: 'python',
        code: `def first_repeating(nums):
    # Return first repeating element
    pass

nums = [10, 5, 3, 4, 3, 5, 6]
print(first_repeating(nums))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int firstRepeating(int[] nums) {
        return -1;
    }

    public static void main(String[] args) {
        int[] nums = {10, 5, 3, 4, 3, 5, 6};
        System.out.println(firstRepeating(nums));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int firstRepeating(int nums[], int size) {
    return -1;
}

int main() {
    int nums[] = {10, 5, 3, 4, 3, 5, 6};
    printf("%d\\n", firstRepeating(nums, 7));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

int firstRepeating(vector<int>& nums) {
    return -1;
}

int main() {
    vector<int> nums = {10, 5, 3, 4, 3, 5, 6};
    cout << firstRepeating(nums) << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[10,5,3,4,3,5,6]', expectedOutput: '5', isHidden: false },
      { input: '[1,2,3,4]', expectedOutput: '-1', isHidden: false },
    ],
    order: 20,
  },

  // 21. TWO POINTERS: Check Pair Sum in Sorted Array
  {
    title: 'Check Pair Sum in Sorted Array',
    description:
      'Given a sorted array of integers `nums` and a target sum, determine if there exists a pair of numbers whose sum equals target.\n\nReturn True if such a pair exists, False otherwise.',
    difficulty: 'easy',
    tags: ['Arrays', 'Two Pointer'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print True if pair sum exists, False otherwise.',
    starterCode: [
      {
        language: 'python',
        code: `def has_pair_with_sum(nums, target):
    # Use two pointers to check pair sum
    pass

nums = [1, 2, 4, 7, 11]
target = 15
print(has_pair_with_sum(nums, target))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static boolean hasPairWithSum(int[] nums, int target) {
        return false;
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 4, 7, 11};
        System.out.println(hasPairWithSum(nums, 15));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <stdbool.h>

bool hasPairWithSum(int nums[], int size, int target) {
    return false;
}

int main() {
    int nums[] = {1, 2, 4, 7, 11};
    printf("%s\\n", hasPairWithSum(nums, 5, 15) ? "True" : "False");
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

bool hasPairWithSum(vector<int>& nums, int target) {
    return false;
}

int main() {
    vector<int> nums = {1, 2, 4, 7, 11};
    cout << (hasPairWithSum(nums, 15) ? "True" : "False") << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[1,2,4,7,11]\n15', expectedOutput: 'True', isHidden: false },
      { input: '[1,2,3,9]\n8', expectedOutput: 'False', isHidden: false },
    ],
    order: 21,
  },

  // 22. SORTING: Sort Array Without Built-in Sorting
  {
    title: 'Sort Array Without Built-in Sorting',
    description:
      'Given an array of integers `nums`, sort the numbers in ascending order without using built-in sort functions (e.g. implement Bubble Sort or Selection Sort).\n\nReturn the sorted array.',
    difficulty: 'medium',
    tags: ['Arrays', 'Sorting'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print array sorted in ascending order.',
    starterCode: [
      {
        language: 'python',
        code: `def sort_array(nums):
    # Implement sorting manually
    pass

nums = [5, 2, 8, 1, 9]
print(sort_array(nums))`,
      },
      {
        language: 'java',
        code: `import java.util.*;

public class Main {
    public static int[] sortArray(int[] nums) {
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums = {5, 2, 8, 1, 9};
        System.out.println(Arrays.toString(sortArray(nums)));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

void sortArray(int nums[], int size) {
}

int main() {
    int nums[] = {5, 2, 8, 1, 9};
    sortArray(nums, 5);
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
using namespace std;

vector<int> sortArray(vector<int>& nums) {
    return {};
}

int main() {
    vector<int> nums = {5, 2, 8, 1, 9};
    vector<int> res = sortArray(nums);
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '[5,2,8,1,9]', expectedOutput: '[1, 2, 5, 8, 9]', isHidden: false },
      { input: '[4,3,2,1]', expectedOutput: '[1, 2, 3, 4]', isHidden: false },
    ],
    order: 22,
  },

  // 23. BASIC RECURSION: Sum of Numbers from 1 to N
  {
    title: 'Sum of Numbers from 1 to N',
    description:
      'Given a positive integer `n`, write a function that calculates the sum of all numbers from 1 to `n` using recursion.\n\nDo not use a loop or mathematical formula `n*(n+1)/2`.',
    difficulty: 'easy',
    tags: ['Recursion', 'Loops'],
    supportedLanguages: ['python', 'java', 'c', 'cpp'],
    expectedBehavior: 'Print sum of integers from 1 to n.',
    starterCode: [
      {
        language: 'python',
        code: `def sum_to_n(n):
    # Implement using recursion
    pass

print(sum_to_n(5))`,
      },
      {
        language: 'java',
        code: `public class Main {
    public static int sumToN(int n) {
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(sumToN(5));
    }
}`,
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int sumToN(int n) {
    return 0;
}

int main() {
    printf("%d\\n", sumToN(5));
    return 0;
}`,
      },
      {
        language: 'cpp',
        code: `#include <iostream>
using namespace std;

int sumToN(int n) {
    return 0;
}

int main() {
    cout << sumToN(5) << endl;
    return 0;
}`,
      },
    ],
    testCases: [
      { input: '5', expectedOutput: '15', isHidden: false },
      { input: '10', expectedOutput: '55', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: true },
    ],
    order: 23,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB Atlas.');

    await Problem.deleteMany({});
    await Problem.insertMany(PROBLEMS);

    console.log(`[Seed] Successfully inserted ${PROBLEMS.length} problems!`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    process.exit(1);
  }
}

seed();
