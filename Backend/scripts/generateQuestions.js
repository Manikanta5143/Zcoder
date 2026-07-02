const fs = require('fs');
const path = require('path');

// A list of 200 classic coding problem definitions with title, difficulty, and tags
const problemDefinitions = [
  { title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Table"] },
  { title: "Valid Parentheses", difficulty: "Easy", tags: ["String", "Stack"] },
  { title: "Merge Two Sorted Lists", difficulty: "Easy", tags: ["Linked List", "Recursion"] },
  { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", tags: ["Array", "Dynamic Programming"] },
  { title: "Valid Palindrome", difficulty: "Easy", tags: ["Two Pointers", "String"] },
  { title: "Invert Binary Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Valid Anagram", difficulty: "Easy", tags: ["Hash Table", "String", "Sorting"] },
  { title: "Binary Search", difficulty: "Easy", tags: ["Binary Search", "Array"] },
  { title: "Flood Fill", difficulty: "Easy", tags: ["Array", "DFS", "BFS"] },
  { title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Balanced Binary Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Linked List Cycle", difficulty: "Easy", tags: ["Linked List", "Two Pointers"] },
  { title: "Implement Queue using Stacks", difficulty: "Easy", tags: ["Stack", "Design", "Queue"] },
  { title: "First Bad Version", difficulty: "Easy", tags: ["Binary Search", "Interactive"] },
  { title: "Ransom Note", difficulty: "Easy", tags: ["Hash Table", "String", "Counting"] },
  { title: "Climbing Stairs", difficulty: "Easy", tags: ["Dynamic Programming", "Math"] },
  { title: "Longest Palindrome", difficulty: "Easy", tags: ["Hash Table", "String", "Greedy"] },
  { title: "Reverse Linked List", difficulty: "Easy", tags: ["Linked List", "Recursion"] },
  { title: "Majority Element", difficulty: "Easy", tags: ["Array", "Hash Table", "Divide and Conquer", "Sorting"] },
  { title: "Add Binary", difficulty: "Easy", tags: ["Math", "String", "Bit Manipulation"] },
  { title: "Diameter of Binary Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Middle of the Linked List", difficulty: "Easy", tags: ["Linked List", "Two Pointers"] },
  { title: "Maximum Depth of Binary Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Contains Duplicate", difficulty: "Easy", tags: ["Array", "Hash Table", "Sorting"] },
  { title: "Maximum Subarray", difficulty: "Medium", tags: ["Array", "Divide and Conquer", "Dynamic Programming"] },
  { title: "3Sum", difficulty: "Medium", tags: ["Array", "Two Pointers", "Sorting"] },
  { title: "Binary Tree Level Order Traversal", difficulty: "Medium", tags: ["Tree", "Binary Tree", "BFS"] },
  { title: "Clone Graph", difficulty: "Medium", tags: ["Graph", "DFS", "BFS"] },
  { title: "Evaluate Reverse Polish Notation", difficulty: "Medium", tags: ["Stack", "Math"] },
  { title: "Course Schedule", difficulty: "Medium", tags: ["Graph", "Topological Sort", "DFS", "BFS"] },
  { title: "Implement Trie (Prefix Tree)", difficulty: "Medium", tags: ["Design", "Trie", "Hash Table"] },
  { title: "Coin Change", difficulty: "Medium", tags: ["Dynamic Programming", "BFS"] },
  { title: "Product of Array Except Self", difficulty: "Medium", tags: ["Array", "Prefix Sum"] },
  { title: "Min Stack", difficulty: "Medium", tags: ["Stack", "Design"] },
  { title: "Validate Binary Search Tree", difficulty: "Medium", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Number of Islands", difficulty: "Medium", tags: ["Graph", "DFS", "BFS", "Union Find"] },
  { title: "Rotting Oranges", difficulty: "Medium", tags: ["Graph", "BFS", "Array"] },
  { title: "Search in Rotated Sorted Array", difficulty: "Medium", tags: ["Array", "Binary Search"] },
  { title: "Combination Sum", difficulty: "Medium", tags: ["Array", "Backtracking"] },
  { title: "Permutations", difficulty: "Medium", tags: ["Array", "Backtracking"] },
  { title: "Merge Intervals", difficulty: "Medium", tags: ["Array", "Sorting"] },
  { title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Time Based Key-Value Store", difficulty: "Medium", tags: ["Design", "Hash Table", "Binary Search"] },
  { title: "Accounts Merge", difficulty: "Medium", tags: ["Graph", "DFS", "Union Find"] },
  { title: "Sort Colors", difficulty: "Medium", tags: ["Array", "Two Pointers", "Sorting"] },
  { title: "Word Break", difficulty: "Medium", tags: ["Dynamic Programming", "Trie", "Memoization"] },
  { title: "Linked List Cycle II", difficulty: "Medium", tags: ["Linked List", "Two Pointers"] },
  { title: "Subarray Sum Equals K", difficulty: "Medium", tags: ["Array", "Hash Table", "Prefix Sum"] },
  { title: "Decode String", difficulty: "Medium", tags: ["Stack", "Recursion"] },
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", tags: ["String", "Sliding Window"] },
  { title: "Container With Most Water", difficulty: "Medium", tags: ["Array", "Two Pointers", "Greedy"] },
  { title: "Letter Combinations of a Phone Number", difficulty: "Medium", tags: ["String", "Backtracking"] },
  { title: "Generate Parentheses", difficulty: "Medium", tags: ["String", "Backtracking"] },
  { title: "Remove Nth Node From End of List", difficulty: "Medium", tags: ["Linked List", "Two Pointers"] },
  { title: "Divide Two Integers", difficulty: "Medium", tags: ["Math", "Bit Manipulation"] },
  { title: "Next Permutation", difficulty: "Medium", tags: ["Array", "Two Pointers"] },
  { title: "Multiply Strings", difficulty: "Medium", tags: ["Math", "String", "Simulation"] },
  { title: "Rotate Image", difficulty: "Medium", tags: ["Array", "Math", "Matrix"] },
  { title: "Group Anagrams", difficulty: "Medium", tags: ["Array", "Hash Table", "String", "Sorting"] },
  { title: "Pow(x, n)", difficulty: "Medium", tags: ["Math", "Recursion"] },
  { title: "Spiral Matrix", difficulty: "Medium", tags: ["Array", "Matrix", "Simulation"] },
  { title: "Jump Game", difficulty: "Medium", tags: ["Array", "Dynamic Programming", "Greedy"] },
  { title: "Unique Paths", difficulty: "Medium", tags: ["Math", "Dynamic Programming", "Combinatorics"] },
  { title: "Minimum Path Sum", difficulty: "Medium", tags: ["Array", "Dynamic Programming", "Matrix"] },
  { title: "Simplify Path", difficulty: "Medium", tags: ["String", "Stack"] },
  { title: "Set Matrix Zeroes", difficulty: "Medium", tags: ["Array", "Hash Table", "Matrix"] },
  { title: "Search a 2D Matrix", difficulty: "Medium", tags: ["Array", "Binary Search", "Matrix"] },
  { title: "Subsets", difficulty: "Medium", tags: ["Array", "Backtracking", "Bit Manipulation"] },
  { title: "Word Search", difficulty: "Medium", tags: ["Array", "Backtracking", "Matrix"] },
  { title: "Remove Duplicates from Sorted List II", difficulty: "Medium", tags: ["Linked List", "Two Pointers"] },
  { title: "Partition List", difficulty: "Medium", tags: ["Linked List", "Two Pointers"] },
  { title: "Reverse Linked List II", difficulty: "Medium", tags: ["Linked List", "Recursion"] },
  { title: "Restore IP Addresses", difficulty: "Medium", tags: ["String", "Backtracking"] },
  { title: "Binary Tree Inorder Traversal", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Unique Binary Search Trees", difficulty: "Medium", tags: ["Math", "Dynamic Programming", "Tree", "Binary Tree"] },
  { title: "Validate Binary Search Tree", difficulty: "Medium", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Same Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Symmetric Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Path Sum", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Path Sum II", difficulty: "Medium", tags: ["Tree", "Binary Tree", "DFS", "Backtracking"] },
  { title: "Populating Next Right Pointers in Each Node", difficulty: "Medium", tags: ["Tree", "Binary Tree", "BFS"] },
  { title: "Flatten Binary Tree to Linked List", difficulty: "Medium", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Triangle", difficulty: "Medium", tags: ["Array", "Dynamic Programming"] },
  { title: "Best Time to Buy and Sell Stock II", difficulty: "Medium", tags: ["Array", "Dynamic Programming", "Greedy"] },
  { title: "Single Number", difficulty: "Easy", tags: ["Array", "Bit Manipulation"] },
  { title: "Copy List with Random Pointer", difficulty: "Medium", tags: ["Linked List", "Hash Table"] },
  { title: "Word Break", difficulty: "Medium", tags: ["Dynamic Programming", "Hash Table", "Trie"] },
  { title: "Linked List Cycle II", difficulty: "Medium", tags: ["Linked List", "Two Pointers"] },
  { title: "LRU Cache", difficulty: "Medium", tags: ["Design", "Hash Table", "Linked List"] },
  { title: "Sort List", difficulty: "Medium", tags: ["Linked List", "Two Pointers", "Sorting", "Merge Sort"] },
  { title: "Maximum Product Subarray", difficulty: "Medium", tags: ["Array", "Dynamic Programming"] },
  { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", tags: ["Array", "Binary Search"] },
  { title: "Min Stack", difficulty: "Medium", tags: ["Stack", "Design"] },
  { title: "Intersection of Two Linked Lists", difficulty: "Easy", tags: ["Linked List", "Two Pointers", "Hash Table"] },
  { title: "Excel Sheet Column Title", difficulty: "Easy", tags: ["Math", "String"] },
  { title: "Majority Element", difficulty: "Easy", tags: ["Array", "Hash Table", "Sorting"] },
  { title: "Rotate Array", difficulty: "Medium", tags: ["Array", "Math", "Two Pointers"] },
  { title: "Reverse Bits", difficulty: "Easy", tags: ["Math", "Bit Manipulation"] },
  { title: "Number of 1 Bits", difficulty: "Easy", tags: ["Math", "Bit Manipulation"] },
  { title: "House Robber", difficulty: "Medium", tags: ["Array", "Dynamic Programming"] },
  { title: "Happy Number", difficulty: "Easy", tags: ["Math", "Hash Table", "Two Pointers"] },
  { title: "Remove Linked List Elements", difficulty: "Easy", tags: ["Linked List", "Recursion"] },
  { title: "Count Primes", difficulty: "Medium", tags: ["Math", "Number Theory"] },
  { title: "Isomorphic Strings", difficulty: "Easy", tags: ["Hash Table", "String"] },
  { title: "Reverse Linked List", difficulty: "Easy", tags: ["Linked List", "Recursion"] },
  { title: "Course Schedule", difficulty: "Medium", tags: ["DFS", "BFS", "Graph", "Topological Sort"] },
  { title: "Implement Trie (Prefix Tree)", difficulty: "Medium", tags: ["Design", "Trie"] },
  { title: "Minimum Size Subarray Sum", difficulty: "Medium", tags: ["Array", "Binary Search", "Sliding Window"] },
  { title: "Course Schedule II", difficulty: "Medium", tags: ["DFS", "BFS", "Graph", "Topological Sort"] },
  { title: "Design Add and Search Words Data Structure", difficulty: "Medium", tags: ["String", "DFS", "Design", "Trie"] },
  { title: "House Robber II", difficulty: "Medium", tags: ["Array", "Dynamic Programming"] },
  { title: "Kth Largest Element in an Array", difficulty: "Medium", tags: ["Array", "Divide and Conquer", "Sorting", "Heap"] },
  { title: "Combination Sum III", difficulty: "Medium", tags: ["Array", "Backtracking"] },
  { title: "Basic Calculator II", difficulty: "Medium", tags: ["Math", "String", "Stack"] },
  { title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Delete Node in a Linked List", difficulty: "Easy", tags: ["Linked List"] },
  { title: "Product of Array Except Self", difficulty: "Medium", tags: ["Array", "Prefix Sum"] },
  { title: "Search a 2D Matrix II", difficulty: "Medium", tags: ["Array", "Binary Search", "Matrix"] },
  { title: "Valid Anagram", difficulty: "Easy", tags: ["Hash Table", "String", "Sorting"] },
  { title: "Binary Tree Paths", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Single Number III", difficulty: "Medium", tags: ["Array", "Bit Manipulation"] },
  { title: "Ugly Number", difficulty: "Easy", tags: ["Math", "Number Theory"] },
  { title: "Ugly Number II", difficulty: "Medium", tags: ["Math", "Dynamic Programming", "Heap"] },
  { title: "H-Index", difficulty: "Medium", tags: ["Array", "Sorting", "Counting Sort"] },
  { title: "H-Index II", difficulty: "Medium", tags: ["Array", "Binary Search"] },
  { title: "Perfect Squares", difficulty: "Medium", tags: ["Math", "Dynamic Programming", "BFS"] },
  { title: "First Bad Version", difficulty: "Easy", tags: ["Binary Search", "Interactive"] },
  { title: "Expression Add Operators", difficulty: "Hard", tags: ["Math", "String", "Backtracking"] },
  { title: "Move Zeroes", difficulty: "Easy", tags: ["Array", "Two Pointers"] },
  { title: "Find the Duplicate Number", difficulty: "Medium", tags: ["Array", "Two Pointers", "Binary Search"] },
  { title: "Game of Life", difficulty: "Medium", tags: ["Array", "Matrix", "Simulation"] },
  { title: "Word Pattern", difficulty: "Easy", tags: ["Hash Table", "String"] },
  { title: "Bulls and Cows", difficulty: "Medium", tags: ["Hash Table", "String", "Counting"] },
  { title: "Longest Increasing Subsequence", difficulty: "Medium", tags: ["Array", "Binary Search", "Dynamic Programming"] },
  { title: "Remove Duplicate Letters", difficulty: "Medium", tags: ["String", "Stack", "Greedy"] },
  { title: "Count of Smaller Numbers After Self", difficulty: "Hard", tags: ["Array", "Divide and Conquer", "Binary Indexed Tree", "Segment Tree"] },
  { title: "Coin Change", difficulty: "Medium", tags: ["Array", "Dynamic Programming", "BFS"] },
  { title: "Odd Even Linked List", difficulty: "Medium", tags: ["Linked List"] },
  { title: "House Robber III", difficulty: "Medium", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Top K Frequent Elements", difficulty: "Medium", tags: ["Array", "Hash Table", "Sorting", "Heap"] },
  { title: "Design Twitter", difficulty: "Medium", tags: ["Hash Table", "Linked List", "Design"] },
  { title: "Shuffle an Array", difficulty: "Medium", tags: ["Array", "Math", "Randomization"] },
  { title: "Insert Delete GetRandom O(1)", difficulty: "Medium", tags: ["Array", "Hash Table", "Design", "Randomization"] },
  { title: "Combination Sum IV", difficulty: "Medium", tags: ["Array", "Dynamic Programming"] },
  { title: "Decode String", difficulty: "Medium", tags: ["String", "Stack", "Recursion"] },
  { title: "Queue Reconstruction by Height", difficulty: "Medium", tags: ["Array", "Binary Indexed Tree", "Segment Tree", "Sorting"] },
  { title: "Find All Anagrams in a String", difficulty: "Medium", tags: ["Hash Table", "String", "Sliding Window"] },
  { title: "Target Sum", difficulty: "Medium", tags: ["Array", "Dynamic Programming", "Backtracking"] },
  { title: "Subarray Sum Equals K", difficulty: "Medium", tags: ["Array", "Hash Table", "Prefix Sum"] },
  { title: "Shortest Unsorted Continuous Subarray", difficulty: "Medium", tags: ["Array", "Two Pointers", "Sorting", "Stack"] },
  { title: "Merge Two Binary Trees", difficulty: "Easy", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Task Scheduler", difficulty: "Medium", tags: ["Array", "Hash Table", "Greedy", "Sorting", "Heap"] },
  { title: "Palindromic Substrings", difficulty: "Medium", tags: ["String", "Dynamic Programming"] },
  { title: "Daily Temperatures", difficulty: "Medium", tags: ["Array", "Stack", "Monotonic Stack"] },
  { title: "Subsets II", difficulty: "Medium", tags: ["Array", "Backtracking", "Bit Manipulation"] },
  { title: "Search in a Binary Search Tree", difficulty: "Easy", tags: ["Tree", "Binary Tree", "Binary Search Tree"] },
  { title: "Insert into a Binary Search Tree", difficulty: "Medium", tags: ["Tree", "Binary Tree", "Binary Search Tree"] },
  { title: "Binary Search", difficulty: "Easy", tags: ["Array", "Binary Search"] },
  { title: "Kth Smallest Element in a BST", difficulty: "Medium", tags: ["Tree", "Binary Tree", "BST"] },
  { title: "Subsets", difficulty: "Medium", tags: ["Array", "Backtracking"] },
  { title: "Median of Two Sorted Arrays", difficulty: "Hard", tags: ["Array", "Binary Search", "Divide and Conquer"] },
  { title: "Regular Expression Matching", difficulty: "Hard", tags: ["String", "Dynamic Programming", "Recursion"] },
  { title: "Merge K Sorted Lists", difficulty: "Hard", tags: ["Linked List", "Divide and Conquer", "Heap", "Merge Sort"] },
  { title: "Reverse Nodes in K-Group", difficulty: "Hard", tags: ["Linked List", "Recursion"] },
  { title: "Sudoku Solver", difficulty: "Hard", tags: ["Array", "Hash Table", "Backtracking", "Matrix"] },
  { title: "First Missing Positive", difficulty: "Hard", tags: ["Array", "Hash Table"] },
  { title: "Trapping Rain Water", difficulty: "Hard", tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"] },
  { title: "N-Queens", difficulty: "Hard", tags: ["Array", "Backtracking"] },
  { title: "N-Queens II", difficulty: "Hard", tags: ["Backtracking"] },
  { title: "Merge Sort", difficulty: "Medium", tags: ["Array", "Sorting", "Divide and Conquer"] },
  { title: "Quick Sort", difficulty: "Medium", tags: ["Array", "Sorting", "Divide and Conquer"] },
  { title: "Longest Valid Parentheses", difficulty: "Hard", tags: ["String", "Dynamic Programming", "Stack"] },
  { title: "Jump Game II", difficulty: "Medium", tags: ["Array", "Greedy", "Dynamic Programming"] },
  { title: "Wildcard Matching", difficulty: "Hard", tags: ["String", "Dynamic Programming", "Greedy", "Recursion"] },
  { title: "Permutations II", difficulty: "Medium", tags: ["Array", "Backtracking"] },
  { title: "N-Queens", difficulty: "Hard", tags: ["Backtracking"] },
  { title: "Edit Distance", difficulty: "Hard", tags: ["String", "Dynamic Programming"] },
  { title: "Maximal Rectangle", difficulty: "Hard", tags: ["Array", "Dynamic Programming", "Stack", "Matrix"] },
  { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", tags: ["Tree", "Binary Tree", "DFS"] },
  { title: "Longest Consecutive Sequence", difficulty: "Medium", tags: ["Array", "Hash Table", "Union Find"] },
  { title: "Palindrome Partitioning", difficulty: "Medium", tags: ["String", "Backtracking"] },
  { title: "Palindrome Partitioning II", difficulty: "Hard", tags: ["String", "Dynamic Programming"] },
  { title: "Word Ladder", difficulty: "Hard", tags: ["Hash Table", "BFS", "String"] },
  { title: "Word Ladder II", difficulty: "Hard", tags: ["Hash Table", "BFS", "String", "Backtracking"] },
  { title: "Surrounded Regions", difficulty: "Medium", tags: ["Array", "BFS", "DFS", "Union Find", "Matrix"] },
  { title: "Gas Station", difficulty: "Medium", tags: ["Array", "Greedy"] },
  { title: "Copy List with Random Pointer", difficulty: "Medium", tags: ["Linked List", "Hash Table"] },
  { title: "Max Points on a Line", difficulty: "Hard", tags: ["Array", "Hash Table", "Math", "Geometry"] },
  { title: "Largest Number", difficulty: "Medium", tags: ["String", "Sorting"] },
  { title: "Repeated DNA Sequences", difficulty: "Medium", tags: ["Hash Table", "String", "Bit Manipulation", "Sliding Window"] },
  { title: "Best Time to Buy and Sell Stock IV", difficulty: "Hard", tags: ["Array", "Dynamic Programming"] },
  { title: "Word Search II", difficulty: "Hard", tags: ["Array", "Backtracking", "Trie", "Matrix"] },
  { title: "House Robber II", difficulty: "Medium", tags: ["Array", "Dynamic Programming"] },
  { title: "Shortest Palindrome", difficulty: "Hard", tags: ["String", "Rolling Hash", "String Matching"] },
  { title: "Kth Largest Element in an Array", difficulty: "Medium", tags: ["Array", "Divide and Conquer", "Sorting", "Heap"] },
  { title: "Combination Sum III", difficulty: "Medium", tags: ["Array", "Backtracking"] },
  { title: "The Skyline Problem", difficulty: "Hard", tags: ["Array", "Divide and Conquer", "Binary Indexed Tree", "Segment Tree", "Line Sweep", "Heap"] },
  { title: "Basic Calculator", difficulty: "Hard", tags: ["Math", "String", "Stack"] },
  { title: "Sliding Window Maximum", difficulty: "Hard", tags: ["Array", "Queue", "Sliding Window", "Heap", "Monotonic Queue"] }
];

// Helper to make titleSlug from title
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// Generate full realistic question list
const questions = problemDefinitions.map((p, idx) => {
  const titleSlug = slugify(p.title);
  
  // Topic tags mapped to slug
  const topicTags = p.tags.map(t => ({
    name: t,
    slug: slugify(t)
  }));
  
  // Acceptance rates between 35% and 75%
  const acceptanceRate = parseFloat((35 + (idx % 41)).toFixed(1));
  
  // Likes between 100 and 15000, dislikes between 10 and 1000
  const likes = 100 + (idx * 73) % 15000;
  const dislikes = 10 + (idx * 17) % 1000;

  // Starter code in JavaScript
  const camelTitle = p.title
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[^\w]+/g, '');

  const starterCode = [
    {
      lang: "JavaScript",
      langSlug: "javascript",
      code: `/**\n * @param {any} input\n * @return {any}\n */\nvar ${camelTitle} = function(input) {\n    // Write your code here\n};`
    },
    {
      lang: "Python",
      langSlug: "python",
      code: `class Solution:\n    def ${camelTitle}(self, input: any) -> any:\n        # Write your code here\n        pass`
    }
  ];

  // Dummy inputs based on tags
  let sampleInput = "[1, 2, 3]\n3";
  let sampleOutput = "true";
  if (p.tags.includes("String")) {
    sampleInput = '"hello"';
    sampleOutput = '"olleh"';
  } else if (p.tags.includes("Tree")) {
    sampleInput = "[1,null,2,3]";
    sampleOutput = "[1,3,2]";
  } else if (p.tags.includes("Math")) {
    sampleInput = "123";
    sampleOutput = "321";
  }

  return {
    title: p.title,
    titleSlug: titleSlug,
    difficulty: p.difficulty,
    category: "Algorithms",
    topicTags: topicTags,
    description: `<p>This is the description for the problem <b>${p.title}</b>.</p><p>Given a problem scenario, implement the solution to pass all hidden test cases.</p>`,
    examples: [
      {
        id: 1,
        inputText: sampleInput.replace(/\n/g, ", "),
        outputText: sampleOutput,
        explanation: "Simple explanation showing how the output was calculated."
      }
    ],
    constraints: [
      "Constraints specific to this data structure apply.",
      "Time complexity: O(N) where N is input size.",
      "Memory limit: 256MB."
    ],
    hints: [
      "Think about the standard properties of " + p.tags[0],
      "Consider using helper storage like pointers or hash tables."
    ],
    companies: ["Google", "Amazon", "Microsoft", "Meta"].slice(0, 1 + (idx % 4)),
    likes: likes,
    dislikes: dislikes,
    acceptanceRate: acceptanceRate,
    starterCode: starterCode,
    sampleTestCases: [
      { input: sampleInput, output: sampleOutput }
    ],
    hiddenTestCases: [
      { input: sampleInput, output: sampleOutput }
    ],
    timeLimit: 1000,
    memoryLimit: 256
  };
});

// Ensure directory exists and write JSON
const destPath = path.join(__dirname, '..', 'questions.json');
fs.writeFileSync(destPath, JSON.stringify(questions, null, 2), 'utf-8');
console.log(`Generated ${questions.length} questions inside ${destPath}`);
