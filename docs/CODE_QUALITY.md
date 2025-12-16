# Code Quality & Pre-commit Hooks

מערכת בדיקות אוטומטית לאיכות קוד בפרויקט.

## 🛠️ כלים מותקנים

### 1. **ESLint** - בדיקת קוד
- בדיקת שגיאות תחביר וקוד
- אכיפת תרגומי i18n (אין טקסטים קשיחים)
- תיקון אוטומטי של בעיות

### 2. **Prettier** - עיצוב קוד
- עיצוב אחיד לכל הקוד
- תמיכה ב-TypeScript, JavaScript, JSON, CSS, Markdown
- אינטגרציה עם ESLint

### 3. **Husky** - Git Hooks
- בדיקות אוטומטיות לפני commit
- בדיקות מקיפות לפני push

### 4. **Lint-staged** - בדיקה חכמה
- בודק רק קבצים ששונו
- מהיר ויעיל

### 5. **בדיקת תרגומי i18n**
- וידוא שכל המפתחות קיימים בכל השפות
- מניעת תרגומים חסרים

## 📋 פקודות זמינות

```bash
# בדיקת ESLint
npm run lint

# תיקון אוטומטי של ESLint
npm run lint:fix

# עיצוב כל הקבצים עם Prettier
npm run format

# בדיקה שהקוד מעוצב נכון
npm run format:check

# בדיקת טיפוסים של TypeScript
npm run type-check

# בדיקת תרגומי i18n
npm run check-i18n

# הרצת כל הבדיקות ביחד
npm run validate
```

## 🔒 Git Hooks

### Pre-commit (לפני כל commit)
מריץ את הבדיקות הבאות **רק על קבצים ששונו**:
- ✅ ESLint + תיקון אוטומטי
- ✅ Prettier + עיצוב אוטומטי

אם יש שגיאות, ה-commit ייחסם!

### Pre-push (לפני כל push)
מריץ בדיקות מקיפות על **כל הפרויקט**:
- ✅ ESLint (בדיקה בלבד, ללא תיקון)
- ✅ Prettier (בדיקת עיצוב)
- ✅ TypeScript (בדיקת טיפוסים)
- ✅ i18n (בדיקת תרגומים)

אם יש שגיאות, ה-push ייחסם!

## 🎯 דוגמאות שימוש

### תיקון קוד לפני commit
```bash
npm run lint:fix
npm run format
git add .
git commit -m "fix: תיקון בעיות קוד"
```

### בדיקה ידנית לפני push
```bash
npm run validate
```

### בדיקת תרגומים
```bash
npm run check-i18n
```

## ⚙️ הגדרות

### ESLint (.eslintrc.json)
- אכיפת תרגומי i18n
- אינטגרציה עם Prettier
- תמיכה ב-React ו-TypeScript

### Prettier (.prettierrc.json)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Lint-staged (package.json)
```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

## 🚨 פתרון בעיות

### ה-commit נחסם
```bash
# ראה את השגיאות
npm run lint

# תקן אוטומטית
npm run lint:fix
npm run format

# commit שוב
git add .
git commit -m "..."
```

### ה-push נחסם
```bash
# בדוק מה השגיאות
npm run validate

# תקן לפי הפלט
# לאחר התיקון
git push
```

### בעיות תרגומים
```bash
# בדוק אילו תרגומים חסרים
npm run check-i18n

# הוסף את התרגומים החסרים ל-he.json ו-en.json
```

### דילוג על hooks (לא מומלץ!)
```bash
# דלג על pre-commit
git commit --no-verify -m "..."

# דלג על pre-push
git push --no-verify
```

## 📝 כללי i18n

### ✅ נכון
```tsx
<Typography>{t('common.hello')}</Typography>
<Button>{t('actions.save')}</Button>
```

### ❌ לא נכון
```tsx
<Typography>שלום</Typography>
<Button>שמור</Button>
```

### חריגים מותרים
- שמות משתנשים, קבועים
- class names, styles
- URLs
- קוד טכני

## 🎓 למידע נוסף

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [eslint-plugin-i18next](https://github.com/edvardchen/eslint-plugin-i18next)
