import { Code2 } from "lucide-react";

const skillsData = [
  "Python", "Django", "React", "JavaScript", 
  "PostgreSQL", "Git", "Docker", "Linux", 
  "Tailwind", "API Design", "Problem Solving"
];

function KeySkills() {
  return (
    <div className="aboutCard flexCard">
      <div className="cardHeader">
        <Code2 size={18} className="headerIcon" />
        <h2>KEY SKILLS</h2>
      </div>

      <div className="skillsBadges">
        {skillsData.map((skill, index) => (
          <span key={index} className="skillBadge">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default KeySkills;