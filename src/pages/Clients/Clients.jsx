import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Header from "../../components/Header/Header";
import { Plus, ChevronRight, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import styles from "./Clients.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n ?? 0);

export default function Clients() {
  const { clients } = useApp();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Header title="Clients" subtitle={`${clients.length} client${clients.length !== 1 ? "s" : ""} in your portfolio`} />
      <div className={styles.content}>
        <div className={styles.topRow}>
          <h2 className={styles.heading}>All Clients</h2>
          <button className={styles.btnPrimary} onClick={() => navigate("/clients/new")}>
            <Plus size={16} /> New Client
          </button>
        </div>

        <div className={styles.grid}>
          {clients.map((client) => {
            const retTotal = client.retirementAccounts?.reduce((s, a) => s + a.value, 0) ?? 0;
            const nonRetTotal = client.nonRetirementAccounts?.reduce((s, a) => s + a.value, 0) ?? 0;
            const trustTotal = client.trustAssets?.reduce((s, a) => s + a.value, 0) ?? 0;
            const liabTotal = client.liabilities?.reduce((s, a) => s + a.value, 0) ?? 0;
            const grandTotal = retTotal + nonRetTotal + trustTotal;

            const initials = client.client1Name
              .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div key={client.id} className={styles.clientCard} onClick={() => navigate(`/clients/${client.id}`)}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{initials}</div>
                  <div className={styles.clientInfo}>
                    <div className={styles.clientName}>
                      {client.client1Name}
                      {client.client2Name ? ` & ${client.client2Name}` : ""}
                    </div>
                    <div className={styles.clientSub}>
                      {client.lastReportDate ? (
                        <span className={styles.badge}>
                          <Calendar size={11} /> {client.lastReportDate}
                        </span>
                      ) : (
                        <span className={styles.badgeWarn}>
                          <AlertCircle size={11} /> No reports
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} color="#94a3b8" />
                </div>

                <div className={styles.statsRow}>
                  <Stat label="Net Worth" value={fmt(grandTotal)} color="#2563eb" />
                  <Stat label="Liabilities" value={fmt(liabTotal)} color="#ef4444" />
                  <Stat label="Reports" value={client.reports?.length ?? 0} color="#059669" />
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                  >
                    View Profile
                  </button>
                  <button
                    className={styles.actionBtnPrimary}
                    onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}/report/new`); }}
                  >
                    <Plus size={13} /> New Report
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new client card */}
          <div className={styles.addCard} onClick={() => navigate("/clients/new")}>
            <Plus size={28} color="#94a3b8" />
            <span>Add New Client</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue} style={{ color }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
