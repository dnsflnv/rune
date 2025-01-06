/// <reference types="vite/client" />
import { ConfigProvider, Layout, Menu, theme, Button } from 'antd'; // Add Button import
import { Content } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import { MapComponent } from '../components/mapcomponent';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!session) {
    return (
      <div
        style={{
          maxWidth: '400px',
          margin: 'auto',
          padding: '20px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          borderRadius: '8px',
        }}
      >
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
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
          <Content>
            <Layout style={{ height: '100vh', paddingBottom: 20 }}>
              <Sider
                style={{
                  background: '#fff',
                  borderRight: '1px solid #f0f0f0',
                  height: '100%',
                  position: 'relative',
                }}
                width={250}
              >
                <Menu
                  mode="inline"
                  defaultSelectedKeys={['1']}
                  style={{
                    height: 'calc(100% - 50px)',
                    borderRight: 0,
                  }}
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
                <Button
                  type="link"
                  onClick={handleLogout}
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 24,
                    color: '#866c53',
                  }}
                >
                  Logout
                </Button>
              </Sider>
              <Content>
                <MapComponent />
              </Content>
            </Layout>
          </Content>
        </Layout>
      </ConfigProvider>
    );
  }
};
