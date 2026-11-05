function ProjectFilters({ activeFilter, onFilterChange }) {
  const categories = ["All", "Web", "Backend", "Mobile", "Other"];

  return (
    <div className="filterContainer">
      {categories.map((category) => (
        <button
          key={category}
          className={`filterBtn ${activeFilter === category ? "active" : ""}`}
          onClick={() => onFilterChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default ProjectFilters;