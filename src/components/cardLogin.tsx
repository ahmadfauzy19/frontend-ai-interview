import { Card, Form, Input, Select, Button, Typography } from "antd";
import "../assets/style/cardLogin.css";
import { useInterview } from "../contexts/interviewContext";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const CardLogin = () => {
  const [form] = Form.useForm();
  const { setInterviewData } = useInterview();
  const navigate = useNavigate();

  const handleNext = (values: any) => {
    setInterviewData(values);
    navigate("/speech-to-text");
  };

  return (
    <div className="login-wrapper">
      <Card className="login-card">
        
        {/* Title */}
        <Title level={2} className="brand-title">
          <span className="brand-ai">AI</span>{" "}
          <span className="brand-interview">Interview</span>
        </Title>

        <Text className="subtitle">START YOUR SESSION</Text>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleNext}
          requiredMark={false}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            initialValue="Backend Engineer"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Backend Engineer">Backend Engineer</Option>
              <Option value="Frontend Engineer">Frontend Engineer</Option>
              <Option value="Fullstack Engineer">Fullstack Engineer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Level"
            name="level"
            initialValue="Junior"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Junior">Junior</Option>
              <Option value="Middle">Middle</Option>
              <Option value="Senior">Senior</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="btn-next"
            >
              NEXT
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CardLogin;
