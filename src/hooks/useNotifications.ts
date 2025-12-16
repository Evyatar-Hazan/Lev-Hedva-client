import { useMemo } from 'react';
import { useLoanStats, useLoans } from './useLoans';
import { useProducts } from './useProducts';
import { useUsers } from './useUsers';
import { useTranslation } from 'react-i18next';
import { Product, User } from '../lib/types';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  isRead: boolean;
  action?: {
    label: string;
    path: string;
  };
}

export const useNotifications = () => {
  const { t } = useTranslation();
  const { data: loanStats } = useLoanStats();
  const { data: loansData } = useLoans({ limit: 50, status: 'ACTIVE' });
  const { data: productsData } = useProducts({ limit: 10 });
  const { data: usersData } = useUsers({ limit: 10 });

  const notifications = useMemo((): Notification[] => {
    const notifs: Notification[] = [];
    const now = new Date();

    // התראות על הלוואות מושגות
    if (loanStats?.totalOverdueLoans && loanStats.totalOverdueLoans > 0) {
      notifs.push({
        id: 'overdue-loans',
        title: t('notifications.overdueLoans.title'),
        message: t('notifications.overdueLoans.message', { count: loanStats.totalOverdueLoans }),
        type: 'error',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000), // לפני 10 דקות
        isRead: false,
        action: {
          label: t('notifications.viewLoans'),
          path: '/loans?filter=overdue',
        },
      });
    }

    // התראות על הלוואות חדשות שנוצרו היום
    if (loansData?.loans) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayLoans = loansData.loans.filter(loan => new Date(loan.createdAt) >= today);

      if (todayLoans.length > 0) {
        notifs.push({
          id: 'new-loans-today',
          title: t('notifications.newLoans.title'),
          message: t('notifications.newLoans.message', { count: todayLoans.length }),
          type: 'info',
          timestamp: new Date(now.getTime() - 30 * 60 * 1000), // לפני 30 דקות
          isRead: false,
          action: {
            label: t('notifications.viewLoans'),
            path: '/loans',
          },
        });
      }
    }

    // התראות על מוצרים חדשים
    if (productsData?.data) {
      const recentProducts = productsData.data.filter((product: Product) => {
        const createdDate = new Date(product.createdAt);
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return createdDate >= dayAgo;
      });

      if (recentProducts.length > 0) {
        notifs.push({
          id: 'new-products',
          title: t('notifications.newProducts.title'),
          message: t('notifications.newProducts.message', { count: recentProducts.length }),
          type: 'success',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // לפני 2 שעות
          isRead: false,
          action: {
            label: t('notifications.viewProducts'),
            path: '/products',
          },
        });
      }
    }

    // התראת דוח חודשי מוכן (סימולציה)
    const isFirstOfMonth = now.getDate() === 1;
    if (isFirstOfMonth || loanStats?.totalActiveLoans) {
      notifs.push({
        id: 'monthly-report',
        title: t('notifications.monthlyReport.title'),
        message: t('notifications.monthlyReport.message'),
        type: 'info',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // אתמול
        isRead: true,
        action: {
          label: t('notifications.viewReport'),
          path: '/audit',
        },
      });
    }

    // התראות על משתמשים חדשים
    if (usersData?.users) {
      const recentUsers = usersData.users.filter((user: User) => {
        const createdDate = new Date(user.createdAt);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return createdDate >= weekAgo;
      });

      if (recentUsers.length > 0) {
        notifs.push({
          id: 'new-users',
          title: t('notifications.newUsers.title'),
          message: t('notifications.newUsers.message', { count: recentUsers.length }),
          type: 'info',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // לפני 6 שעות
          isRead: false,
          action: {
            label: t('notifications.viewUsers'),
            path: '/users',
          },
        });
      }
    }

    return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [loanStats, loansData, productsData, usersData, t]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    hasNotifications: notifications.length > 0,
  };
};
