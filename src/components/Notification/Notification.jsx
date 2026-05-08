import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";
import styles from "./Notification.module.css";

export default function Notification({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Info;

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.icon}>
        <Icon size={20} />
      </div>
      <div className={styles.message}>{message}</div>
      <button className={styles.closeBtn} onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}
