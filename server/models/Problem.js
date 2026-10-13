/**
 * Problem Model
 * 
 * Represents a coding problem in the BugBuddy problem library.
 * Each problem has starter code, test cases, and metadata.
 */

const mongoose = require('mongoose');

// A single test case with input and expected output
const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }, // hidden test cases not shown to student
    description: { type: String, default: '' },
  },
  { _id: false }
);

// Starter code for each supported language
const starterCodeSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      enum: ['python', 'java', 'c', 'cpp', 'c++'],
      required: true,
    },
    code: { type: String, default: '' },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required.'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    // Topic tags (e.g. Arrays, Strings, Loops)
    tags: [{ type: String, trim: true }],
    // Which languages have starter code defined
    supportedLanguages: [{ type: String, enum: ['python', 'java', 'c', 'cpp', 'c++'] }],
    // Starter code per language
    starterCode: [starterCodeSchema],
    // Expected behavior description shown to student
    expectedBehavior: { type: String, default: '' },
    // Test cases used to verify submissions
    testCases: [testCaseSchema],
    // Whether this problem is published and visible to students
    isPublished: { type: Boolean, default: true },
    // Internal test or diagnostic challenge not shown in public catalog
    isInternalChallenge: { type: Boolean, default: false },
    // Order for display purposes
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Problem', problemSchema);
