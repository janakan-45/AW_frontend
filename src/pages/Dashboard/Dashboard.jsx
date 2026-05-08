import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Header from "../../components/Header/Header";
import {
  Users,
  FileText,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import styles from "./Dashboard.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { clients } = useApp();
  const navigate = useNavigate();

  const totalAUM = clients.reduce((sum, c) => {
    const ret = c.retirementAccounts?.reduce((s, a) => s + a.value, 0) ?? 0;
    const nonRet = c.nonRetirementAccounts?.reduce((s, a) => s + a.value, 0) ?? 0;
    const trust = c.trustAssets?.reduce((s, a) => s + a.value, 0) ?? 0;
    return sum + ret + nonRet + trust;
  }, 0);

  const totalReports = clients.reduce((sum, c) => sum + (c.reports?.length ?? 0), 0);
  const recentClients = [...clients].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, 5);

  const stats = [
    { label: "Total Clients", value: clients.length, icon: Users, color: "#2563eb", bg: "#eff6ff" },
    { label: "Total Reports", value: totalReports, icon: FileText, color: "#059669", bg: "#ecfdf5" },
    { label: "Assets Under Mgmt", value: fmt(totalAUM), icon: TrendingUp, color: "#7c3aed", bg: "#f5f3ff" },
  ];

  return (
    <div className={styles.page}>
      <Header title="Dashboard" subtitle="Welcome back — here's your client overview" />
      <div className={styles.content}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
                <s.icon size={20} />
              </div>
              <div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.mainGrid}>
          {/* Client List */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Clients</h2>
                <p className={styles.cardSub}>All active client relationships</p>
              </div>
              <button className={styles.btnPrimary} onClick={() => navigate("/clients/new")}>
                <Plus size={16} />
                New Client
              </button>
            </div>

            <div className={styles.clientList}>
              {clients.map((client) => {
                const totalNet =
                  (client.retirementAccounts?.reduce((s, a) => s + a.value, 0) ?? 0) +
                  (client.nonRetirementAccounts?.reduce((s, a) => s + a.value, 0) ?? 0) +
                  (client.trustAssets?.reduce((s, a) => s + a.value, 0) ?? 0);

                return (
                  <div key={client.id} className={styles.clientRow}>
                    <div className={styles.clientAvatar}>
                      {client.client1Name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className={styles.clientInfo}>
                      <div className={styles.clientName}>
                        {client.client1Name}
                        {client.client2Name ? ` & ${client.client2Name}` : ""}
                      </div>
                      <div className={styles.clientMeta}>
                        {client.lastReportDate ? (
                          <span className={styles.metaBadge}>
                            <Calendar size={11} />
                            Last report: {client.lastReportDate}
                          </span>
                        ) : (
                          <span className={styles.metaBadgeWarn}>
                            <AlertCircle size={11} />
                            No reports yet
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.clientAUM}>{fmt(totalNet)}</div>
                    <div className={styles.clientActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        View
                      </button>
                      <button
                        className={styles.actionBtnPrimary}
                        onClick={() => navigate(`/clients/${client.id}/report/new`)}
                      >
                        New Report
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Quick Actions</h2>
              <div className={styles.quickActions}>
                <button className={styles.quickAction} onClick={() => navigate("/clients/new")}>
                  <div className={styles.qaIcon} style={{ background: "#eff6ff", color: "#2563eb" }}>
                    <Plus size={18} />
                  </div>
                  <div>
                    <div className={styles.qaTitle}>Create Client Profile</div>
                    <div className={styles.qaSub}>Add new client</div>
                  </div>
                  <ArrowRight size={16} className={styles.qaArrow} />
                </button>
                <button className={styles.quickAction} onClick={() => navigate("/reports")}>
                  <div className={styles.qaIcon} style={{ background: "#ecfdf5", color: "#059669" }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className={styles.qaTitle}>View All Reports</div>
                    <div className={styles.qaSub}>Browse reports</div>
                  </div>
                  <ArrowRight size={16} className={styles.qaArrow} />
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.card} style={{ marginTop: 20 }}>
              <h2 className={styles.cardTitle}>Recent Clients</h2>
              <div className={styles.recentList}>
                {recentClients.map((c) => (
                  <div
                    key={c.id}
                    className={styles.recentItem}
                    onClick={() => navigate(`/clients/${c.id}`)}
                  >
                    <div
                      className={styles.recentDot}
                      style={{ background: c.reports?.length ? "#059669" : "#f59e0b" }}
                    />
                    <span className={styles.recentName}>{c.client1Name}</span>
                    <span className={styles.recentDate}>{c.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
