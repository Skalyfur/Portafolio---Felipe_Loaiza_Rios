import { GraduationCap } from "lucide-react";

const educationData = [
  {
    id: 1,
    degree: "Computer Systems Engineering",
    institution: "University of Santiago de Cali",
    period: "2022 - Present",
  },
];

function Education() {
  return (
    <div className="aboutCard">
      <div className="cardHeader">
        <GraduationCap size={18} className="headerIcon" />
        <h2>EDUCATION</h2>
      </div>

      <div className="educationList">
        {educationData.map((item) => (
          <div key={item.id} className="educationItem">
            <div>
              <h3 className="itemTitle">{item.degree}</h3>
              <p className="itemDesc">{item.institution}</p>
            </div>
            <span className="itemPeriod">{item.period}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Education;