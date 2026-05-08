import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Header from "../../components/Header/Header";
import { ArrowLeft, Save, AlertCircle, CheckCircle, RotateCcw } from "lucide-react";
import styles from "./ReportEntry.module.css";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n ?? 0);

const quarters = ["Q1 2025", "Q4 2024", "Q3 2024", "Q2 2024", "Q1 2024", "Q4 2023"];

export default function ReportEntry() {
  const { clientId } = useParams();
  const { getClient, addReport } = useApp();
  const navigate = useNavigate();
  const client = getClient(clientId);

  const lastReport = client?.reports?.[client.reports.length - 1];

  const [quarter, setQuarter] = useState(quarters[0]);

  // SACS fields
  const [sacs, setSacs] = useState({
    inflow: client?.monthlySalary ?? 0,
    outflow: client?.monthlyExpenseBudget ?? 0,
    privateReserve: client?.privateReserveTarget ?? 0,
    otherIncome: 0,
    taxes: 0,
  });

  // TCC balance entries — built from client's account structure
  const buildBalances = () => {
    const balances = {};
    client?.retirementAccounts?.forEach((a) => {
      balances[`ret_${a.id}`] = { label: a.name, value: lastReport?.balances?.[`ret_${a.id}`] ?? a.value, category: "retirement" };
    });
    client?.nonRetirementAccounts?.forEach((a) => {
      balances[`nonret_${a.id}`] = { label: a.name, value: lastReport?.balances?.[`nonret_${a.id}`] ?? a.value, category: "nonRetirement" };
    });
    client?.trustAssets?.forEach((a) => {
      balances[`trust_${a.id}`] = { label: a.name, value: lastReport?.balances?.[`trust_${a.id}`] ?? a.value, category: "trust" };
    });
    client?.liabilities?.forEach((a) => {
      balances[`liab_${a.id}`] = { label: a.name, value: lastReport?.balances?.[`liab_${a.id}`] ?? a.value, category: "liabilities" };
    });
    return balances;
  };

  const [balances, setBalances] = useState(buildBalances());
  const [errors, setErrors] = useState({});

  const updateBalance = (key, val) => {
    setBalances((prev) => ({ ...prev, [key]: { ...prev[key], value: parseFloat(val) || 0 } }));
  };

  const useLast = (key) => {
    if (lastReport?.balances?.[key] !== undefined) {
      updateBalance(key, lastReport.balances[key]);
    }
  };

  // SACS calculations
  const sacsCalc = useMemo(() => {
    const totalInflow = (sacs.inflow || 0) + (sacs.otherIncome || 0);
    const totalOutflow = (sacs.outflow || 0) + (sacs.taxes || 0);
    const excess = totalInflow - totalOutflow - (sacs.privateReserve || 0);
    return { totalInflow, totalOutflow, excess };
  }, [sacs]);

  // TCC calculations
  const tccCalc = useMemo(() => {
    let retirementTotal = 0, nonRetirementTotal = 0, trustTotal = 0, liabilitiesTotal = 0;
    Object.values(balances).forEach(({ value, category }) => {
      if (category === "retirement") retirementTotal += value;
      else if (category === "nonRetirement") nonRetirementTotal += value;
      else if (category === "trust") trustTotal += value;
      else if (category === "liabilities") liabilitiesTotal += value;
    });
    const grandTotal = retirementTotal + nonRetirementTotal + trustTotal;
    return { retirementTotal, nonRetirementTotal, trustTotal, liabilitiesTotal, grandTotal };
  }, [balances]);

  const handleSubmit = async () => {
    const report = {
      quarter,
      sacs: {
        inflow: sacsCalc.totalInflow,
        outflow: sacsCalc.totalOutflow,
        privateReserve: sacs.privateReserve,
        excess: sacsCalc.excess,
        monthlySalary: sacs.inflow,
        monthlyExpenses: sacs.outflow,
        otherIncome: sacs.otherIncome,
        taxes: sacs.taxes,
      },
      tcc: tccCalc,
      balances: Object.fromEntries(Object.entries(balances).map(([k, v]) => [k, v.value])),
      clientSnapshot: { ...client },
    };
    const reportId = await addReport(clientId, report);
    navigate(`/clients/${clientId}/report/${reportId}`);
  };

  if (!client) return <div className={styles.notFound}>Client not found</div>;

  const retBalances = Object.entries(balances).filter(([, v]) => v.category === "retirement");
  const nonRetBalances = Object.entries(balances).filter(([, v]) => v.category === "nonRetirement");
  const trustBalances = Object.entries(balances).filter(([, v]) => v.category === "trust");
  const liabBalances = Object.entries(balances).filter(([, v]) => v.category === "liabilities");

  return (
    <div className={styles.page}>
      <Header
        title="Quarterly Report Entry"
        subtitle={`${client.client1Name}${client.client2Name ? ` & ${client.client2Name}` : ""}`}
      />
      <div className={styles.content}>
        <div className={styles.topRow}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <div className={styles.quarterSelect}>
            <label>Quarter:</label>
            <select value={quarter} onChange={(e) => setQuarter(e.target.value)} className={styles.select}>
              {quarters.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Left: Entry Forms */}
          <div className={styles.formCol}>
            {/* SACS */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>SACS — Cash Flow</div>
                <span className={styles.sectionTag}>Monthly</span>
              </div>

              <div className={styles.formGrid2}>
                <InputField
                  label="Monthly Salary / Inflow"
                  value={sacs.inflow}
                  onChange={(v) => setSacs((s) => ({ ...s, inflow: parseFloat(v) || 0 }))}
                  lastValue={lastReport?.sacs?.monthlySalary}
                  onUseLast={() => setSacs((s) => ({ ...s, inflow: lastReport?.sacs?.monthlySalary ?? s.inflow }))}
                />
                <InputField
                  label="Other Income"
                  value={sacs.otherIncome}
                  onChange={(v) => setSacs((s) => ({ ...s, otherIncome: parseFloat(v) || 0 }))}
                />
                <InputField
                  label="Monthly Expenses / Outflow"
                  value={sacs.outflow}
                  onChange={(v) => setSacs((s) => ({ ...s, outflow: parseFloat(v) || 0 }))}
                  lastValue={lastReport?.sacs?.monthlyExpenses}
                  onUseLast={() => setSacs((s) => ({ ...s, outflow: lastReport?.sacs?.monthlyExpenses ?? s.outflow }))}
                />
                <InputField
                  label="Taxes"
                  value={sacs.taxes}
                  onChange={(v) => setSacs((s) => ({ ...s, taxes: parseFloat(v) || 0 }))}
                />
                <InputField
                  label="Private Reserve Contribution"
                  value={sacs.privateReserve}
                  onChange={(v) => setSacs((s) => ({ ...s, privateReserve: parseFloat(v) || 0 }))}
                  lastValue={lastReport?.sacs?.privateReserve}
                  onUseLast={() => setSacs((s) => ({ ...s, privateReserve: lastReport?.sacs?.privateReserve ?? s.privateReserve }))}
                />
              </div>
            </div>

            {/* TCC Balances */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>TCC — Balance Entry</div>
                <span className={styles.sectionTag}>Quarter-End Balances</span>
              </div>

              {retBalances.length > 0 && (
                <BalanceGroup title="Retirement Accounts" color="#2563eb">
                  {retBalances.map(([key, acc]) => (
                    <BalanceRow
                      key={key}
                      label={acc.label}
                      value={acc.value}
                      lastValue={lastReport?.balances?.[key]}
                      onChange={(v) => updateBalance(key, v)}
                      onUseLast={() => useLast(key)}
                    />
                  ))}
                </BalanceGroup>
              )}

              {nonRetBalances.length > 0 && (
                <BalanceGroup title="Non-Retirement Accounts" color="#059669">
                  {nonRetBalances.map(([key, acc]) => (
                    <BalanceRow
                      key={key}
                      label={acc.label}
                      value={acc.value}
                      lastValue={lastReport?.balances?.[key]}
                      onChange={(v) => updateBalance(key, v)}
                      onUseLast={() => useLast(key)}
                    />
                  ))}
                </BalanceGroup>
              )}

              {trustBalances.length > 0 && (
                <BalanceGroup title="Trust Assets" color="#7c3aed">
                  {trustBalances.map(([key, acc]) => (
                    <BalanceRow
                      key={key}
                      label={acc.label}
                      value={acc.value}
                      lastValue={lastReport?.balances?.[key]}
                      onChange={(v) => updateBalance(key, v)}
                      onUseLast={() => useLast(key)}
                    />
                  ))}
                </BalanceGroup>
              )}

              {liabBalances.length > 0 && (
                <BalanceGroup title="Liabilities" color="#ef4444">
                  {liabBalances.map(([key, acc]) => (
                    <BalanceRow
                      key={key}
                      label={acc.label}
                      value={acc.value}
                      lastValue={lastReport?.balances?.[key]}
                      onChange={(v) => updateBalance(key, v)}
                      onUseLast={() => useLast(key)}
                    />
                  ))}
                </BalanceGroup>
              )}
            </div>
          </div>

          {/* Right: Live Calculations */}
          <div className={styles.calcCol}>
            <div className={styles.calcPanel}>
              <div className={styles.calcTitle}>Live Calculations</div>

              <div className={styles.calcBlock}>
                <div className={styles.calcBlockTitle} style={{ color: "#2563eb" }}>SACS — Cash Flow</div>
                <CalcRow label="Total Inflow" value={fmt(sacsCalc.totalInflow)} color="#059669" />
                <CalcRow label="Total Outflow" value={fmt(sacsCalc.totalOutflow)} color="#ef4444" />
                <CalcRow label="Private Reserve" value={fmt(sacs.privateReserve)} />
                <div className={styles.calcDivider} />
                <CalcRow
                  label="Monthly Surplus (Excess)"
                  value={fmt(sacsCalc.excess)}
                  color={sacsCalc.excess >= 0 ? "#059669" : "#ef4444"}
                  bold
                />
              </div>

              <div className={styles.calcBlock}>
                <div className={styles.calcBlockTitle} style={{ color: "#059669" }}>TCC — Net Worth</div>
                <CalcRow label="Retirement Total" value={fmt(tccCalc.retirementTotal)} color="#2563eb" />
                <CalcRow label="Non-Retirement Total" value={fmt(tccCalc.nonRetirementTotal)} color="#059669" />
                <CalcRow label="Trust Total" value={fmt(tccCalc.trustTotal)} color="#7c3aed" />
                <div className={styles.calcDivider} />
                <CalcRow label="Grand Total (Net Worth)" value={fmt(tccCalc.grandTotal)} bold color="#0f172a" />
                <div className={styles.liabNote}>
                  <AlertCircle size={12} />
                  Liabilities: {fmt(tccCalc.liabilitiesTotal)} (displayed separately, not subtracted)
                </div>
              </div>

              <button className={styles.saveBtn} onClick={handleSubmit}>
                <Save size={16} />
                Save & Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, lastValue, onUseLast }) {
  const hasLast = lastValue !== undefined && lastValue !== null;
  return (
    <div className={styles.inputField}>
      <div className={styles.inputLabel}>
        <span>{label}</span>
        {hasLast && (
          <button type="button" className={styles.useLastBtn} onClick={onUseLast}>
            <RotateCcw size={10} /> Use last ({fmt(lastValue)})
          </button>
        )}
      </div>
      <input
        type="number"
        className={styles.numInput}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
      />
    </div>
  );
}

function BalanceGroup({ title, color, children }) {
  return (
    <div className={styles.balanceGroup}>
      <div className={styles.balanceGroupTitle} style={{ color }}>{title}</div>
      {children}
    </div>
  );
}

function BalanceRow({ label, value, lastValue, onChange, onUseLast }) {
  const hasLast = lastValue !== undefined && lastValue !== null;
  const changed = hasLast && value !== lastValue;
  return (
    <div className={styles.balanceRow}>
      <div className={styles.balanceMeta}>
        <span className={styles.balanceLabel}>{label}</span>
        {hasLast && <span className={styles.lastVal}>Prev: {fmt(lastValue)}</span>}
      </div>
      <div className={styles.balanceInputRow}>
        <input
          type="number"
          className={`${styles.numInput} ${changed ? styles.changed : ""}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
        {hasLast && (
          <button type="button" className={styles.useLastBtn2} onClick={onUseLast} title="Use previous value">
            <RotateCcw size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

function CalcRow({ label, value, color = "#374151", bold = false }) {
  return (
    <div className={styles.calcRow}>
      <span className={styles.calcLabel}>{label}</span>
      <span className={styles.calcValue} style={{ color, fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}
