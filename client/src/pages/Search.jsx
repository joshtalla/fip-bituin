import { Navigate } from "react-router-dom";

export default function Search() {
  return <Navigate to="/prompts?showSearch=1" replace />;
}
