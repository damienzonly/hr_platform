import React from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TestCrud from './components/TestCrud';

function Home() {
  return <div>home</div>
}

const { Sider, Content } = Layout;

function App() {
  return (
    <Router>
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="dark">
        <Menu mode="vertical" theme="dark" style={{ height: '100%', borderRight: 0 }}>
          <Menu.Item key="home">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link to="/test">Test</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test" element={<TestCrud/>} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  </Router>
  );
}

export default App;
