import React from "react";
import { Box, Typography, Alert } from "@mui/material";
import {
  Person,
  Inventory,
  Assignment,
  Warning,
  VolunteerActivism,
  AccessTime,
} from "@mui/icons-material";
import StatsGrid from "../components/StatsGrid";
import { useUsers, useProducts, useLoanStats } from "../hooks";
import { useVolunteerStatsByUser } from "../hooks/useVolunteers";
import { useAuth } from "../features/auth/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../lib/types";

const DashboardPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers({ limit: 1 });
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({ limit: 1 });
  const {
    data: loanStats,
    isLoading: statsLoading,
    error: statsError,
  } = useLoanStats();

  // Get volunteer stats if user is a volunteer
  const isVolunteer = auth.user?.role === UserRole.VOLUNTEER;
  const { data: volunteerStats, isLoading: volunteerStatsLoading } =
    useVolunteerStatsByUser(isVolunteer && auth.user?.id ? auth.user.id : "");

  // Debug logging
  console.log("🔍 Dashboard Data:", {
    usersData,
    productsData,
    loanStats,
    volunteerStats,
  });

  // Extract counts with proper fallbacks
  const userCount = (usersData as any)?.total || 0;
  const productCount = (productsData as any)?.total || 0;
  const activeLoans = (loanStats as any)?.totalActiveLoans || 0;
  const overdueLoans = (loanStats as any)?.totalOverdueLoans || 0;

  if (!auth.isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <Typography variant="h6">{t("auth.pleaseLogin")}</Typography>
          <Typography>{t("auth.defaultCredentials.email")}</Typography>
          <Typography>{t("auth.defaultCredentials.password")}</Typography>
        </Alert>
      </Box>
    );
  }

  if (usersError || productsError || statsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">{t("dashboard.dataError")}</Typography>
          <Typography>{t("dashboard.serverUrl")}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t("dashboard.title")}
      </Typography>

      {/* Show different stats based on user role */}
      {isVolunteer ? (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography>
              <strong>{t("dashboard.welcomeVolunteer")}</strong>{" "}
              {t("dashboard.volunteerInfo")}
            </Typography>
          </Alert>

          <StatsGrid
            stats={[
              {
                icon: <VolunteerActivism />,
                value: volunteerStats?.activitiesCount || 0,
                label: t("dashboard.myActivities"),
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                onClick: () => navigate("/volunteers"),
                loading: volunteerStatsLoading,
              },
              {
                icon: <AccessTime />,
                value: volunteerStats?.totalHours || 0,
                label: t("dashboard.totalHours"),
                gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                onClick: () => navigate("/volunteers"),
                loading: volunteerStatsLoading,
              },
            ]}
          />
        </>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography>
              <strong>{t("dashboard.debug")}</strong>{" "}
              {t("dashboard.debugInfo", {
                userCount,
                productCount,
                activeLoans,
              })}
            </Typography>
          </Alert>

          <StatsGrid
            stats={[
              {
                icon: <Person />,
                value: userCount,
                label: t("dashboard.users"),
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                onClick: () => navigate("/users"),
                loading: usersLoading,
              },
              {
                icon: <Inventory />,
                value: productCount,
                label: t("dashboard.products"),
                gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                onClick: () => navigate("/products"),
                loading: productsLoading,
              },
              {
                icon: <Assignment />,
                value: activeLoans,
                label: t("dashboard.activeLoans"),
                gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                onClick: () => navigate("/loans"),
                loading: statsLoading,
              },
              {
                icon: <Warning />,
                value: overdueLoans,
                label: t("dashboard.overdue"),
                gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                onClick: () => navigate("/loans"),
                loading: statsLoading,
              },
            ]}
          />
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
