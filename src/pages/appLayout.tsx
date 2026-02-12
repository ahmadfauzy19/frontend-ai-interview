import type { ReactNode } from "react";
import { Layout } from "antd";
import HeaderComponent from "../components/layout/headerComponent";
import { useInterview } from "../contexts/interviewContext";

const { Content } = Layout;

type AppLayoutProps = {
  children: ReactNode;
  title?: string;
};


const AppLayout = ({ children, title } : AppLayoutProps) => {
  const { name } = useInterview();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderComponent title={title || "AI Interview"} userName={name} />
      <Content style={{background: "#ffffff" }}>
        {children}
      </Content>
    </Layout>
  );
};

export default AppLayout;
