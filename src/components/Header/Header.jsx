import styles from "./Header.module.css";
import { Bell, Search } from "lucide-react";

export default function Header({ title, subtitle }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.right}>
        <div className={styles.searchBox}>
          <Search size={14} color="#94a3b8" />
          <input placeholder="Quick search..." className={styles.searchInput} />
        </div>
        <button className={styles.iconBtn}>
          <Bell size={16} />
        </button>
        <div className={styles.avatar}>AW</div>
      </div>
    </header>
  );
}
