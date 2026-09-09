let logoutHandler = null;

const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const triggerLogout = () => {
  if (logoutHandler) {
    logoutHandler();
  }
};

const authServiceBridge = {
  setLogoutHandler,
  triggerLogout,
};

export default authServiceBridge;
