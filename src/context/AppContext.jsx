import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../services/api";
import { initialClients } from "../data/mockData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialized = useRef(false);

  // Initialize data — sync with backend, fallback to mock if API fails
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initData = async () => {
      try {
        const data = await api.getClients();
        
        // If backend is empty but we have local initial clients, let's seed them
        if (data.clients.length === 0) {
          console.log("Backend empty, seeding initial mock data...");
          for (const c of initialClients) {
            await api.createClient(c);
          }
          const freshData = await api.getClients();
          setClients(freshData.clients);
        } else {
          setClients(data.clients);
        }
      } catch (err) {
        console.warn("Backend API unavailable, falling back to localStorage", err);
        const stored = localStorage.getItem("aw_clients");
        setClients(stored ? JSON.parse(stored) : initialClients);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const saveToLocal = (updated) => {
    setClients(updated);
    localStorage.setItem("aw_clients", JSON.stringify(updated));
  };

  const addClient = async (client) => {
    try {
      const newClient = await api.createClient(client);
      setClients(prev => [...prev, newClient]);
      return newClient.id;
    } catch (err) {
      // Fallback
      const newClient = {
        ...client,
        id: `client-${Date.now()}`,
        reports: [],
        lastReportDate: null,
        createdAt: new Date().toISOString().split("T")[0],
      };
      saveToLocal([...clients, newClient]);
      return newClient.id;
    }
  };

  const updateClient = async (id, updates) => {
    try {
      const updated = await api.updateClient(id, updates);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      saveToLocal(clients.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    }
  };

  const deleteClient = async (id) => {
    try {
      await api.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      saveToLocal(clients.filter((c) => c.id !== id));
    }
  };

  const addReport = async (clientId, report) => {
    try {
      const newReport = await api.createReport(clientId, report);
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, reports: [...(c.reports || []), newReport], lastReportDate: newReport.date }
          : c
      ));
      return newReport.id;
    } catch (err) {
      const newReport = {
        ...report,
        id: `report-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
      };
      saveToLocal(
        clients.map((c) =>
          c.id === clientId
            ? {
                ...c,
                reports: [...(c.reports || []), newReport],
                lastReportDate: newReport.date,
              }
            : c
        )
      );
      return newReport.id;
    }
  };

  const getClient = (id) => clients.find((c) => c.id === id);

  return (
    <AppContext.Provider
      value={{ 
        clients, 
        loading, 
        addClient, 
        updateClient, 
        deleteClient, 
        addReport, 
        getClient 
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
