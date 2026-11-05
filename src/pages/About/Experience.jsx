import { Briefcase } from "lucide-react";

const experienceData = [
  {
    id: 1,
    role: "Self-taught Developer",
    period: "2022 - Present",
    description: "Continuous learning & personal projects",
  },
  {
    id: 2,
    role: "Web Development",
    period: "2023 - Present",
    description: "Django · React · APIs · Databases",
  },
  {
    id: 3,
    role: "Cybersecurity (in progress)",
    period: "2024 - Present",
    description: "Pentesting · Blue Team · Linux",
  },
];

function Experience() {
  return (
    <div className="aboutCard">
      <div className="cardHeader">
        <Briefcase size={18} className="headerIcon" />
        <h2>EXPERIENCE</h2>
      </div>

      <div className="timeline">
        {experienceData.map((item) => (
          <div key={item.id} className="timelineItem">
            <div className="timelineDot" />
            <div className="timelineContent">
              <div className="timelineHeader">
                <h3 className="itemTitle">{item.role}</h3>
                <span className="itemPeriod">{item.period}</span>
              </div>
              <p className="itemDesc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Experience;