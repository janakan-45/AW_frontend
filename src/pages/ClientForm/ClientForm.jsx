import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Header from "../../components/Header/Header";
import { Plus, Trash2, ArrowLeft, Save, X, Edit3 } from "lucide-react";
import styles from "./ClientForm.module.css";

const emptyAccount = () => ({ id: `acc-${Date.now()}-${Math.random()}`, name: "", value: 0 });

const EMPTY_FORM = {
  client1Name: "",
  client2Name: "",
  dob: "",
  lastFourSSN: "",
  monthlySalary: "",
  monthlyExpenseBudget: "",
  privateReserveTarget: "",
  retirementAccounts: [emptyAccount()],
  nonRetirementAccounts: [emptyAccount()],
  trustAssets: [],
  liabilities: [emptyAccount()],
};

export default function ClientForm() {
  const { addClient, updateClient, getClient } = useApp();
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing

  const isEditing = Boolean(id);
  const existingClient = isEditing ? getClient(id) : null;

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isEditing && existingClient) {
      const mapAccounts = (arr = []) =>
        arr.length > 0
          ? arr.map((a) => ({ id: a.id || `acc-${Date.now()}-${Math.random()}`, name: a.name || "", value: a.value ?? 0 }))
          : [emptyAccount()];

      setForm({
        client1Name: existingClient.client1Name || "",
        client2Name: existingClient.client2Name || "",
        dob: existingClient.dob || "",
        lastFourSSN: existingClient.lastFourSSN || "",
        monthlySalary: existingClient.monthlySalary !== undefined ? String(existingClient.monthlySalary) : "",
        monthlyExpenseBudget: existingClient.monthlyExpenseBudget !== undefined ? String(existingClient.monthlyExpenseBudget) : "",
        privateReserveTarget: existingClient.privateReserveTarget !== undefined ? String(existingClient.privateReserveTarget) : "",
        retirementAccounts: mapAccounts(existingClient.retirementAccounts),
        nonRetirementAccounts: mapAccounts(existingClient.nonRetirementAccounts),
        trustAssets: existingClient.trustAssets?.length > 0 ? existingClient.trustAssets.map((a) => ({ id: a.id || `acc-${Date.now()}-${Math.random()}`, name: a.name || "", value: a.value ?? 0 })) : [],
        liabilities: mapAccounts(existingClient.liabilities),
      });
    }
  }, [isEditing, existingClient]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const updateAccount = (category, idx, key, val) => {
    setForm((f) => ({
      ...f,
      [category]: f[category].map((a, i) => (i === idx ? { ...a, [key]: val } : a)),
    }));
  };

  const addAccount = (category) =>
    setForm((f) => ({ ...f, [category]: [...f[category], emptyAccount()] }));

  const removeAccount = (category, idx) =>
    setForm((f) => ({ ...f, [category]: f[category].filter((_, i) => i !== idx) }));

  const validate = () => {
    const errs = {};
    if (!form.client1Name.trim()) errs.client1Name = "Name is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    if (form.lastFourSSN && !/^\d{4}$/.test(form.lastFourSSN)) errs.lastFourSSN = "Must be 4 digits";

    if (form.monthlySalary === "" || isNaN(form.monthlySalary)) errs.monthlySalary = "Required";
    else if (parseFloat(form.monthlySalary) < 0) errs.monthlySalary = "Cannot be negative";

    if (form.monthlyExpenseBudget === "" || isNaN(form.monthlyExpenseBudget)) errs.monthlyExpenseBudget = "Required";
    else if (parseFloat(form.monthlyExpenseBudget) < 0) errs.monthlyExpenseBudget = "Cannot be negative";

    if (form.privateReserveTarget && parseFloat(form.privateReserveTarget) < 0) errs.privateReserveTarget = "Cannot be negative";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const parsed = {
        ...form,
        monthlySalary: parseFloat(form.monthlySalary) || 0,
        monthlyExpenseBudget: parseFloat(form.monthlyExpenseBudget) || 0,
        privateReserveTarget: parseFloat(form.privateReserveTarget) || 0,
        retirementAccounts: form.retirementAccounts.filter((a) => a.name).map((a) => ({ ...a, value: parseFloat(a.value) || 0 })),
        nonRetirementAccounts: form.nonRetirementAccounts.filter((a) => a.name).map((a) => ({ ...a, value: parseFloat(a.value) || 0 })),
        trustAssets: form.trustAssets.filter((a) => a.name).map((a) => ({ ...a, value: parseFloat(a.value) || 0 })),
        liabilities: form.liabilities.filter((a) => a.name).map((a) => ({ ...a, value: parseFloat(a.value) || 0 })),
      };

      if (isEditing) {
        await updateClient(id, parsed);
        navigate(`/clients/${id}`);
      } else {
        const newId = await addClient(parsed);
        navigate(`/clients/${newId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header
        title={isEditing ? "Edit Client Profile" : "New Client Profile"}
        subtitle={isEditing ? `Editing ${existingClient?.client1Name || "client"}` : "Create a new client relationship"}
      />
      <div className={styles.content}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Personal Info */}
          <Section title="Personal Information">
            <div className={styles.formGrid2}>
              <Field label="Client 1 Name *" error={errors.client1Name}>
                <input
                  className={`${styles.input} ${errors.client1Name ? styles.inputError : ""}`}
                  value={form.client1Name}
                  onChange={(e) => set("client1Name", e.target.value)}
                  placeholder="e.g. James Whitmore"
                />
              </Field>
              <Field label="Client 2 Name (optional)">
                <input
                  className={styles.input}
                  value={form.client2Name}
                  onChange={(e) => set("client2Name", e.target.value)}
                  placeholder="e.g. Laura Whitmore"
                />
              </Field>
              <Field label="Date of Birth *" error={errors.dob}>
                <input
                  type="date"
                  className={`${styles.input} ${errors.dob ? styles.inputError : ""}`}
                  value={form.dob}
                  onChange={(e) => set("dob", e.target.value)}
                />
              </Field>
              <Field label="Last 4 SSN" error={errors.lastFourSSN}>
                <input
                  className={`${styles.input} ${errors.lastFourSSN ? styles.inputError : ""}`}
                  value={form.lastFourSSN}
                  onChange={(e) => set("lastFourSSN", e.target.value.slice(0, 4))}
                  placeholder="XXXX"
                  maxLength={4}
                />
              </Field>
            </div>
          </Section>

          {/* Cash Flow */}
          <Section title="Monthly Cash Flow">
            <div className={styles.formGrid3}>
              <Field label="Monthly Salary ($) *" error={errors.monthlySalary}>
                <input
                  type="number"
                  className={`${styles.input} ${errors.monthlySalary ? styles.inputError : ""}`}
                  value={form.monthlySalary}
                  onChange={(e) => set("monthlySalary", e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Monthly Expense Budget ($) *" error={errors.monthlyExpenseBudget}>
                <input
                  type="number"
                  className={`${styles.input} ${errors.monthlyExpenseBudget ? styles.inputError : ""}`}
                  value={form.monthlyExpenseBudget}
                  onChange={(e) => set("monthlyExpenseBudget", e.target.value)}
                  placeholder="0"
                />
              </Field>
              <Field label="Private Reserve Target ($)" error={errors.privateReserveTarget}>
                <input
                  type="number"
                  className={`${styles.input} ${errors.privateReserveTarget ? styles.inputError : ""}`}
                  value={form.privateReserveTarget}
                  onChange={(e) => set("privateReserveTarget", e.target.value)}
                  placeholder="0"
                />
              </Field>
            </div>
          </Section>

          {/* Accounts */}
          <AccountSection
            title="Retirement Accounts"
            accounts={form.retirementAccounts}
            category="retirementAccounts"
            onAdd={() => addAccount("retirementAccounts")}
            onRemove={(i) => removeAccount("retirementAccounts", i)}
            onChange={(i, k, v) => updateAccount("retirementAccounts", i, k, v)}
          />

          <AccountSection
            title="Non-Retirement Accounts"
            accounts={form.nonRetirementAccounts}
            category="nonRetirementAccounts"
            onAdd={() => addAccount("nonRetirementAccounts")}
            onRemove={(i) => removeAccount("nonRetirementAccounts", i)}
            onChange={(i, k, v) => updateAccount("nonRetirementAccounts", i, k, v)}
          />

          <AccountSection
            title="Trust Assets"
            accounts={form.trustAssets}
            category="trustAssets"
            onAdd={() => addAccount("trustAssets")}
            onRemove={(i) => removeAccount("trustAssets", i)}
            onChange={(i, k, v) => updateAccount("trustAssets", i, k, v)}
          />

          <AccountSection
            title="Liabilities"
            accounts={form.liabilities}
            category="liabilities"
            onAdd={() => addAccount("liabilities")}
            onRemove={(i) => removeAccount("liabilities", i)}
            onChange={(i, k, v) => updateAccount("liabilities", i, k, v)}
            accent="#ef4444"
          />

          <div className={styles.formActions}>
            <button type="button" className={styles.btnCancel} onClick={() => navigate(-1)}>
              <X size={15} /> Cancel
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
              {isEditing ? <Edit3 size={15} /> : <Save size={15} />}
              {isSubmitting ? "Saving..." : isEditing ? "Update Client" : "Save Client Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

function AccountSection({ title, accounts, onAdd, onRemove, onChange, accent = "#2563eb" }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>{title}</div>
        <button type="button" className={styles.addBtn} onClick={onAdd} style={{ color: accent, borderColor: accent }}>
          <Plus size={13} /> Add Account
        </button>
      </div>
      {accounts.length === 0 && (
        <p className={styles.emptyHint}>No accounts added. Click "Add Account" to begin.</p>
      )}
      {accounts.map((acc, i) => (
        <div key={acc.id} className={styles.accountRow}>
          <input
            className={styles.input}
            placeholder="Account name"
            value={acc.name}
            onChange={(e) => onChange(i, "name", e.target.value)}
          />
          <input
            type="number"
            className={styles.input}
            placeholder="Current value ($)"
            value={acc.value || ""}
            onChange={(e) => onChange(i, "value", e.target.value)}
          />
          <button type="button" className={styles.removeBtn} onClick={() => onRemove(i)}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
