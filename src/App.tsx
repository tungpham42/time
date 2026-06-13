import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, Typography, ConfigProvider } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import TimezoneConverter from "./TimezoneConverter";
import "antd/dist/reset.css";
import "./App.css"; // Ensure this is imported

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          colorPrimary: "#FF7E67", // Warm, friendly coral
          borderRadius: 16, // Softer, friendlier rounded corners
          colorTextHeading: "#2D3748", // Professional dark gray for headings
          colorText: "#4A5568", // Softer gray for body text
          colorBgBase: "#ffffff",
          boxShadowSecondary:
            "0 10px 25px -5px rgba(255, 126, 103, 0.1), 0 8px 10px -6px rgba(255, 126, 103, 0.1)",
        },
        components: {
          Card: {
            boxShadowTertiary:
              "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
          },
        },
      }}
    >
      <BrowserRouter>
        <Layout style={{ minHeight: "100vh", background: "transparent" }}>
          <Header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              padding: "0 40px",
              height: "80px",
              borderBottom: "none",
            }}
          >
            <GlobalOutlined
              style={{
                color: "#FF7E67",
                fontSize: "28px",
                marginRight: "16px",
              }}
            />
            <Title
              level={3}
              style={{ margin: 0, fontWeight: 800, letterSpacing: "-0.5px" }}
            >
              SOFT Time
            </Title>
          </Header>
          <Content
            style={{
              padding: "0 24px 40px",
              maxWidth: "1000px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <Routes>
              <Route path="/" element={<TimezoneConverter />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
