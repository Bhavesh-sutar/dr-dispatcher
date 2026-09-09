import { createContext, useContext, useEffect, useState } from "react";

import notificationService from "../services/notificationService";

const NotificationContext = createContext(null);

const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = setTimeout(() => {
      setNotification(null);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [notification]);

  useEffect(() => {
    notificationService.setNotificationHandler(showNotification);

    return () => {
      notificationService.setNotificationHandler(null);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notification,
        showNotification,
        hideNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }

  return context;
};

export default NotificationProvider;
