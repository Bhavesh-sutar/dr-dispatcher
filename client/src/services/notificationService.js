let notificationHandler = null;

const setNotificationHandler = (handler) => {
  notificationHandler = handler;
};

const showNotification = (type, message) => {
  if (notificationHandler) {
    notificationHandler(type, message);
  }
};

const notificationService = {
  setNotificationHandler,
  showNotification,
};

export default notificationService;
