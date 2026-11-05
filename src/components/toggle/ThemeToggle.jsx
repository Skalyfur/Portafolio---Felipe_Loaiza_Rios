import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import "../../styles/components/themeToggle.css";

function ThemeToggle() {
  // Inicializa leyendo el almacenamiento local o por defecto en modo oscuro
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("darkmode");
      document.body.classList.remove("lightmode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("lightmode");
      document.body.classList.remove("darkmode");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <button
      type="button"
      className={`themeToggleBtn ${isDark ? "dark" : "light"}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className="toggleIndicator">
        {isDark ? (
          <Moon size={13} className="toggleIcon moon" />
        ) : (
          <Sun size={13} className="toggleIcon sun" />
        )}
      </div>
    </button>
  );
}

export default ThemeToggle;