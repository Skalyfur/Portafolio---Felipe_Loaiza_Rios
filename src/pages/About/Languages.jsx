import { Globe } from "lucide-react";

const languagesData = [
  { id: 1, name: "Spanish", level: "Native", flag: "🇪🇸" },
  { id: 2, name: "English", level: "Intermediate", flag: "🇬🇧" },
];

function Languages() {
  return (
    <div className="aboutCard flexCard">
      <div className="cardHeader">
        <Globe size={18} className="headerIcon" />
        <h2>LANGUAGES</h2>
      </div>

      <div className="languagesList">
        {languagesData.map((lang) => (
          <div key={lang.id} className="languageRow">
            <div className="langInfo">
              <span className="flagIcon">{lang.flag}</span>
              <span className="langName">{lang.name}</span>
            </div>
            <span className="langLevel">{lang.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Languages;