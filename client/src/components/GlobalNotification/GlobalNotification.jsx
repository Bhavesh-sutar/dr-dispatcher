import { useNotification } from "../../context/NotificationContext";

import "./GlobalNotification.css";

const GlobalNotification = () => {
  const { notification, hideNotification } = useNotification();

  if (!notification) {
    return null;
  }

  return (
    <div className={`global-notification ${notification.type}`}>
      <span className="global-notification-message">
        {notification.message}
      </span>

      <button
        type="button"
        className="global-notification-close"
        onClick={hideNotification}
        aria-label="Close notification"
      >
        x
      </button>
    </div>
  );
};

export default GlobalNotification;
