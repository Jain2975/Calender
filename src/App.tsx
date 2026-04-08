import { useState, useEffect } from "react";
import Calendar from "./components/Calendar";
import { Moon, Sun } from "lucide-react";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "light" | "dark") || "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-inter antialiased transition-colors duration-500 relative">
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 rounded-full bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 backdrop-blur shadow-sm hover:shadow-md transition-all text-slate-700 dark:text-slate-200 z-50"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <Calendar />
    </div>
  );
}

export default App;
