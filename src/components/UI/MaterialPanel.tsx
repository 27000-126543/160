import { useState } from 'react';
import { Package, Fuel, Utensils, Pill, AlertTriangle, CheckCircle, X, Clock, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useMaterialStore } from '../../store/materialStore';
import { useAuthStore } from '../../store/authStore';
import { UserRole, ApprovalStatus } from '../../types';

export function MaterialPanel() {
  const materials = useMaterialStore(state => state.materials);
  const purchaseRequests = useMaterialStore(state => state.purchaseRequests);
  const createPurchaseRequest = useMaterialStore(state => state.createPurchaseRequest);
  const approveRequest = useMaterialStore(state => state.approveRequest);
  const rejectRequest = useMaterialStore(state => state.rejectRequest);
  const user = useAuthStore(state => state.user);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState<Record<string, number>>({});

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'fuel': return <Fuel size={20} />;
      case 'food': return <Utensils size={20} />;
      case 'medicine': return <Pill size={20} />;
      default: return <Package size={20} />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'operator': return '操作员';
      case 'leader': return '考察队长';
      case 'headquarters': return '总部';
      default: return role;
    }
  };

  const getApprovalBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 rounded text-xs bg-safety-green/20 text-safety-green">已批准</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded text-xs bg-alert-red/20 text-alert-red">已拒绝</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded text-xs bg-warning-orange/20 text-warning-orange">待审批</span>;
    }
  };

  const canApprove = (role: UserRole | undefined) => {
    if (!user) return false;
    if (role === 'leader' && user.role === 'leader') return true;
    if (role === 'headquarters' && user.role === 'headquarters') return true;
    return false;
  };

  const handleCreateRequest = (materialId: string) => {
    const qty = quantity[materialId] || 1000;
    createPurchaseRequest(materialId, qty);
    setQuantity(prev => ({ ...prev, [materialId]: 0 }));
  };

  const handleApprove = (requestId: string, role: UserRole) => {
    approveRequest(requestId, role, comment || '同意');
    setComment('');
  };

  const handleReject = (requestId: string, role: UserRole) => {
    rejectRequest(requestId, role, comment || '拒绝');
    setComment('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-polar-ice glow-text">
            物资管理中心
          </h2>
          <div className="text-sm text-polar-white/60">
            当前用户: {user?.name} ({getRoleLabel(user?.role || 'operator')})
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-polar-white mb-4 flex items-center gap-2">
            <Package size={14} className="text-polar-ice" />
            库存监控
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className={`bg-polar-deep/50 rounded-lg p-4 border ${
                  material.lowStockAlert
                    ? 'warning-glow border-warning-orange/50'
                    : 'border-polar-ice/10'
                }`}
              >
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

                {material.lowStockAlert && user?.role !== 'operator' && (
                  <div className="mt-4 pt-4 border-t border-polar-ice/10">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={quantity[material.id] || ''}
                        onChange={(e) => setQuantity(prev => ({
                          ...prev,
                          [material.id]: Number(e.target.value)
                        }))}
                        placeholder="采购数量"
                        className="flex-1 bg-polar-deep border border-polar-ice/20 rounded px-3 py-2 text-sm text-polar-white placeholder-polar-white/30 focus:outline-none focus:border-polar-ice/50"
                      />
                      <button
                        onClick={() => handleCreateRequest(material.id)}
                        className="px-4 py-2 bg-polar-ice/20 hover:bg-polar-ice/30 text-polar-ice rounded text-sm transition-colors flex items-center gap-2"
                      >
                        <Send size={14} />
                        申请
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-polar-white mb-4 flex items-center gap-2">
            <Clock size={14} className="text-polar-ice" />
            采购申请与审批
          </h3>
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
                      <div className="flex gap-4 mb-4">
                        {request.approvals.map((approval, index) => (
                          <div key={approval.id} className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                approval.status === 'approved'
                                  ? 'bg-safety-green/20 text-safety-green'
                                  : approval.status === 'rejected'
                                  ? 'bg-alert-red/20 text-alert-red'
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
                              <span className="text-sm text-polar-white">
                                {getRoleLabel(approval.approverRole)}
                              </span>
                            </div>
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
                            {canApprove(approval.approverRole) && approval.status === 'pending' && (
                              <div className="mt-3 space-y-2">
                                <input
                                  type="text"
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
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
                            {index < request.approvals.length - 1 && (
                              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                                <ChevronDown size={16} className="text-polar-ice/30" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
