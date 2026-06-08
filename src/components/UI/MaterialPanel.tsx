import { useState } from 'react';
import { Package, Fuel, Utensils, Pill, AlertTriangle, CheckCircle, X, Clock, ChevronDown, ChevronUp, Zap, Info, Truck, History, Filter, PackageCheck } from 'lucide-react';
import { useMaterialStore, getRoleLabel, getStatusLabel, APPROVAL_ORDER } from '../../store/materialStore';
import { useAuthStore } from '../../store/authStore';
import { UserRole, ApprovalStatus, MaterialType, ProcurementStatus } from '../../types';

export function MaterialPanel() {
  const materials = useMaterialStore(state => state.materials);
  const purchaseRequests = useMaterialStore(state => state.purchaseRequests);
  const pendingRequests = useMaterialStore(state => state.pendingRequests);
  const procurementHistory = useMaterialStore(state => state.procurementHistory);
  const historyFilter = useMaterialStore(state => state.historyFilter);
  const approveRequest = useMaterialStore(state => state.approveRequest);
  const rejectRequest = useMaterialStore(state => state.rejectRequest);
  const startProcurement = useMaterialStore(state => state.startProcurement);
  const confirmDelivery = useMaterialStore(state => state.confirmDelivery);
  const canApprove = useMaterialStore(state => state.canApprove);
  const setHistoryFilter = useMaterialStore(state => state.setHistoryFilter);
  const user = useAuthStore(state => state.user);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'requests' | 'history'>('requests');

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'fuel': return <Fuel size={20} />;
      case 'food': return <Utensils size={20} />;
      case 'medicine': return <Pill size={20} />;
      default: return <Package size={20} />;
    }
  };

  const getMaterialTypeLabel = (type: MaterialType | string) => {
    switch (type) {
      case 'fuel': return '油料';
      case 'food': return '食品';
      case 'medicine': return '药品';
      default: return '全部';
    }
  };

  const getApprovalBadge = (status: ApprovalStatus | ProcurementStatus) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 rounded text-xs bg-safety-green/20 text-safety-green">已批准</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded text-xs bg-alert-red/20 text-alert-red">已拒绝</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded text-xs bg-warning-orange/20 text-warning-orange">待审批</span>;
      case 'procuring':
        return <span className="px-2 py-1 rounded text-xs bg-polar-ice/20 text-polar-ice">采购中</span>;
      case 'shipping':
        return <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">运输中</span>;
      case 'delivered':
        return <span className="px-2 py-1 rounded text-xs bg-safety-green/20 text-safety-green">已到货</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs bg-polar-white/20 text-polar-white">{status}</span>;
    }
  };

  const getStatusColor = (status: ProcurementStatus) => {
    switch (status) {
      case 'approved': return 'bg-safety-green';
      case 'rejected': return 'bg-alert-red';
      case 'pending': return 'bg-warning-orange';
      case 'procuring': return 'bg-polar-ice';
      case 'shipping': return 'bg-purple-500';
      case 'delivered': return 'bg-safety-green';
      default: return 'bg-polar-white';
    }
  };

  const handleApprove = (requestId: string, role: UserRole) => {
    const reqComment = comment[requestId] || '同意';
    approveRequest(requestId, role, reqComment);
    setComment(prev => ({ ...prev, [requestId]: '' }));
  };

  const handleReject = (requestId: string, role: UserRole) => {
    const reqComment = comment[requestId] || '拒绝';
    rejectRequest(requestId, role, reqComment);
    setComment(prev => ({ ...prev, [requestId]: '' }));
  };

  const handleStartProcurement = (requestId: string) => {
    startProcurement(requestId);
  };

  const handleConfirmDelivery = (requestId: string) => {
    confirmDelivery(requestId);
  };

  const getApprovalStepStatus = (request: any, index: number) => {
    const approval = request.approvals[index];
    if (approval.status === 'approved') return 'approved';
    if (approval.status === 'rejected') return 'rejected';
    
    if (index === 0) return 'current';
    
    const prevApproval = request.approvals[index - 1];
    if (prevApproval.status === 'approved') return 'waiting';
    
    return 'blocked';
  };

  const getFilteredHistory = () => {
    if (historyFilter === 'all') return procurementHistory;
    return procurementHistory.filter(h => h.materialType === historyFilter);
  };

  const getApprovalProgressText = (approvals: any[]) => {
    const approved = approvals.filter(a => a.status === 'approved').length;
    const rejected = approvals.filter(a => a.status === 'rejected').length;
    if (rejected > 0) return '已拒绝';
    return `${approved}/${approvals.length} 已通过`;
  };

  const renderProcurementStatus = (request: any) => {
    if (!request.shippingInfo && request.status !== 'approved') return null;

    const statuses = [
      { key: 'approved', label: '已批准', icon: CheckCircle },
      { key: 'procuring', label: '采购中', icon: Package },
      { key: 'shipping', label: '运输中', icon: Truck },
      { key: 'delivered', label: '已到货', icon: PackageCheck },
    ];

    const currentIndex = statuses.findIndex(s => s.key === request.status);

    return (
      <div className="mt-4 pt-4 border-t border-polar-ice/10">
        <h5 className="text-sm font-medium text-polar-white mb-3 flex items-center gap-2">
          <Truck size={14} className="text-polar-ice" />
          采购执行状态
        </h5>
        
        <div className="relative">
          <div className="flex justify-between mb-2">
            {statuses.map((status, index) => {
              const Icon = status.icon;
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={status.key} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive 
                      ? isCurrent 
                        ? 'bg-polar-ice text-white animate-pulse' 
                        : 'bg-safety-green text-white'
                      : 'bg-polar-white/10 text-polar-white/30'
                  }`}>
                    <Icon size={14} />
                  </div>
                  <span className={`text-xs mt-1 ${
                    isActive ? 'text-polar-white' : 'text-polar-white/30'
                  }`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-polar-white/10">
            <div 
              className="h-full bg-gradient-to-r from-safety-green to-polar-ice transition-all duration-500"
              style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {request.shippingInfo && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-polar-deep/50 rounded-lg p-3">
              <div className="text-xs text-polar-white/50 mb-1">供应商</div>
              <div className="text-sm text-polar-white font-medium">{request.shippingInfo.supplier}</div>
            </div>
            <div className="bg-polar-deep/50 rounded-lg p-3">
              <div className="text-xs text-polar-white/50 mb-1">运输批次</div>
              <div className="text-sm text-polar-white font-mono">{request.shippingInfo.shipmentBatch}</div>
            </div>
            <div className="bg-polar-deep/50 rounded-lg p-3">
              <div className="text-xs text-polar-white/50 mb-1">预计到站</div>
              <div className="text-sm text-polar-white">
                {request.shippingInfo.expectedArrival.toLocaleDateString('zh-CN')}
              </div>
            </div>
            <div className="bg-polar-deep/50 rounded-lg p-3">
              <div className="text-xs text-polar-white/50 mb-1">当前位置</div>
              <div className="text-sm text-polar-white">{request.shippingInfo.currentLocation}</div>
            </div>
          </div>
        )}

        {request.shippingInfo && request.status !== 'delivered' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-polar-white/50">到货进度</span>
              <span className="text-polar-ice font-mono">{request.shippingInfo.deliveryProgress}%</span>
            </div>
            <div className="h-2 bg-polar-deep rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-polar-ice to-safety-green transition-all duration-500"
                style={{ width: `${request.shippingInfo.deliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {request.status === 'approved' && user?.role === 'headquarters' && (
          <button
            onClick={() => handleStartProcurement(request.id)}
            className="mt-4 w-full py-2 bg-polar-ice/20 hover:bg-polar-ice/30 text-polar-ice rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Package size={14} /> 启动采购执行
          </button>
        )}

        {request.status === 'shipping' && request.shippingInfo?.deliveryProgress >= 100 && user?.role === 'headquarters' && (
          <button
            onClick={() => handleConfirmDelivery(request.id)}
            className="mt-4 w-full py-2 bg-safety-green/20 hover:bg-safety-green/30 text-safety-green rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <PackageCheck size={14} /> 确认到货入库
          </button>
        )}

        {request.status === 'delivered' && (
          <div className="mt-3 p-3 bg-safety-green/10 border border-safety-green/30 rounded-lg text-center">
            <PackageCheck className="w-5 h-5 text-safety-green mx-auto mb-1" />
            <span className="text-sm text-safety-green">
              已到货 · 入库时间: {request.deliveredAt?.toLocaleString('zh-CN')}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 overflow-auto">
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-polar-ice glow-text">
            物资管理中心
          </h2>
          <div className="text-sm text-polar-white/60">
            当前用户: {user?.name} ({getRoleLabel(user?.role || 'operator')})
          </div>
        </div>

        <div className="mb-4 p-3 bg-polar-ice/10 rounded-lg border border-polar-ice/20">
          <div className="flex items-center gap-2 text-sm text-polar-ice">
            <Info size={16} />
            <span>库存低于90天用量时系统将自动生成采购申请，有待审批申请时不会重复生成</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-polar-white mb-4 flex items-center gap-2">
            <Package size={14} className="text-polar-ice" />
            库存监控
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {materials.map((material) => {
              const hasPending = pendingRequests.some(r => r.materialId === material.id);
              const activeRequest = purchaseRequests.find(
                r => r.materialId === material.id && 
                (r.status === 'approved' || r.status === 'procuring' || r.status === 'shipping')
              );
              return (
                <div
                  key={material.id}
                  className={`bg-polar-deep/50 rounded-lg p-4 border relative overflow-hidden ${
                    material.lowStockAlert
                      ? 'warning-glow border-warning-orange/50'
                      : 'border-polar-ice/10'
                  }`}
                >
                  {hasPending && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-polar-ice/20 text-polar-ice text-xs rounded">
                      待审批中
                    </div>
                  )}
                  {activeRequest && !hasPending && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                      {getStatusLabel(activeRequest.status)}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      material.lowStockAlert ? 'bg-warning-orange/20 text-warning-orange' : 'bg-polar-ice/20 text-polar-ice'
                    }`}>
                      {getMaterialIcon(material.type)}
                    </div>
                    <div>
                      <div className="font-medium text-polar-white">{material.name}</div>
                      {material.lowStockAlert && (
                        <div className="text-xs text-warning-orange flex items-center gap-1">
                          <AlertTriangle size={10} /> 库存不足
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-polar-white/60">当前库存</span>
                        <span className="text-polar-white font-mono">
                          {material.currentStock.toLocaleString()} {material.unit}
                        </span>
                      </div>
                      <div className="h-2 bg-polar-deep rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            material.lowStockAlert
                              ? 'bg-warning-orange animate-pulse'
                              : 'bg-safety-green'
                          }`}
                          style={{ width: `${Math.min(100, (material.daysRemaining / 365) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-polar-white/60">可用天数</span>
                      <span className={`font-mono ${
                        material.lowStockAlert ? 'text-warning-orange font-bold' : 'text-polar-white'
                      }`}>
                        {material.daysRemaining} 天
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-polar-white/60">日消耗量</span>
                      <span className="text-polar-white/80 font-mono">
                        {material.dailyConsumption} {material.unit}
                      </span>
                    </div>
                  </div>

                  {material.lowStockAlert && !hasPending && !activeRequest && (
                    <div className="mt-3 pt-3 border-t border-polar-ice/10">
                      <div className="flex items-center gap-2 text-xs text-warning-orange">
                        <Zap size={12} />
                        <span>系统即将自动生成采购申请</span>
                      </div>
                    </div>
                  )}

                  {activeRequest?.shippingInfo && (
                    <div className="mt-3 pt-3 border-t border-polar-ice/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-polar-ice flex items-center gap-1">
                          <Truck size={10} /> 运输中
                        </span>
                        <span className="text-polar-white/60 font-mono">
                          {activeRequest.shippingInfo.deliveryProgress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-polar-deep rounded-full overflow-hidden mt-1">
                        <div 
                          className="h-full bg-polar-ice transition-all duration-500"
                          style={{ width: `${activeRequest.shippingInfo.deliveryProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-polar-ice/20 text-polar-ice border border-polar-ice/40'
                : 'bg-polar-deep/50 text-polar-white/60 hover:text-polar-white'
            }`}
          >
            <Clock size={14} />
            采购申请与审批
            <span className="ml-1 px-1.5 py-0.5 bg-warning-orange/20 text-warning-orange text-xs rounded">
              {pendingRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-polar-ice/20 text-polar-ice border border-polar-ice/40'
                : 'bg-polar-deep/50 text-polar-white/60 hover:text-polar-white'
            }`}
          >
            <History size={14} />
            历史记录与追踪
          </button>
        </div>

        {activeTab === 'requests' && (
          <div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {purchaseRequests.length === 0 ? (
                <div className="text-center py-8 text-polar-white/50">
                  暂无采购申请
                </div>
              ) : (
                purchaseRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-polar-deep/50 rounded-lg border border-polar-ice/10 overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-polar-deep/70 transition-colors"
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getMaterialIcon(
                            materials.find(m => m.id === request.materialId)?.type || 'fuel'
                          )}
                          <div>
                            <div className="font-medium text-polar-white">
                              {request.materialName} - {request.quantity.toLocaleString()} {request.unit}
                            </div>
                            <div className="text-xs text-polar-white/50 mt-1">
                              申请时间: {request.createdAt.toLocaleString('zh-CN')}
                              {request.autoGenerated && (
                                <span className="ml-2 text-polar-ice">· 系统自动生成</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getApprovalBadge(request.status)}
                          {expandedRequest === request.id ? (
                            <ChevronUp size={18} className="text-polar-ice" />
                          ) : (
                            <ChevronDown size={18} className="text-polar-ice" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedRequest === request.id && (
                      <div className="px-4 pb-4 border-t border-polar-ice/10 pt-4">
                        <h4 className="text-sm font-medium text-polar-white mb-3">审批流程</h4>
                        <div className="relative">
                          <div className="flex gap-2 mb-4">
                            {request.approvals.map((approval, index) => {
                              const stepStatus = getApprovalStepStatus(request, index);
                              const isLast = index === request.approvals.length - 1;
                              const isCurrentUserRole = user?.role === approval.approverRole;
                              const canUserApprove = user && canApprove(request, user.role) && isCurrentUserRole;
                              
                              return (
                                <div key={approval.id} className="flex-1 relative">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      approval.status === 'approved'
                                        ? 'bg-safety-green/20 text-safety-green'
                                        : approval.status === 'rejected'
                                        ? 'bg-alert-red/20 text-alert-red'
                                        : stepStatus === 'blocked'
                                        ? 'bg-polar-white/10 text-polar-white/30'
                                        : isCurrentUserRole
                                        ? 'bg-polar-ice/30 text-polar-ice ring-2 ring-polar-ice/50'
                                        : 'bg-polar-ice/20 text-polar-ice'
                                    }`}>
                                      {approval.status === 'approved' ? (
                                        <CheckCircle size={16} />
                                      ) : approval.status === 'rejected' ? (
                                        <X size={16} />
                                      ) : (
                                        <Clock size={16} />
                                      )}
                                    </div>
                                    <div>
                                      <span className={`text-sm ${
                                        stepStatus === 'blocked' ? 'text-polar-white/30' : 'text-polar-white'
                                      }`}>
                                        {getRoleLabel(approval.approverRole)}
                                      </span>
                                      {isCurrentUserRole && approval.status === 'pending' && (
                                        <div className="text-xs text-polar-ice">· 您的审批</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {stepStatus === 'blocked' && (
                                    <div className="text-xs text-polar-white/30 mb-1">
                                      等待上一级审批
                                    </div>
                                  )}
                                  
                                  {approval.status !== 'pending' && (
                                    <div className="text-xs text-polar-white/50">
                                      {approval.approvedAt?.toLocaleString('zh-CN')}
                                    </div>
                                  )}
                                  
                                  {approval.comment && (
                                    <div className="text-xs text-polar-white/60 mt-1 italic">
                                      "{approval.comment}"
                                    </div>
                                  )}
                                  
                                  {canUserApprove && approval.status === 'pending' && (
                                    <div className="mt-3 space-y-2">
                                      <input
                                        type="text"
                                        value={comment[request.id] || ''}
                                        onChange={(e) => setComment(prev => ({
                                          ...prev,
                                          [request.id]: e.target.value
                                        }))}
                                        placeholder="审批意见"
                                        className="w-full bg-polar-deep border border-polar-ice/20 rounded px-3 py-2 text-sm text-polar-white placeholder-polar-white/30 focus:outline-none focus:border-polar-ice/50"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleApprove(request.id, approval.approverRole)}
                                          className="flex-1 px-3 py-1.5 bg-safety-green/20 hover:bg-safety-green/30 text-safety-green rounded text-sm transition-colors flex items-center justify-center gap-1"
                                        >
                                          <CheckCircle size={14} /> 批准
                                        </button>
                                        <button
                                          onClick={() => handleReject(request.id, approval.approverRole)}
                                          className="flex-1 px-3 py-1.5 bg-alert-red/20 hover:bg-alert-red/30 text-alert-red rounded text-sm transition-colors flex items-center justify-center gap-1"
                                        >
                                          <X size={14} /> 拒绝
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {!isLast && (
                                    <div className="absolute right-0 top-4 transform translate-x-1/2 z-10">
                                      <div className={`w-4 h-0.5 ${
                                        stepStatus === 'approved' ? 'bg-safety-green' : 'bg-polar-ice/20'
                                      }`} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {request.status === 'rejected' && (
                            <div className="p-3 bg-alert-red/10 border border-alert-red/30 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <X className="w-5 h-5 text-alert-red" />
                                <span className="text-sm text-alert-red font-medium">申请已被拒绝</span>
                              </div>
                              {request.rejectionReason && (
                                <div className="text-xs text-alert-red/80 ml-7">
                                  拒绝原因: "{request.rejectionReason}"
                                </div>
                              )}
                            </div>
                          )}

                          {renderProcurementStatus(request)}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Filter size={14} className="text-polar-ice" />
              <span className="text-sm text-polar-white/60">物资类型筛选:</span>
              <div className="flex gap-2">
                {(['all', 'fuel', 'food', 'medicine'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setHistoryFilter(type)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      historyFilter === type
                        ? 'bg-polar-ice/20 text-polar-ice border border-polar-ice/40'
                        : 'bg-polar-deep/50 text-polar-white/60 hover:text-polar-white'
                    }`}
                  >
                    {getMaterialTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getFilteredHistory().length === 0 ? (
                <div className="text-center py-8 text-polar-white/50">
                  暂无历史记录
                </div>
              ) : (
                getFilteredHistory().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((record) => (
                  <div
                    key={record.id}
                    className="bg-polar-deep/50 rounded-lg border border-polar-ice/10 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          record.materialType === 'fuel' ? 'bg-warning-orange/20 text-warning-orange' :
                          record.materialType === 'food' ? 'bg-safety-green/20 text-safety-green' :
                          'bg-polar-ice/20 text-polar-ice'
                        }`}>
                          {getMaterialIcon(record.materialType)}
                        </div>
                        <div>
                          <div className="font-medium text-polar-white">
                            {record.materialName} - {record.quantity.toLocaleString()} {record.unit}
                          </div>
                          <div className="text-xs text-polar-white/50 mt-1">
                            生成时间: {record.createdAt.toLocaleString('zh-CN')}
                            {record.autoGenerated && (
                              <span className="ml-2 text-polar-ice">· 系统自动生成</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {getApprovalBadge(record.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-polar-deep/30 rounded p-2">
                        <div className="text-xs text-polar-white/50">审批进度</div>
                        <div className="text-sm text-polar-ice font-medium">
                          {getApprovalProgressText(record.approvals)}
                        </div>
                      </div>
                      {record.approvedAt && (
                        <div className="bg-polar-deep/30 rounded p-2">
                          <div className="text-xs text-polar-white/50">批准时间</div>
                          <div className="text-sm text-safety-green font-medium">
                            {record.approvedAt.toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      )}
                      {record.deliveredAt && (
                        <div className="bg-polar-deep/30 rounded p-2">
                          <div className="text-xs text-polar-white/50">到货时间</div>
                          <div className="text-sm text-safety-green font-medium">
                            {record.deliveredAt.toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      )}
                      {record.status === 'rejected' && (
                        <div className="bg-polar-deep/30 rounded p-2">
                          <div className="text-xs text-polar-white/50">拒绝节点</div>
                          <div className="text-sm text-alert-red font-medium">
                            {getRoleLabel(record.approvals.find(a => a.status === 'rejected')?.approverRole || 'leader')}
                          </div>
                        </div>
                      )}
                    </div>

                    {record.rejectionReason && (
                      <div className="p-2 bg-alert-red/10 border border-alert-red/20 rounded">
                        <div className="text-xs text-alert-red/80">
                          <span className="font-medium">拒绝原因:</span> "{record.rejectionReason}"
                        </div>
                      </div>
                    )}

                    {record.shippingInfo && (
                      <div className="mt-3 pt-3 border-t border-polar-ice/10">
                        <div className="flex items-center gap-2 text-xs text-polar-white/50 mb-2">
                          <Truck size={12} /> 物流信息
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-polar-white/50">供应商:</span>
                            <span className="text-polar-white ml-1">{record.shippingInfo.supplier}</span>
                          </div>
                          <div>
                            <span className="text-polar-white/50">批次:</span>
                            <span className="text-polar-white font-mono ml-1">{record.shippingInfo.shipmentBatch}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {record.status === 'delivered' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-safety-green">
                        <CheckCircle size={12} />
                        <span>采购完成 · 物资已入库，可用天数已恢复</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
