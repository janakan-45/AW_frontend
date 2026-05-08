import { useParams, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useApp } from "../../context/AppContext";
import Header from "../../components/Header/Header";
import { ArrowLeft, Download, Share2, ArrowRight, ArrowDown, TrendingUp, Shield, Wallet, Building2, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./ReportPreview.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n ?? 0);

const fmtMo = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n ?? 0) + "/mo";

export default function ReportPreview() {
  const { clientId, reportId } = useParams();
  const { getClient } = useApp();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const client = getClient(clientId);
  const report = client?.reports?.find((r) => r.id === reportId);

  if (!client || !report) {
    return (
      <div className={styles.notFound}>
        <AlertCircle size={40} color="#ef4444" />
        <p>Report not found.</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const handlePDF = async () => {
    const el = reportRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`${client.client1Name}_${report.quarter.replace(" ", "_")}_Report.pdf`);
  };

  const clientName = `${client.client1Name}${client.client2Name ? ` & ${client.client2Name}` : ""}`;
  const { sacs, tcc } = report;

  // Gather accounts from client profile with balances from report
  const getBalanceVal = (key) => report.balances?.[key] ?? 0;
  const retAccounts = client.retirementAccounts?.map((a) => ({
    ...a,
    reportValue: getBalanceVal(`ret_${a.id}`),
  })) ?? [];
  const nonRetAccounts = client.nonRetirementAccounts?.map((a) => ({
    ...a,
    reportValue: getBalanceVal(`nonret_${a.id}`),
  })) ?? [];
  const trustAccounts = client.trustAssets?.map((a) => ({
    ...a,
    reportValue: getBalanceVal(`trust_${a.id}`),
  })) ?? [];
  const liabAccounts = client.liabilities?.map((a) => ({
    ...a,
    reportValue: getBalanceVal(`liab_${a.id}`),
  })) ?? [];

  return (
    <div className={styles.page}>
      <Header title="Report Preview" subtitle={`${clientName} · ${report.quarter}`} />
      <div className={styles.controls}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className={styles.btnGroup}>
          <button className={styles.btnCanva} onClick={() => alert("Export to Canva — coming soon!")}>
            <Share2 size={15} /> Export to Canva
          </button>
          <button className={styles.btnPDF} onClick={handlePDF}>
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>

      {/* The report itself */}
      <div className={styles.reportWrapper}>
        <div ref={reportRef} className={styles.report}>
          {/* Report Header */}
          <div className={styles.reportHeader}>
            <div className={styles.reportBrand}>
              <div className={styles.brandLogo}>AW</div>
              <div>
                <div className={styles.brandName}>AW Financial Planning</div>
                <div className={styles.brandSub}>Client Quarterly Report</div>
              </div>
            </div>
            <div className={styles.reportMeta}>
              <div className={styles.reportClient}>{clientName}</div>
              <div className={styles.reportPeriod}>{report.quarter} · As of {report.date}</div>
              {client.lastFourSSN && (
                <div className={styles.reportSSN}>SSN: ****{client.lastFourSSN}</div>
              )}
            </div>
          </div>

          {/* SACS Section */}
          <div className={styles.reportSection}>
            <div className={styles.sectionLabel}>
              <span className={styles.sectionBadge} style={{ background: "#eff6ff", color: "#2563eb" }}>SACS</span>
              Savings and Cash Flow Statement
            </div>

            {/* Flow Diagram */}
            <div className={styles.sacsFlow}>
              <FlowBubble
                label="Inflow"
                value={fmt(sacs.inflow)}
                sub={fmtMo(sacs.inflow)}
                color="#2563eb"
                bg="#eff6ff"
                icon={<TrendingUp size={20} />}
              />
              <div className={styles.flowArrow}>
                <ArrowRight size={22} color="#94a3b8" />
              </div>
              <div className={styles.flowMid}>
                <FlowBubble
                  label="Outflow"
                  value={fmt(sacs.outflow)}
                  sub={fmtMo(sacs.outflow)}
                  color="#ef4444"
                  bg="#fef2f2"
                  icon={<Wallet size={20} />}
                />
                <div className={styles.flowDown}>
                  <ArrowDown size={18} color="#94a3b8" />
                </div>
                <FlowBubble
                  label="Private Reserve"
                  value={fmt(sacs.privateReserve)}
                  sub="monthly contribution"
                  color="#7c3aed"
                  bg="#f5f3ff"
                  icon={<Shield size={20} />}
                />
              </div>
              <div className={styles.flowArrow}>
                <ArrowRight size={22} color="#94a3b8" />
              </div>
              <FlowBubble
                label="Monthly Surplus"
                value={fmt(sacs.excess)}
                sub="available excess"
                color={sacs.excess >= 0 ? "#059669" : "#ef4444"}
                bg={sacs.excess >= 0 ? "#ecfdf5" : "#fef2f2"}
                icon={<TrendingUp size={20} />}
                highlight
              />
            </div>

            {/* SACS Table */}
            <div className={styles.sacsTable}>
              <div className={styles.sacsRow}>
                <span className={styles.sacsRowLabel}>Monthly Salary / Primary Inflow</span>
                <span className={styles.sacsRowValue} style={{ color: "#059669" }}>{fmt(sacs.monthlySalary ?? sacs.inflow)}</span>
              </div>
              {sacs.otherIncome > 0 && (
                <div className={styles.sacsRow}>
                  <span className={styles.sacsRowLabel}>Other Income</span>
                  <span className={styles.sacsRowValue} style={{ color: "#059669" }}>{fmt(sacs.otherIncome)}</span>
                </div>
              )}
              <div className={styles.sacsRow}>
                <span className={styles.sacsRowLabel}>Monthly Expenses</span>
                <span className={styles.sacsRowValue} style={{ color: "#ef4444" }}>({fmt(sacs.monthlyExpenses ?? sacs.outflow)})</span>
              </div>
              {sacs.taxes > 0 && (
                <div className={styles.sacsRow}>
                  <span className={styles.sacsRowLabel}>Taxes</span>
                  <span className={styles.sacsRowValue} style={{ color: "#ef4444" }}>({fmt(sacs.taxes)})</span>
                </div>
              )}
              <div className={styles.sacsRow}>
                <span className={styles.sacsRowLabel}>Private Reserve Contribution</span>
                <span className={styles.sacsRowValue} style={{ color: "#7c3aed" }}>({fmt(sacs.privateReserve)})</span>
              </div>
              <div className={`${styles.sacsRow} ${styles.sacsTotal}`}>
                <span className={styles.sacsRowLabel}>Net Monthly Surplus (Excess)</span>
                <span className={styles.sacsRowValue} style={{ color: sacs.excess >= 0 ? "#059669" : "#ef4444", fontWeight: 700 }}>
                  {fmt(sacs.excess)}
                </span>
              </div>
            </div>
          </div>

          {/* TCC Section */}
          <div className={styles.reportSection}>
            <div className={styles.sectionLabel}>
              <span className={styles.sectionBadge} style={{ background: "#ecfdf5", color: "#059669" }}>TCC</span>
              Total Client Comparison — Net Worth Summary
            </div>

            <div className={styles.tccGrid}>
              {/* Retirement */}
              {retAccounts.length > 0 && (
                <AccountBlock
                  title="Retirement Accounts"
                  color="#2563eb"
                  icon={<TrendingUp size={16} />}
                  accounts={retAccounts.map((a) => ({ name: a.name, value: a.reportValue }))}
                  total={tcc.retirementTotal}
                />
              )}

              {/* Non-Retirement */}
              {nonRetAccounts.length > 0 && (
                <AccountBlock
                  title="Non-Retirement Accounts"
                  color="#059669"
                  icon={<Wallet size={16} />}
                  accounts={nonRetAccounts.map((a) => ({ name: a.name, value: a.reportValue }))}
                  total={tcc.nonRetirementTotal}
                />
              )}

              {/* Trust */}
              {trustAccounts.length > 0 && (
                <AccountBlock
                  title="Trust Assets"
                  color="#7c3aed"
                  icon={<Building2 size={16} />}
                  accounts={trustAccounts.map((a) => ({ name: a.name, value: a.reportValue }))}
                  total={tcc.trustTotal}
                />
              )}

              {/* Liabilities */}
              {liabAccounts.length > 0 && (
                <AccountBlock
                  title="Liabilities"
                  color="#ef4444"
                  icon={<AlertCircle size={16} />}
                  accounts={liabAccounts.map((a) => ({ name: a.name, value: a.reportValue }))}
                  total={tcc.liabilitiesTotal}
                  isLiability
                />
              )}
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryCards}>
              <SummaryCard label="Retirement Total" value={fmt(tcc.retirementTotal)} color="#2563eb" />
              <SummaryCard label="Non-Retirement Total" value={fmt(tcc.nonRetirementTotal)} color="#059669" />
              {tcc.trustTotal > 0 && <SummaryCard label="Trust Total" value={fmt(tcc.trustTotal)} color="#7c3aed" />}
              <SummaryCard label="Total Net Worth" value={fmt(tcc.grandTotal)} color="#0f172a" highlight />
              <SummaryCard label="Liabilities (Ref Only)" value={fmt(tcc.liabilitiesTotal)} color="#ef4444" />
            </div>

            <div className={styles.liabDisclaimer}>
              <AlertCircle size={13} /> Note: Liabilities are displayed for reference only and are NOT subtracted from net worth.
            </div>
          </div>

          {/* Footer */}
          <div className={styles.reportFooter}>
            <span>AW Financial Planning · Confidential</span>
            <span>{report.date}</span>
            <span>Prepared for: {clientName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowBubble({ label, value, sub, color, bg, icon, highlight }) {
  return (
    <div className={`${styles.bubble} ${highlight ? styles.bubbleHighlight : ""}`} style={{ background: bg, borderColor: color + "40" }}>
      <div className={styles.bubbleIcon} style={{ color }}>
        {icon}
      </div>
      <div className={styles.bubbleLabel}>{label}</div>
      <div className={styles.bubbleValue} style={{ color }}>{value}</div>
      <div className={styles.bubbleSub}>{sub}</div>
    </div>
  );
}

function AccountBlock({ title, color, icon, accounts, total, isLiability = false }) {
  return (
    <div className={styles.accountBlock} style={{ borderTop: `3px solid ${color}` }}>
      <div className={styles.accountBlockTitle} style={{ color }}>
        {icon}
        {title}
      </div>
      {accounts.map((a, i) => (
        <div key={i} className={styles.accountBlockRow}>
          <span className={styles.accountBlockName}>{a.name}</span>
          <span className={styles.accountBlockValue} style={{ color: isLiability ? "#ef4444" : color }}>
            {isLiability ? `(${fmt(a.value)})` : fmt(a.value)}
          </span>
        </div>
      ))}
      <div className={styles.accountBlockTotal}>
        <span>Total</span>
        <span style={{ color }}>{isLiability ? `(${fmt(total)})` : fmt(total)}</span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, highlight }) {
  return (
    <div
      className={`${styles.summaryCard} ${highlight ? styles.summaryHighlight : ""}`}
      style={highlight ? { background: "#0f172a", borderColor: "#0f172a" } : { borderColor: color + "30" }}
    >
      <div className={styles.summaryLabel}>{label}</div>
      <div className={styles.summaryValue} style={{ color: highlight ? "white" : color }}>
        {value}
      </div>
    </div>
  );
}
