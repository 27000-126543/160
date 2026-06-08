import { Package, Fuel, Utensils, Pill, AlertTriangle, Clock, Truck, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useMaterialStore, getStatusLabel, getStageLabel } from '../../store/materialStore';
import { MaterialType, ProcurementStatus } from '../../types';

export function MaterialStatusPanel({ onClose }: { onClose?: () => void }) {
  const materials = useMaterialStore(state => state.materials);
  const purchaseRequests = useMaterialStore(state => state.purchaseRequests);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'fuel': return <Fuel size={18} />;
      case 'food': return <Utensils size={18} />;
      case 'medicine': return <Pill size={18} />;
      default: return <Package size={18} />;
    }
  };

  const getMaterialTypeLabel = (type: MaterialType) => {
    switch (type) {
      case 'fuel': return '油料';
      case 'food': return '食品';
      case 'medicine': return '药品';
      default: return '物资';
    }
  };

  const getActiveRequest = (materialId: string) => {
    return purchaseRequests.find(r => 
      r.materialId === materialId && 
      (r.status === 'pending' || r.status === 'approved' || r.status === 'procuring' || r.status === 'shipping')
    );
  };

  const getRequestStatusIcon = (status: ProcurementStatus) => {
    switch (status) {
      case 'pending': return <Clock size={12} className="text-warning-orange" />;
      case 'approved': return <CheckCircle size={12} className="text-safety-green" />;
      case 'procuring': return <Package size={12} className="text-polar-ice" />;
      case 'shipping': return <Truck size={12} className="text-purple-400" />;
      default: return null;
    }
  };

  const getDaysColor = (days: number, lowStock: boolean) => {
    if (lowStock) return 'text-warning-orange';
    if (days >= 180) return 'text-safety-green';
    return 'text-polar-white';
  };

  const getDaysTrend = (days: number, lowStock: boolean) => {
    if (lowStock) return <TrendingDown size={12} className="text-warning-orange" />;
    if (days >= 180) return <TrendingUp size={12} className="text-safety-green" />;
    return null;
  };

  return (
    <div className="bg-polar-deep/95 backdrop-blur-sm rounded-lg border border-polar-ice/20 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-polar-ice/10">
        <h3 className="text-sm font-medium text-polar-ice flex items-center gap-2">
          <Package size={16} />
          物资保障态势
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-polar-ice/10 rounded transition-colors text-polar-white/50 hover:text-polar-white"
          >
            <XCircle size={14} />
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {materials.map((material) => {
          const activeRequest = getActiveRequest(material.id);
          const daysColor = getDaysColor(material.daysRemaining, material.lowStockAlert);
          
          return (
            <div
              key={material.id}
              className={`p-3 rounded-lg border ${
                material.lowStockAlert
                  ? 'bg-warning-orange/5 border-warning-orange/30'
                  : 'bg-polar-white/5 border-polar-ice/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${
                    material.lowStockAlert 
                      ? 'bg-warning-orange/20 text-warning-orange' 
                      : 'bg-polar-ice/20 text-polar-ice'
                  }`}>
                    {getMaterialIcon(material.type)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-polar-white">
                      {getMaterialTypeLabel(material.type)}
                    </span>
                    <span className="text-xs text-polar-white/50 ml-2">
                      {material.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getDaysTrend(material.daysRemaining, material.lowStockAlert)}
                  <span className={`text-sm font-bold font-mono ${daysColor}`}>
                    {material.daysRemaining} 天
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-polar-white/50">库存：</span>
                    <span className="text-polar-white font-mono">
                      {material.currentStock.toLocaleString()} {material.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-polar-white/50">日耗：</span>
                    <span className="text-polar-white/80 font-mono">
                      {material.dailyConsumption} {material.unit}
                    </span>
                  </div>
                </div>
                {material.lowStockAlert && (
                  <div className="flex items-center gap-1 text-warning-orange">
                    <AlertTriangle size={12} />
                    <span>低库存风险</span>
                  </div>
                )}
              </div>

              <div className="mt-2 h-1.5 bg-polar-deep rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    material.lowStockAlert
                      ? 'bg-warning-orange'
                      : 'bg-gradient-to-r from-safety-green to-polar-ice'
                  }`}
                  style={{ width: `${Math.min(100, (material.daysRemaining / 365) * 100)}%` }}
                />
              </div>

              {activeRequest && (
                <div className="mt-3 pt-3 border-t border-polar-ice/10">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {getRequestStatusIcon(activeRequest.status)}
                      <span className="text-polar-white/70">
                        {getStatusLabel(activeRequest.status)}
                      </span>
                      <span className="text-polar-white/50">
                        · {activeRequest.quantity.toLocaleString()} {activeRequest.unit}
                      </span>
                    </div>
                    {activeRequest.shippingInfo && (
                      <div className="flex items-center gap-2">
                        {activeRequest.shippingInfo.hasRisk && (
                          <span className="text-alert-red flex items-center gap-1">
                            <AlertTriangle size={10} />
                            延误 {activeRequest.shippingInfo.expectedDelayDays} 天
                          </span>
                        )}
                        {activeRequest.status === 'shipping' && activeRequest.shippingInfo.currentStage && (
                          <span className="text-polar-ice">
                            {getStageLabel(activeRequest.shippingInfo.currentStage)}
                          </span>
                        )}
                        {activeRequest.status === 'shipping' && (
                          <span className="text-polar-white/50 font-mono">
                            {activeRequest.shippingInfo.deliveryProgress}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {activeRequest.status === 'shipping' && activeRequest.shippingInfo && (
                    <div className="mt-2 h-1 bg-polar-deep rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          activeRequest.shippingInfo.hasRisk ? 'bg-alert-red' : 'bg-polar-ice'
                        }`}
                        style={{ width: `${activeRequest.shippingInfo.deliveryProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {!activeRequest && !material.lowStockAlert && (
                <div className="mt-3 pt-3 border-t border-polar-ice/10">
                  <div className="flex items-center gap-2 text-xs text-safety-green">
                    <CheckCircle size={12} />
                    <span>库存充足，暂无采购需求</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
