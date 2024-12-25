import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { Header, Content, Footer } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { MapComponent } from '../components/mapcomponent';
import { useNavigate } from 'react-router-dom';
export const Root = () => {
  const navigate = useNavigate();
  return (
    <ConfigProvider theme={{
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: "#866c53",
        colorInfo: "#866c53",
        colorSuccess: "#eed0a8",
        colorError: "#df6446",
        colorTextBase: "#866c53"
      },
    }}>
    <Layout>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              label: 'Map',
              onClick: () => {
                navigate('/');
              },
            },
            {
              key: '2',
              label: 'About',
              onClick: () => {
                navigate('/about');
              },
            },
          ]}
        />
      </Header>
      <Content>
        <Layout style={{ background: '#fff' }}>
          <Sider style={{ background: '#fff' }} width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              style={{ height: '100%' }}
              items={[
                {
                  key: '1',
                  label: 'Runestones',
                },
                {
                  key: '2',
                  label: 'Mounds & burials',
                },
                {
                  key: '3',
                  label: 'Picturestones',
                },
                {
                  key: '4',
                  label: 'Bronze Age',
                },
              ]}
            />
          </Sider>
          <Content>
            <MapComponent />
          </Content>
        </Layout>
      </Content>
      <Footer>
        ©2024 <a href="https://norr.dev">norr.dev</a>
      </Footer>
    </Layout>
    </ConfigProvider>
  );
};
