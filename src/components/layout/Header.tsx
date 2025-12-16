import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  NotificationsNone,
  Logout,
  Settings,
  Person,
  Warning,
  Info,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { useAuth } from "../../features/auth/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../LanguageSelector";
import { COLORS, colorUtils } from "../../theme/colors";
import { useNotifications } from "../../hooks";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const { notifications, unreadCount } = useNotifications();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate("/profile"); // Navigate to profile page
  };

  const handleSettingsClick = () => {
    handleUserMenuClose();
    navigate("/audit"); // Navigate to audit/settings page
  };

  const handleNotificationClick = (notification: any) => {
    handleNotificationsClose();
    if (notification.action?.path) {
      navigate(notification.action.path);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <Error fontSize="small" sx={{ color: COLORS.status.error }} />;
      case "warning":
        return (
          <Warning fontSize="small" sx={{ color: COLORS.status.warning }} />
        );
      case "success":
        return (
          <CheckCircle fontSize="small" sx={{ color: COLORS.status.success }} />
        );
      default:
        return <Info fontSize="small" sx={{ color: COLORS.status.info }} />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("time.now");
    if (diffMins < 60) return t("time.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("time.hoursAgo", { count: diffHours });
    return t("time.daysAgo", { count: diffDays });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${colorUtils.withOpacity(
          COLORS.primary.light,
          0.2
        )}`,
        left: 0,
        right: 0,
        width: "100%",
        borderRadius: "0 0 0px 0px",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: 0, // Remove padding from sides
          mx: { xs: 2, sm: 3 }, // Internal margin instead of padding
        }}
      >
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{
            mr: { xs: 1, sm: 2 },
            padding: "8px",
            borderRadius: "12px",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: colorUtils.withOpacity(
                COLORS.text.onPrimary,
                0.1
              ),
              transform: "scale(1.05)",
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and Title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            flexGrow: 1,
            minWidth: 0, // للسماح بالانكماش
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src="/logoLevChedva.png"
              alt="לב חדוה"
              style={{
                height: isMobile ? 28 : 36,
                width: "auto",
                borderRadius: "4px",
              }}
            />
          </Box>
          {!isMobile && (
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {t("header.systemTitle")}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontSize: "0.75rem",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                {t("header.systemSubtitle")}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          <Tooltip title={t("header.notifications")}>
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{
                padding: "8px",
                borderRadius: "12px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: colorUtils.withOpacity(
                    COLORS.text.onPrimary,
                    0.1
                  ),
                  transform: "scale(1.05)",
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="secondary">
                <NotificationsNone />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title={`${user?.firstName} ${user?.lastName}`}>
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                padding: "4px",
                borderRadius: "12px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: colorUtils.withOpacity(
                    COLORS.text.onPrimary,
                    0.1
                  ),
                  transform: "scale(1.05)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    backgroundColor: COLORS.secondary.main,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    border: `2px solid ${colorUtils.withOpacity(
                      COLORS.text.onPrimary,
                      0.2
                    )}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </Avatar>
                {!isMobile && (
                  <Box
                    sx={{
                      textAlign: "right",
                      display: { xs: "none", md: "block" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        lineHeight: 1.2,
                        fontSize: "0.875rem",
                      }}
                    >
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Chip
                      label={user?.role || "משתמש"}
                      size="small"
                      sx={{
                        height: "16px",
                        fontSize: "0.65rem",
                        backgroundColor: colorUtils.withOpacity(
                          COLORS.text.onPrimary,
                          0.2
                        ),
                        color: COLORS.text.onPrimary,
                      }}
                    />
                  </Box>
                )}
              </Box>
            </IconButton>
          </Tooltip>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          sx={{
            mt: 1,
            "& .MuiPaper-root": {
              borderRadius: "12px",
              minWidth: 200,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              border: `1px solid ${COLORS.border.light}`,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("menu.profile")}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("menu.settings")}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: COLORS.status.error }}>
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: COLORS.status.error }} />
            </ListItemIcon>
            <ListItemText>{t("auth.logout")}</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          sx={{
            mt: 1,
            "& .MuiPaper-root": {
              borderRadius: "12px",
              minWidth: 300,
              maxWidth: 400,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              border: `1px solid ${COLORS.border.light}`,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("header.notifications")}
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={t("notifications.newNotifications")}
                size="small"
                color="primary"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
          <Divider />

          {notifications.length === 0 ? (
            <MenuItem disabled>
              <ListItemText
                primary={t("notifications.noNotifications", "אין התראות חדשות")}
              />
            </MenuItem>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  minHeight: 60,
                  alignItems: "flex-start",
                  opacity: notification.isRead ? 0.7 : 1,
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : colorUtils.withOpacity(COLORS.primary.main, 0.02),
                }}
              >
                <ListItemIcon sx={{ mt: 0.5, minWidth: 32 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimeAgo(notification.timestamp)}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{
                    fontWeight: notification.isRead ? 400 : 600,
                    fontSize: "0.875rem",
                  }}
                />
              </MenuItem>
            ))
          )}

          {notifications.length > 5 && (
            <>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleNotificationsClose();
                  navigate("/notifications");
                }}
              >
                <ListItemText
                  primary={t("notifications.viewAll", "צפה בכל ההתראות")}
                  sx={{ textAlign: "center" }}
                />
              </MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
