import { Layout} from "antd";
import { DownOutlined } from "@ant-design/icons";
import logo from "../../assets/img/logo_79_copy.png";
import "../../assets/style/headerComponentStyle.css";

<img
  src={logo}
  alt="Logo"
  style={{ width: 32, height: 32 }}
/>


const { Header } = Layout;

type HeaderProps = {
  title?: string;
  userName?: string;
};

const HeaderComponent = (props: HeaderProps) => {
  const { title , userName } = props;
  return (
    <Header className="app-header">
      <div className="left-section">
        <img src={logo} alt="Logo" className="logo-img" />

        <span className="brand-text">
          <span className="brand-ai">AI</span>{" "}
          <span className="brand-interview">Interview</span>
        </span>

        <span className="divider">|</span>

        <span className="login-text">
          {title}
        </span>
      </div>

      {/* Right: User Name */}
      <div className="right-section">
        <span className="user-name">{userName || "Guest"}</span>
        {/* <DownOutlined className="dropdown-icon" /> */}
      </div>
    </Header>
  );
};

export default HeaderComponent;
