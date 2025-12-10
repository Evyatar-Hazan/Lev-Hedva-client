/**
 * מערכת צבעים מרכזית לפרויקט לב חדווה
 * כל הצבעים בפרויקט צריכים להגיע מקובץ זה
 * נגזרת מצבעי הלוגו של הארגון
 */

// צבעי הבסיס מהלוגו
export const BRAND_COLORS = {
  // צבע ראשי - האדום המרכזי של הלוגו
  PRIMARY: '#DA2037',
  
  // וריאציות של הצבע הראשי
  PRIMARY_DARK: '#B51A2D',
  PRIMARY_LIGHT: '#F05467',
  
  // צבעי טקסט בסיסיים
  TEXT_PRIMARY: '#000000',
  TEXT_ON_PRIMARY: '#FFFFFF',
  
  // צבעי רקע
  BACKGROUND: '#FFFFFF',
  BACKGROUND_SOFT: '#F4F4F4',
} as const;

// מערכת צבעים מורחבת נגזרת מצבעי הבסיס
export const COLORS = {
  // צבעים ראשיים - מבוסס על הלוגו
  primary: {
    main: BRAND_COLORS.PRIMARY,
    dark: BRAND_COLORS.PRIMARY_DARK,
    light: BRAND_COLORS.PRIMARY_LIGHT,
    contrast: BRAND_COLORS.TEXT_ON_PRIMARY,
  },
  
  // צבע משני - גוון כחול מקצועי שמתאים לאדום
  secondary: {
    main: '#1976d2',
    dark: '#1565c0', 
    light: '#42a5f5',
    contrast: BRAND_COLORS.TEXT_ON_PRIMARY,
  },
  
  // צבעי רקע
  background: {
    default: BRAND_COLORS.BACKGROUND,
    paper: BRAND_COLORS.BACKGROUND,
    soft: BRAND_COLORS.BACKGROUND_SOFT,
    subtle: '#F8F9FA',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // צבעי טקסט
  text: {
    primary: BRAND_COLORS.TEXT_PRIMARY,
    secondary: '#5A5A5A',
    disabled: '#9E9E9E',
    hint: '#BDBDBD',
    onPrimary: BRAND_COLORS.TEXT_ON_PRIMARY,
    link: BRAND_COLORS.PRIMARY,
    linkHover: BRAND_COLORS.PRIMARY_DARK,
  },
  
  // צבעי גבולות
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
    focus: BRAND_COLORS.PRIMARY,
  },
  
  // צבעי מצבים
  status: {
    success: '#4CAF50',
    successLight: '#A5D6A7',
    successDark: '#388E3C',
    
    error: '#F44336',
    errorLight: '#EF9A9A',
    errorDark: '#D32F2F',
    
    warning: '#FF9800',
    warningLight: '#FFB74D',
    warningDark: '#F57C00',
    
    info: '#2196F3',
    infoLight: '#64B5F6',
    infoDark: '#1976D2',
  },
  
  // צבעי אינטראקציה
  action: {
    hover: 'rgba(218, 32, 55, 0.04)', // הובר בהיר על בסיס הצבע הראשי
    hoverStrong: 'rgba(218, 32, 55, 0.08)',
    selected: 'rgba(218, 32, 55, 0.12)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(218, 32, 55, 0.12)',
  },
  
  // צבעי גרייסקייל
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5', 
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // צבעי רכיבי UI ספציפיים
  button: {
    // כפתור ראשי
    primaryBackground: BRAND_COLORS.PRIMARY,
    primaryBackgroundHover: BRAND_COLORS.PRIMARY_DARK,
    primaryBackgroundDisabled: '#BDBDBD',
    primaryText: BRAND_COLORS.TEXT_ON_PRIMARY,
    primaryTextDisabled: 'rgba(255, 255, 255, 0.5)',
    
    // כפתור משני  
    secondaryBackground: 'transparent',
    secondaryBackgroundHover: 'rgba(218, 32, 55, 0.04)',
    secondaryBorder: BRAND_COLORS.PRIMARY,
    secondaryText: BRAND_COLORS.PRIMARY,
    secondaryTextHover: BRAND_COLORS.PRIMARY_DARK,
    
    // כפתור רגיל
    defaultBackground: '#F5F5F5',
    defaultBackgroundHover: '#EEEEEE',
    defaultText: BRAND_COLORS.TEXT_PRIMARY,
  },
  
  // צבעי שדות קלט
  input: {
    background: BRAND_COLORS.BACKGROUND,
    border: '#E0E0E0',
    borderHover: '#BDBDBD',
    borderFocus: BRAND_COLORS.PRIMARY,
    borderError: '#F44336',
    text: BRAND_COLORS.TEXT_PRIMARY,
    placeholder: '#9E9E9E',
    label: '#616161',
    disabled: '#F5F5F5',
  },
  
  // צבעי כרטיסים
  card: {
    background: BRAND_COLORS.BACKGROUND,
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowHover: 'rgba(0, 0, 0, 0.15)',
    border: '#F0F0F0',
  },
  
  // צבעי ניווט
  navigation: {
    background: BRAND_COLORS.BACKGROUND,
    text: BRAND_COLORS.TEXT_PRIMARY,
    textActive: BRAND_COLORS.PRIMARY,
    textHover: BRAND_COLORS.PRIMARY_DARK,
    border: '#F0F0F0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // צבעי טבלאות
  table: {
    headerBackground: BRAND_COLORS.BACKGROUND_SOFT,
    headerText: BRAND_COLORS.TEXT_PRIMARY,
    rowBackground: BRAND_COLORS.BACKGROUND,
    rowBackgroundAlternate: '#FAFAFA',
    rowBackgroundHover: 'rgba(218, 32, 55, 0.04)',
    border: '#E0E0E0',
  },
  
  // צבעי אייקונים
  icon: {
    default: '#757575',
    primary: BRAND_COLORS.PRIMARY,
    secondary: '#9E9E9E',
    disabled: '#BDBDBD',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
} as const;

// פונקציות עזר ליצירת וריאציות צבע - מוגדרות קודם
const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const colorUtils = {
  /**
   * יוצר צבע עם שקיפות
   */
  withOpacity,
  
  /**
   * מחזיר את הצבע הראשי עם שקיפות
   */
  primaryWithOpacity: (opacity: number): string => {
    return withOpacity(BRAND_COLORS.PRIMARY, opacity);
  },
  
  /**
   * מחזיר צבע הובר לצבע נתון
   */
  getHoverColor: (baseColor: string): string => {
    // אם זה הצבע הראשי, החזר את הגרסה הכהה
    if (baseColor === BRAND_COLORS.PRIMARY) {
      return BRAND_COLORS.PRIMARY_DARK;
    }
    // אחרת החזר עם שקיפות
    return withOpacity(baseColor, 0.8);
  },
  
  /**
   * יוצר גרדיינט ראשי מודרני
   */
  primaryGradient: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY} 0%, ${BRAND_COLORS.PRIMARY_DARK} 100%)`,
  
  /**
   * יוצר גרדיינט עדין לרקע
   */
  backgroundGradient: `linear-gradient(135deg, ${BRAND_COLORS.BACKGROUND} 0%, ${BRAND_COLORS.BACKGROUND_SOFT} 100%)`,
  
  /**
   * צלליות מודרניות
   */
  shadows: {
    soft: '0 2px 8px rgba(0,0,0,0.08)',
    medium: '0 4px 16px rgba(0,0,0,0.12)',
    strong: '0 8px 32px rgba(0,0,0,0.16)',
    primary: `0 4px 16px ${withOpacity(BRAND_COLORS.PRIMARY, 0.25)}`,
  },
} as const;

// מערכת צבעים מורחבת עם כלי עזר
export const COLORS_WITH_UTILS = {
  ...COLORS,
  colorUtils,
} as const;

// ייצוא הצבעים הבסיסיים למען נוחות
export const {
  primary,
  secondary, 
  background,
  text,
  border,
  status,
  action,
  grey,
  button,
  input,
  card,
  navigation,
  table,
  icon,
} = COLORS;

export default COLORS;