import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="simple-center">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link className="btn-primary-inline" to="/">
        Go home
      </Link>
    </div>
  );
}
