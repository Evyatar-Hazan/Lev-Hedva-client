#!/usr/bin/env node

/**
 * סקריפט לבדיקת שלמות תרגומי i18n
 * בודק שכל המפתחות קיימים בכל קבצי השפה
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const LANGUAGES = ['he', 'en'];

function flattenObject(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...flattenObject(obj[key], newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }
  return keys;
}

function checkTranslations() {
  console.log('🔍 בודק תרגומי i18n...\n');
  
  const translations = {};
  let hasErrors = false;

  // טעינת כל קבצי השפה
  for (const lang of LANGUAGES) {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      console.error(`❌ שגיאה בטעינת קובץ ${lang}.json:`, error.message);
      hasErrors = true;
      return;
    }
  }

  // המרת כל קבצי השפה למפתחות שטוחים
  const flatTranslations = {};
  for (const lang of LANGUAGES) {
    flatTranslations[lang] = flattenObject(translations[lang]);
  }

  // בדיקת הבדלים בין השפות
  const allKeys = new Set();
  for (const lang of LANGUAGES) {
    flatTranslations[lang].forEach(key => allKeys.add(key));
  }

  console.log(`📊 סה"כ מפתחות ייחודיים: ${allKeys.size}\n`);

  // בדיקה עבור כל שפה
  for (const lang of LANGUAGES) {
    const missingKeys = [];
    allKeys.forEach(key => {
      if (!flatTranslations[lang].includes(key)) {
        missingKeys.push(key);
      }
    });

    if (missingKeys.length > 0) {
      console.error(`❌ חסרים תרגומים ב-${lang}.json (${missingKeys.length}):`);
      missingKeys.forEach(key => console.error(`   - ${key}`));
      console.error('');
      hasErrors = true;
    } else {
      console.log(`✅ ${lang}.json - כל התרגומים קיימים (${flatTranslations[lang].length} מפתחות)`);
    }
  }

  if (hasErrors) {
    console.error('\n❌ נמצאו בעיות בתרגומים!');
    process.exit(1);
  } else {
    console.log('\n✅ כל התרגומים תקינים!');
    process.exit(0);
  }
}

checkTranslations();
