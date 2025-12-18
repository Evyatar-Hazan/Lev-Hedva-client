# 📚 תיעוד Client - Lev-Hedva

תיעוד עבור אפליקציית React (Frontend).

## 📁 קבצי תיעוד זמינים

### מדריכים טכניים

- **[I18N-GUIDE.md](I18N-GUIDE.md)** - מדריך בינלאום (i18n) ותרגומים
- **[CODE_QUALITY.md](CODE_QUALITY.md)** - סטנדרטים ואיכות קוד
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - הגדרות התקנה מלאות
- **[NETLIFY-BUILD-FIX.md](NETLIFY-BUILD-FIX.md)** - תיקון build ל-Netlify

### מדריכי בדיקות (Testing) 🆕

- **[TESTING-QUICK-START.md](TESTING-QUICK-START.md)** - ⭐ התחל כאן! מדריך מהיר עם דוגמאות
- **[TESTING.md](TESTING.md)** - מדריך מקיף לכתיבת בדיקות
- **[TESTING-INFRASTRUCTURE.md](TESTING-INFRASTRUCTURE.md)** - סקירה ארכיטקטונית של תשתית הבדיקות
- **[CODE-QUALITY-RECOMMENDATIONS.md](CODE-QUALITY-RECOMMENDATIONS.md)** - המלצות לשיפור ו-best practices

## 🧪 תשתית בדיקות (Testing Infrastructure)

### כלים זמינים

- **Jest** - בדיקות יחידה ואינטגרציה
- **React Testing Library** - בדיקות קומפוננטות
- **Playwright** - בדיקות E2E
- **MSW** - חיקוי API
- **jest-axe** - בדיקות נגישות

### פקודות בדיקה

```bash
npm test                # מצב watch (פיתוח)
npm run test:ci         # הרצה אחת (CI)
npm run test:coverage   # עם כיסוי
npm run test:a11y       # נגישות בלבד
npm run test:e2e        # E2E
npm run validate        # כל הבדיקות
```

### כלי עזר לבדיקות

- `src/tests/utils/test-utils.tsx` - פונקציות render מותאמות
- `src/tests/utils/accessibility-helpers.ts` - בדיקות נגישות
- `src/tests/factories/` - יצירת נתוני בדיקה
- `src/tests/mocks/` - חיקוי API handlers

## 🏗️ מבנה הפרויקט

```
Lev-Hedva-client/
├── src/
│   ├── api/              # HTTP clients ו-axios
│   ├── components/       # קומפוננטות React
│   ├── features/         # פיצ'רים (auth, etc)
│   ├── hooks/           # Custom React hooks
│   ├── i18n/            # תרגומים (עברית/אנגלית)
│   ├── lib/             # טיפוסים ו-utilities
│   ├── pages/           # דפי האפליקציה
│   └── theme/           # עיצוב ונושאים
├── public/              # קבצים סטטיים
└── tests/              # בדיקות E2E
```

## 🛠️ טכנולוגיות

- **React 18** - ספריית UI
- **TypeScript** - שפת פיתוח
- **Material-UI (MUI)** - מערכת עיצוב
- **React Query** - ניהול state ו-cache
- **i18next** - בינלאום ותרגומים
- **Axios** - HTTP client
- **Playwright** - בדיקות E2E

## 🚀 פקודות שימושיות

```bash
# פיתוח
npm start

# בנייה לייצור
npm run build

# בדיקות
npm test
npm run test:e2e

# Linting ועיצוב
npm run lint
npm run format
```

## 🔗 קישורים

- [README ראשי](../README.md)
- [תיעוד כללי](../../docs/)
- [תיעוד סרבר](../../Lev-Hedva-sever/docs/)

---

**טיפ:** לפני תחילת הפיתוח, קרא את [מדריך ה-i18n](../I18N-GUIDE.md) להבנת מערכת התרגומים.
