import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Shield, Crown, Snowflake, Loader2 } from 'lucide-react';
import { useAuthStore, UserRole } from '../store/authStore';

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const roles = [
    { role: 'operator' as UserRole, label: '操作员', icon: User, description: '日常运营监控与数据查看' },
    { role: 'leader' as UserRole, label: '考察组长', icon: Shield, description: '科考任务调度与物资审批' },
    { role: 'headquarters' as UserRole, label: '总部指挥', icon: Crown, description: '全局指挥与决策分析' },
  ];

  useEffect(() => {
    if (isScanning && scanProgress < 100) {
      const timer = setTimeout(() => {
        setScanProgress(prev => Math.min(prev + Math.random() * 15, 100));
      }, 150);
      return () => clearTimeout(timer);
    } else if (scanProgress >= 100 && selectedRole) {
      setTimeout(() => {
        login(selectedRole);
        navigate('/dashboard');
      }, 500);
    }
  }, [isScanning, scanProgress, selectedRole, login, navigate]);

  const handleStartScan = () => {
    if (!selectedRole) return;
    setIsScanning(true);
    setScanProgress(0);
  };

  const handleReset = () => {
    setIsScanning(false);
    setScanProgress(0);
    setSelectedRole(null);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-polar-deep via-polar-deep/95 to-polar-deep relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-polar-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-polar-ice/10 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-polar-ice to-polar-white mb-4 shadow-lg shadow-polar-ice/30">
            <Snowflake className="w-12 h-12 text-polar-deep" />
          </div>
          <h1 className="text-3xl font-bold text-polar-white font-orbitron mb-2">极地科考站</h1>
          <p className="text-polar-ice/70">智慧运营与应急调度平台</p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          {!isScanning ? (
            <>
              <h2 className="text-xl font-semibold text-polar-white mb-6 text-center">人脸识别登录</h2>
              
              <div className="space-y-4 mb-8">
                <p className="text-sm text-polar-white/70 text-center mb-4">请选择您的身份</p>
                {roles.map((role) => (
                  <button
                    key={role.role}
                    onClick={() => setSelectedRole(role.role)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                      selectedRole === role.role
                        ? 'border-polar-ice bg-polar-ice/20 glow-border'
                        : 'border-polar-ice/20 bg-polar-ice/5 hover:border-polar-ice/50 hover:bg-polar-ice/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedRole === role.role ? 'bg-polar-ice text-polar-deep' : 'bg-polar-ice/20 text-polar-ice'
                    }`}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${selectedRole === role.role ? 'text-polar-ice' : 'text-polar-white'}`}>
                        {role.label}
                      </p>
                      <p className="text-xs text-polar-white/60">{role.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleStartScan}
                disabled={!selectedRole}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                  selectedRole
                    ? 'bg-gradient-to-r from-polar-ice to-polar-white text-polar-deep hover:shadow-lg hover:shadow-polar-ice/30'
                    : 'bg-polar-ice/10 text-polar-white/40 cursor-not-allowed'
                }`}
              >
                <Camera className="w-5 h-5" />
                开始人脸识别
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-polar-ice/30" />
                <div 
                  className="absolute inset-2 rounded-full border-4 border-polar-ice/50"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% ${100 - scanProgress}%, 0 ${100 - scanProgress}%)`
                  }}
                />
                <div className="absolute inset-4 rounded-full bg-polar-deep flex items-center justify-center overflow-hidden">
                  <Camera className="w-16 h-16 text-polar-ice animate-pulse" />
                  <div 
                    className="absolute left-0 right-0 h-1 bg-polar-ice/80 animate-bounce"
                    style={{
                      top: `${scanProgress}%`,
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)'
                    }}
                  />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-polar-ice animate-spin" style={{ animationDuration: '2s' }} />
              </div>

              <h3 className="text-xl font-semibold text-polar-white mb-2">
                {scanProgress < 100 ? '正在识别...' : '识别成功'}
              </h3>
              <p className="text-polar-ice/70 mb-4">
                {scanProgress < 100 
                  ? `正在验证身份信息 ${scanProgress.toFixed(0)}%`
                  : `欢迎回来，${roles.find(r => r.role === selectedRole)?.label}`
                }
              </p>

              <div className="w-full bg-polar-ice/20 rounded-full h-2 mb-6">
                <div 
                  className="h-full bg-gradient-to-r from-polar-ice to-polar-white rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              {scanProgress >= 100 && (
                <div className="flex items-center justify-center gap-2 text-safety-green">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>正在进入系统...</span>
                </div>
              )}

              {scanProgress < 100 && (
                <button
                  onClick={handleReset}
                  className="text-polar-white/60 hover:text-polar-white text-sm transition-colors"
                >
                  取消
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-polar-white/40 text-xs mt-6">
          © 2025 极地科考智慧运营平台 · 安全加密传输
        </p>
      </div>
    </div>
  );
};

export default Login;
