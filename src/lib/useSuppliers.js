import { useState, useEffect } from "react";

const DEFAULT_SUPPLIERS = [
  { id: "panduit", name: "Panduit", alwaysDropship: true, leadMin: 10, leadMax: 20 },
  { id: "hubbell", name: "Hubbell", alwaysDropship: true, leadMin: 8,  leadMax: 15 },
];

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState(() => {
    try {
      const stored = localStorage.getItem("maetor_suppliers");
      return stored ? JSON.parse(stored) : DEFAULT_SUPPLIERS;
    } catch {
      return DEFAULT_SUPPLIERS;
    }
  });

  useEffect(() => {
    try { localStorage.setItem("maetor_suppliers", JSON.stringify(suppliers)); } catch {}
  }, [suppliers]);

  function add(s) {
    setSuppliers(prev => [...prev, { ...s, id: Date.now().toString() }]);
  }

  function update(s) {
    setSuppliers(prev => prev.map(x => x.id === s.id ? s : x));
  }

  function remove(id) {
    setSuppliers(prev => prev.filter(x => x.id !== id));
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(suppliers, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maetor-suppliers.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) setSuppliers(data);
      } catch {}
    };
    reader.readAsText(file);
  }

  return { suppliers, add, update, remove, exportJSON, importJSON };
}
