import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CloudSun, 
  Package, 
  AlertTriangle, 
  FileSpreadsheet, 
  Settings,
  LogOut,
  Snowflake
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: '运营总览', roles: ['operator', 'leader', 'headquarters', 'superior'] },
    { path: '/weather', icon: CloudSun, label: '气象调度', roles: ['operator', 'leader', 'headquarters', 'superior'] },
    { path: '/materials', icon: Package, label: '物资管理', roles: ['leader', 'headquarters', 'superior'] },
    { path: '/emergency', icon: AlertTriangle, label: '应急指挥', roles: ['leader', 'headquarters', 'superior'] },
    { path: '/reports', icon: FileSpreadsheet, label: '数据报表', roles: ['headquarters', 'superior'] },
  ];

  const filteredItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="w-64 h-full bg-polar-deep/95 backdrop-blur-md border-r border-polar-ice/20 flex flex-col">
      <div className="p-6 border-b border-polar-ice/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-polar-ice to-polar-white flex items-center justify-center">
            <Snowflake className="w-7 h-7 text-polar-deep" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-polar-white font-orbitron">极地科考站</h1>
            <p className="text-xs text-polar-ice/70">智慧运营平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-polar-ice/20 text-polar-ice glow-border'
                  : 'text-polar-white/70 hover:bg-polar-ice/10 hover:text-polar-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-polar-ice/20">
        {user && (
          <div className="mb-4 p-3 rounded-lg bg-polar-ice/10">
            <p className="text-sm font-medium text-polar-white">{user.name}</p>
            <p className="text-xs text-polar-ice/70">
              {user.role === 'operator' && '操作员'}
              {user.role === 'leader' && '考察组长'}
              {user.role === 'headquarters' && '总部指挥'}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-alert-red hover:bg-alert-red/10 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
