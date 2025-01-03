import { ConfigProvider, Layout, Menu, theme } from 'antd';
import { Header, Content, Footer } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { MapComponent } from '../components/mapcomponent';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const supabase = createClient('', '');

export const Root = () => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  } else {
    return (
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#866c53',
            colorInfo: '#866c53',
            colorSuccess: '#eed0a8',
            colorError: '#df6446',
            colorTextBase: '#866c53',
          },
        }}
      >
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
      </Content>
      {/* <Footer>
        ©2024 <a href="https://norr.dev">norr.dev</a>
      </Footer> */}
    </Layout>
    </ConfigProvider>
  );
};
