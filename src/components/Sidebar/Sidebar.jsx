import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <TrendingUp size={20} />
        </div>
        <div>
          <div className={styles.logoText}>AW Portal</div>
          <div className={styles.logoSub}>Client Report System</div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <span className={styles.navLabel}>MAIN MENU</span>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className={styles.chevron} />
            </NavLink>
          ))}
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.version}>MVP v1.0 · 2025</div>
      </div>
    </aside>
  );
}
