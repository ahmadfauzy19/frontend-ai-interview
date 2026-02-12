import { createContext, useContext, useState, type ReactNode } from "react";

type InterviewContextType = {
  name: string;
  role: string;
  level: string;
  setInterviewData: (data: {
    name: string;
    role: string;
    level: string;
  }) => void;
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [level, setLevel] = useState<string>("");

  const setInterviewData = ({
    name,
    role,
    level,
  }: {
    name: string;
    role: string;
    level: string;
  }) => {
    setName(name);
    setRole(role);
    setLevel(level.toLowerCase()); // supaya cocok sama fetchLevel
  };

  return (
    <InterviewContext.Provider
      value={{ name, role, level, setInterviewData }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within InterviewProvider");
  }
  return context;
};
