import { Link } from "react-router-dom";

function Button({ children, to }) {
  return <Link to={to}>{children}</Link>;
}

export default Button;