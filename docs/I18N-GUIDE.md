# 🌍 I18N Development Guide - Lev Hedva

## תרגום ובינלאומיות בפרויקט

פרויקט זה תומך במלוא ב-**I18N (Internationalization)** עם תמיכה בעברית ואנגלית, כולל RTL ו-LTR.

## 🛠️ כיצד להשתמש בתרגומים

### ב-React Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.debugInfo', { userCount: 5, productCount: 10 })}</p>
    </div>
  );
}
```

### הוספת תרגומים חדשים

1. **הוסף למילון העברי** - `src/i18n/locales/he.json`:
```json
{
  "newSection": {
    "title": "כותרת חדשה",
    "description": "תיאור עם פרמטר: {{value}}"
  }
}
```

2. **הוסף למילון האנגלי** - `src/i18n/locales/en.json`:
```json
{
  "newSection": {
    "title": "New Title",
    "description": "Description with parameter: {{value}}"
  }
}
```

## 🔒 אכיפת ESLint

המערכת מכילה **חוקי ESLint קפדניים** המונעים שימוש בטקסטים קשיחים:

### ✅ נכון
```tsx
<Typography variant="h6">{t('auth.welcomeTitle')}</Typography>
```

### ❌ שגוי - יזרוק שגיאת ESLint
```tsx
<Typography variant="h6">ברוכים הבאים</Typography>
```

## 🌐 שינוי שפה

המשתמש יכול לשנות שפה באמצעות **רכיב בחירת השפה** שנמצא בכותרת:

```tsx
import LanguageSelector from '../components/LanguageSelector';

// השפה תישמר ב-localStorage ותתעדכן אוטומטית
```

## 📱 תמיכה RTL/LTR

המערכת תומכת אוטומטית ב:
- **RTL** עבור עברית
- **LTR** עבור אנגלית

### רכיב RTL Provider
```tsx
import RTLThemeProvider from '../components/RTLThemeProvider';

function App() {
  return (
    <RTLThemeProvider>
      {/* כל התכנים יתעדכנו אוטומטית לכיוון הנכון */}
    </RTLThemeProvider>
  );
}
```

## 🔧 זיהוי שפה אוטומטי

בטעינה ראשונה המערכת:

1. **בודקת localStorage** - שפה שנשמרה קודם
2. **בודקת שפת הדפדפן** - navigator.language
3. **שפת ברירת מחדל** - עברית

## 📁 מבנה קבצי התרגום

```
src/
├── i18n/
│   ├── index.ts          # הגדרות i18next
│   └── locales/
│       ├── he.json       # עברית
│       └── en.json       # אנגלית
```

### מבנה מילון
```json
{
  "common": {
    "loading": "טוען...",
    "save": "שמור"
  },
  "auth": {
    "welcomeTitle": "ברוכים הבאים",
    "login": "היכנס"
  },
  "dashboard": {
    "title": "לוח בקרה",
    "debugInfo": "משתמשים: {{userCount}}, מוצרים: {{productCount}}"
  }
}
```

## 🚫 חוקי ESLint לI18N

### חוקים פעילים:
- `i18next/no-literal-string` - מונע טקסטים קשיחים

### יוצאים מן הכלל:
- קבצי בדיקות (`*.test.ts`, `*.spec.ts`)
- קבצי הגדרות (`theme.ts`, `i18n/**`)
- אטריביוטים טכניים (`className`, `style`, `href` וכו')

## 💡 עצות לפיתוח

1. **תמיד השתמש ב-`t()` function** עבור טקסטים הנראים למשתמש
2. **השתמש בפרמטרים** עבור ערכים דינמיים: `t('key', { value })`
3. **ארגן מפתחות** בקבוצות לוגיות (auth, dashboard, etc.)
4. **בדוק ששתי השפות מעודכנות** כשמוסיפים מפתחות חדשים

## 🧪 בדיקה

```bash
# בדיקת ESLint
npm run lint

# תיקון אוטומטי של שגיאות ESLint
npm run lint:fix

# הרצת הפרויקט
npm start
```

המערכת מוגדרת כך שכל פיתוח חדש חייב לעמוד בסטנדרטים של I18N! ✨