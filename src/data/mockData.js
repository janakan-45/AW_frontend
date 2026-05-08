// Mock data for AW Client Report Portal

export const initialClients = [
  {
    id: "client-001",
    client1Name: "James Whitmore",
    client2Name: "Laura Whitmore",
    dob: "1972-04-15",
    lastFourSSN: "4821",
    monthlySalary: 18500,
    monthlyExpenseBudget: 9200,
    privateReserveTarget: 55000,
    retirementAccounts: [
      { id: "r1", name: "Roth IRA (James)", value: 142000 },
      { id: "r2", name: "401(k) (James)", value: 387000 },
      { id: "r3", name: "Roth IRA (Laura)", value: 98000 },
    ],
    nonRetirementAccounts: [
      { id: "nr1", name: "Brokerage Account", value: 215000 },
      { id: "nr2", name: "Savings Account", value: 48000 },
    ],
    trustAssets: [
      { id: "t1", name: "Whitmore Family Trust", value: 320000 },
    ],
    liabilities: [
      { id: "l1", name: "Primary Mortgage", value: 385000 },
      { id: "l2", name: "Auto Loan", value: 22000 },
    ],
    reports: [
      {
        id: "r-2024-q3",
        quarter: "Q3 2024",
        date: "2024-09-30",
        sacs: {
          inflow: 18500,
          outflow: 9200,
          privateReserve: 5000,
          excess: 4300,
        },
        tcc: {
          retirementTotal: 627000,
          nonRetirementTotal: 263000,
          trustTotal: 320000,
          liabilitiesTotal: 407000,
          grandTotal: 1210000,
        },
        balances: {
          rothIRAJames: 142000,
          k401James: 387000,
          rothIRALaura: 98000,
          brokerage: 215000,
          savings: 48000,
          trust: 320000,
          mortgage: 385000,
          autoLoan: 22000,
        },
      },
    ],
    lastReportDate: "2024-09-30",
    createdAt: "2024-01-15",
  },
  {
    id: "client-002",
    client1Name: "Robert Chen",
    client2Name: "Susan Chen",
    dob: "1968-11-08",
    lastFourSSN: "3374",
    monthlySalary: 24000,
    monthlyExpenseBudget: 12500,
    privateReserveTarget: 75000,
    retirementAccounts: [
      { id: "r1", name: "401(k) (Robert)", value: 892000 },
      { id: "r2", name: "Roth IRA (Susan)", value: 215000 },
    ],
    nonRetirementAccounts: [
      { id: "nr1", name: "Brokerage Account", value: 540000 },
      { id: "nr2", name: "Money Market", value: 125000 },
    ],
    trustAssets: [
      { id: "t1", name: "Chen Family Revocable Trust", value: 780000 },
    ],
    liabilities: [
      { id: "l1", name: "Primary Mortgage", value: 250000 },
    ],
    reports: [],
    lastReportDate: "2024-06-30",
    createdAt: "2023-08-20",
  },
  {
    id: "client-003",
    client1Name: "Maria Thompson",
    client2Name: "",
    dob: "1980-02-22",
    lastFourSSN: "7759",
    monthlySalary: 11200,
    monthlyExpenseBudget: 6800,
    privateReserveTarget: 35000,
    retirementAccounts: [
      { id: "r1", name: "Roth IRA", value: 87000 },
      { id: "r2", name: "403(b)", value: 192000 },
    ],
    nonRetirementAccounts: [
      { id: "nr1", name: "Savings Account", value: 32000 },
    ],
    trustAssets: [],
    liabilities: [
      { id: "l1", name: "Student Loans", value: 45000 },
      { id: "l2", name: "Mortgage", value: 220000 },
    ],
    reports: [],
    lastReportDate: null,
    createdAt: "2024-03-10",
  },
];

export const quarters = [
  "Q1 2025", "Q4 2024", "Q3 2024", "Q2 2024", "Q1 2024",
  "Q4 2023", "Q3 2023", "Q2 2023",
];
