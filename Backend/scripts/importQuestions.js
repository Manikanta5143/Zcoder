const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('../model/question');

const dbUri = 'mongodb+srv://manikantamani90140:9014080550@cluster0.kfpifhg.mongodb.net/zcoderdb';

async function importData() {
  try {
    // 1. Connect to Mongo
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB successfully for import.');

    // 2. Read JSON
    const jsonPath = path.join(__dirname, '..', 'questions.json');
    if (!fs.existsSync(jsonPath)) {
      console.error(`Seed file not found at: ${jsonPath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    let questions;
    try {
      questions = JSON.parse(rawData);
    } catch (err) {
      console.error('Invalid JSON structure in questions.json:', err.message);
      process.exit(1);
    }

    if (!Array.isArray(questions)) {
      console.error('Seed file must contain a JSON array of questions.');
      process.exit(1);
    }

    console.log(`Read ${questions.length} questions from seed file.`);

    let successCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (const q of questions) {
      // Data Validation
      if (!q.title || !q.titleSlug || !q.difficulty || !q.category || !q.description) {
        console.warn(`Skipping invalid record: Title: ${q.title || 'UNKNOWN'}. Missing required fields.`);
        invalidCount++;
        continue;
      }

      // Check for duplicate
      const existing = await Question.findOne({
        $or: [
          { title: q.title },
          { titleSlug: q.titleSlug }
        ]
      });

      if (existing) {
        duplicateCount++;
        continue;
      }

      // Save to Mongo
      const newQuestion = new Question(q);
      await newQuestion.save();
      successCount++;
    }

    console.log('\n--- Import Summary ---');
    console.log(`Successfully Imported: ${successCount}`);
    console.log(`Skipped Duplicates:    ${duplicateCount}`);
    console.log(`Skipped Invalid:       ${invalidCount}`);
    console.log(`Total Records Scanned: ${questions.length}`);
    console.log('----------------------');

  } catch (error) {
    console.error('Import process failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

importData();
