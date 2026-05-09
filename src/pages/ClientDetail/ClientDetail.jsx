import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Header from "../../components/Header/Header";
import {
  ArrowLeft, User, FileText, Plus, TrendingUp, Shield, Wallet, Building2, AlertCircle,
} from "lucide-react";
import styles from "./ClientDetail.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n ?? 0);

export default function ClientDetail() {
  const { id } = useParams();
  const { getClient } = useApp();
  const navigate = useNavigate();
  const client = getClient(id);

  if (!client) return (
    <div className={styles.notFound}>
      <AlertCircle size={40} color="#ef4444" />
      <p>Client not found.</p>
      <button onClick={() => navigate("/clients")}>Back to clients</button>
    </div>
  );

  const retTotal = client.retirementAccounts?.reduce((s, a) => s + a.value, 0) ?? 0;
  const nonRetTotal = client.nonRetirementAccounts?.reduce((s, a) => s + a.value, 0) ?? 0;
  const trustTotal = client.trustAssets?.reduce((s, a) => s + a.value, 0) ?? 0;
  const liabTotal = client.liabilities?.reduce((s, a) => s + a.value, 0) ?? 0;
  const grandTotal = retTotal + nonRetTotal + trustTotal;
  const excess = client.monthlySalary - client.monthlyExpenseBudget;

  return (
    <div className={styles.page}>
      <Header
        title={`${client.client1Name}${client.client2Name ? ` & ${client.client2Name}` : ""}`}
        subtitle={`Client Profile · SSN: ****${client.lastFourSSN || "----"}`}
      />
      <div className={styles.content}>
        <div className={styles.topRow}>
          <button className={styles.backBtn} onClick={() => navigate("/clients")}>
            <ArrowLeft size={15} /> Back
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate(`/clients/${client.id}/report/new`)}
          >
            <Plus size={16} /> New Quarterly Report
          </button>
        </div>

        <div className={styles.grid}>
          {/* Left column */}
          <div className={styles.left}>
            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
              <SummaryCard label="Net Worth" value={fmt(grandTotal)} color="#2563eb" icon={TrendingUp} />
              <SummaryCard label="Liabilities" value={fmt(liabTotal)} color="#ef4444" icon={AlertCircle} />
              <SummaryCard label="Monthly Inflow" value={fmt(client.monthlySalary)} color="#059669" icon={Wallet} />
              <SummaryCard label="Monthly Surplus" value={fmt(excess)} color={excess >= 0 ? "#7c3aed" : "#ef4444"} icon={Shield} />
            </div>

            {/* Personal Info */}
            <div className={styles.card}>
              <div className={styles.cardTitle}><User size={15} /> Personal Information</div>
              <div className={styles.infoGrid}>
                <InfoRow label="Client 1" value={client.client1Name} />
                {client.client2Name && <InfoRow label="Client 2" value={client.client2Name} />}
                <InfoRow label="Date of Birth" value={client.dob} />
                <InfoRow label="SSN (last 4)" value={`****${client.lastFourSSN || "----"}`} />
                <InfoRow label="Monthly Salary" value={fmt(client.monthlySalary)} />
                <InfoRow label="Expense Budget" value={fmt(client.monthlyExpenseBudget)} />
                <InfoRow label="Private Reserve Target" value={fmt(client.privateReserveTarget)} />
              </div>
            </div>

            {/* Accounts */}
            <AccountCard
              title="Retirement Accounts"
              icon={TrendingUp}
              accounts={client.retirementAccounts}
              total={retTotal}
              color="#2563eb"
            />
            <AccountCard
              title="Non-Retirement Accounts"
              icon={Wallet}
              accounts={client.nonRetirementAccounts}
              total={nonRetTotal}
              color="#059669"
            />
            {client.trustAssets?.length > 0 && (
              <AccountCard
                title="Trust Assets"
                icon={Building2}
                accounts={client.trustAssets}
                total={trustTotal}
                color="#7c3aed"
              />
            )}
            <AccountCard
              title="Liabilities"
              icon={AlertCircle}
              accounts={client.liabilities}
              total={liabTotal}
              color="#ef4444"
              isLiability
            />
          </div>

          {/* Right: Reports */}
          <div className={styles.right}>
            <div className={styles.card}>
              <div className={styles.cardTitle}><FileText size={15} /> Report History</div>
              {(!client.reports || client.reports.length === 0) ? (
                <div className={styles.emptyReports}>
                  <FileText size={36} color="#cbd5e1" />
                  <p>No reports yet</p>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => navigate(`/clients/${client.id}/report/new`)}
                  >
                    <Plus size={15} /> Create First Report
                  </button>
                </div>
              ) : (
                <div className={styles.reportList}>
                  {[...client.reports].reverse().map((r) => (
                    <div
                      key={r.id}
                      className={styles.reportRow}
                      onClick={() => navigate(`/clients/${client.id}/report/${r.id}`)}
                    >
                      <div className={styles.reportBadge}>{r.quarter}</div>
                      <div className={styles.reportInfo}>
                        <div className={styles.reportDate}>{r.date}</div>
                        <div className={styles.reportNet}>Net Worth: {fmt(r.tcc?.grandTotal)}</div>
                      </div>
                      <div className={styles.reportArrow}>→</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, icon: Icon }) {
  return (
    <div className={styles.summaryCard} style={{ borderLeft: `4px solid ${color}` }}>
      <div className={styles.summaryIcon} style={{ color }}>
        <Icon size={16} />
      </div>
      <div className={styles.summaryValue}>{value}</div>
      <div className={styles.summaryLabel}>{label}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

function AccountCard({ title, icon: Icon, accounts, total, color, isLiability = false }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle} style={{ color }}>
        <Icon size={15} /> {title}
      </div>
      {(!accounts || accounts.length === 0) ? (
        <p className={styles.noAccounts}>None recorded</p>
      ) : (
        <>
          {accounts.map((a) => (
            <div key={a.id} className={styles.accountRow}>
              <span className={styles.accountName}>{a.name}</span>
              <span className={styles.accountValue} style={{ color: isLiability ? "#ef4444" : color }}>
                {fmt(a.value)}
              </span>
            </div>
          ))}
          <div className={styles.accountTotal}>
            <span>Total</span>
            <span style={{ color }}>{fmt(total)}</span>
          </div>
        </>
      )}
    </div>
  );
}
