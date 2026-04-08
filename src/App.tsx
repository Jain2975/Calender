import Calendar from "./components/Calendar";

function App() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-inter antialiased transition-colors duration-500">
      <Calendar />
    </div>
  );
}

export default App;
