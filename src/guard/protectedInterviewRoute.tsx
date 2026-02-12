import { Navigate } from "react-router-dom";
import { useInterview } from "../contexts/interviewContext";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
};

const ProtectedInterviewRoute = ({ children }: Props) => {
  const { name, level } = useInterview();

  if (!name || !level) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedInterviewRoute;
