import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Header from "../../components/Header/Header";
import { FileText, Eye, Calendar, ChevronRight } from "lucide-react";
import styles from "./Reports.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n ?? 0);

export default function Reports() {
  const { clients } = useApp();
  const navigate = useNavigate();

  // Flatten all reports across clients
  const allReports = clients.flatMap((c) =>
    (c.reports ?? []).map((r) => ({ ...r, client: c }))
  ).sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className={styles.page}>
      <Header title="Reports" subtitle={`${allReports.length} report${allReports.length !== 1 ? "s" : ""} generated`} />
      <div className={styles.content}>
        {allReports.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={48} color="#cbd5e1" />
            <h3>No reports yet</h3>
            <p>Create a quarterly report from any client profile.</p>
            <button className={styles.btnPrimary} onClick={() => navigate("/clients")}>
              Go to Clients
            </button>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Client</span>
              <span>Quarter</span>
              <span>Date</span>
              <span>Net Worth</span>
              <span>Monthly Surplus</span>
              <span></span>
            </div>
            {allReports.map((r) => (
              <div key={r.id} className={styles.tableRow}
                onClick={() => navigate(`/clients/${r.client.id}/report/${r.id}`)}>
                <div className={styles.clientCell}>
                  <div className={styles.miniAvatar}>
                    {r.client.client1Name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span>{r.client.client1Name}{r.client.client2Name ? ` & ${r.client.client2Name}` : ""}</span>
                </div>
                <div>
                  <span className={styles.qBadge}>{r.quarter}</span>
                </div>
                <div className={styles.dateCell}>
                  <Calendar size={12} />
                  {r.date}
                </div>
                <div className={styles.netWorth}>{fmt(r.tcc?.grandTotal)}</div>
                <div style={{ color: r.sacs?.excess >= 0 ? "#059669" : "#ef4444", fontWeight: 600, fontSize: 13.5 }}>
                  {fmt(r.sacs?.excess)}
                </div>
                <div className={styles.viewBtn}>
                  <Eye size={15} /> View
                  <ChevronRight size={13} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
