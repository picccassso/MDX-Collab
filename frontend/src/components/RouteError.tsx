import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="simple-center">
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
        <Link className="btn-primary-inline" to="/">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="simple-center">
      <h1>Unexpected Error</h1>
      <p>{error instanceof Error ? error.message : "Unknown error"}</p>
      <Link className="btn-primary-inline" to="/">
        Go home
      </Link>
    </div>
  );
}
