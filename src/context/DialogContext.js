import React, { createContext, useCallback, useContext, useState } from "react";
import CustomAlertDialog from "../components/CustomAlertDialog";

const DialogContext = createContext({
  showDialog: () => {},
  showMessage: () => {},
  hideDialog: () => {},
});

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({
    visible: false,
    title: "Stoodify",
    message: "",
    type: "info",
    confirmText: "OK",
    cancelText: "Batal",
    showCancel: false,
    onConfirm: null,
    onCancel: null,
  });

  const hideDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, visible: false }));
  }, []);

  const showDialog = useCallback(
    ({
      title = "Stoodify",
      message = "",
      type = "info",
      confirmText = "OK",
      cancelText = "Batal",
      showCancel = false,
      onConfirm,
      onCancel,
    }) => {
      setDialog({
        visible: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        showCancel,
        onConfirm,
        onCancel,
      });
    },
    [],
  );

  const showMessage = useCallback(
    (message, title = "Stoodify", type = "info") => {
      showDialog({
        title,
        message,
        type,
        showCancel: false,
      });
    },
    [showDialog],
  );

  return (
    <DialogContext.Provider value={{ showDialog, showMessage, hideDialog }}>
      {children}
      <CustomAlertDialog {...dialog} onClose={hideDialog} />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}

export default DialogContext;
