import type { Transaction } from "./columns"

// Placeholder data until transactions come from a real source.
export const transactions: Transaction[] = [
  { id: "t_1001", date: "2026-08-27", description: "Blue Bottle Coffee", category: "Dining", account: "Everyday Checking", status: "cleared", amount: -6.75 },
  { id: "t_1002", date: "2026-08-27", description: "Trader Joe's", category: "Groceries", account: "Everyday Checking", status: "cleared", amount: -84.12 },
  { id: "t_1003", date: "2026-08-26", description: "Payroll — Northwind Ltd", category: "Income", account: "Everyday Checking", status: "cleared", amount: 3250 },
  { id: "t_1004", date: "2026-08-26", description: "Spotify", category: "Subscriptions", account: "Rewards Visa", status: "cleared", amount: -11.99 },
  { id: "t_1005", date: "2026-08-25", description: "Shell Station", category: "Transport", account: "Rewards Visa", status: "pending", amount: -52.4 },
  { id: "t_1006", date: "2026-08-24", description: "Pacific Gas & Electric", category: "Utilities", account: "Everyday Checking", status: "cleared", amount: -138.22 },
  { id: "t_1007", date: "2026-08-23", description: "Amazon", category: "Shopping", account: "Rewards Visa", status: "pending", amount: -63.18 },
  { id: "t_1008", date: "2026-08-22", description: "Transfer to Emergency Fund", category: "Savings", account: "Everyday Checking", status: "cleared", amount: -500 },
  { id: "t_1009", date: "2026-08-21", description: "Dr. Nguyen — Copay", category: "Health", account: "Rewards Visa", status: "cleared", amount: -35 },
  { id: "t_1010", date: "2026-08-20", description: "Rent — Bayview Apartments", category: "Housing", account: "Everyday Checking", status: "cleared", amount: -2150 },
  { id: "t_1011", date: "2026-08-19", description: "Chipotle", category: "Dining", account: "Rewards Visa", status: "cleared", amount: -14.85 },
  { id: "t_1012", date: "2026-08-18", description: "City Transit Pass", category: "Transport", account: "Everyday Checking", status: "cleared", amount: -96 },
  { id: "t_1013", date: "2026-08-17", description: "Refund — Uniqlo", category: "Shopping", account: "Rewards Visa", status: "cleared", amount: 42.5 },
  { id: "t_1014", date: "2026-08-16", description: "Wire to Landlord (retry)", category: "Housing", account: "Everyday Checking", status: "failed", amount: -2150 },
  { id: "t_1015", date: "2026-08-15", description: "Costco", category: "Groceries", account: "Rewards Visa", status: "cleared", amount: -212.06 },
  { id: "t_1016", date: "2026-08-14", description: "Freelance — Acme Corp", category: "Income", account: "Everyday Checking", status: "pending", amount: 900 },
  { id: "t_1017", date: "2026-08-13", description: "Netflix", category: "Subscriptions", account: "Rewards Visa", status: "cleared", amount: -17.99 },
  { id: "t_1018", date: "2026-08-12", description: "Ace Hardware", category: "Home", account: "Rewards Visa", status: "cleared", amount: -73.4 },
]
