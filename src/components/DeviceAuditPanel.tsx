import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  Download,
  RefreshCw,
  Smartphone,
  Monitor,
  Eye,
  BarChart3,
  FileText
} from 'lucide-react';
import { 
  auditAllDevices, 
  auditDevice, 
  exportAuditResults,
  AuditSummary,
  DeviceAuditResult 
} from '../lib/deviceAudit';
import { DEVICE_SPECS } from '../data/DeviceSpecs';

export const DeviceAuditPanel: React.FC = () => {
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceAudit, setDeviceAudit] = useState<DeviceAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runAudit = useCallback(async () => {
    setIsAuditing(true);
    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      const summary = auditAllDevices();
      setAuditSummary(summary);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsAuditing(false);
    }
  }, []);

  useEffect(() => {
    runAudit();
  }, [runAudit]);

  const auditSpecificDevice = (deviceId: string) => {
    const device = DEVICE_SPECS[deviceId];
    if (device) {
      const result = auditDevice(deviceId, device);
      setDeviceAudit(result);
      setSelectedDevice(deviceId);
    }
  };

  const exportResults = () => {
    const exportData = exportAuditResults();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `device-audit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getIssueIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'info':
        return <Info className="w-3 h-3 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Device Frame Audit
          </h4>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={runAudit}
              disabled={isAuditing}
              className="h-7 px-2 text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isAuditing ? 'animate-spin' : ''}`} />
              {isAuditing ? 'Auditing...' : 'Refresh'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportResults}
              className="h-7 px-2 text-xs"
              disabled={!auditSummary}
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {isAuditing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm text-blue-700">Auditing device configurations...</span>
            </div>
          </div>
        )}
      </div>

      {/* Audit Summary */}
      {auditSummary && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{auditSummary.totalDevices}</div>
                <div className="text-xs text-blue-700">Total Devices</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{auditSummary.validDevices}</div>
                <div className="text-xs text-green-700">Valid Devices</div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Status Breakdown
              </h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <span>{auditSummary.validDevices} Valid</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                  <span>{auditSummary.devicesWithWarnings} Warnings</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span>{auditSummary.devicesWithErrors} Errors</span>
                </div>
              </div>
            </div>

            {/* Resolution Support */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Resolution Support
              </h5>
              <div className="p-3 bg-gray-50 rounded-lg text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Min Resolution:</span>
                    <p className="font-medium">
                      {auditSummary.supportedResolutions.minWidth}×{auditSummary.supportedResolutions.minHeight}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Resolution:</span>
                    <p className="font-medium">
                      {auditSummary.supportedResolutions.maxWidth}×{auditSummary.supportedResolutions.maxHeight}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            {auditSummary.commonIssues.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Common Issues
                </h5>
                <div className="space-y-1">
                  {auditSummary.commonIssues.slice(0, 3).map((issue, index) => (
                    <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      {issue}
                    </div>
                  ))}
                  {auditSummary.commonIssues.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{auditSummary.commonIssues.length - 3} more issues
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Toggle Details */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              {showDetails ? 'Hide' : 'Show'} Device Details
            </Button>
          </div>
        </div>
      )}

      {/* Device List */}
      {showDetails && auditSummary && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Device Status ({auditSummary.totalDevices})
          </h5>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(DEVICE_SPECS).map(([deviceId, device]) => {
              const deviceResult = auditDevice(deviceId, device);
              return (
                <button
                  key={deviceId}
                  onClick={() => auditSpecificDevice(deviceId)}
                  className={`w-full p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                    selectedDevice === deviceId
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(deviceResult.status)}
                      <span className="text-sm font-medium">{device.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {deviceResult.issues.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {deviceResult.issues.length} issue{deviceResult.issues.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {device.screen.width}×{device.screen.height} • {device.category} • {device.variant}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Device Detail */}
      {deviceAudit && selectedDevice && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {deviceAudit.deviceName} Details
            </h5>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDevice(null);
                setDeviceAudit(null);
              }}
              className="h-7 px-2 text-xs"
            >
              Close
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {getStatusIcon(deviceAudit.status)}
              <span className="text-sm font-medium capitalize">{deviceAudit.status}</span>
            </div>

            {/* Frame Specifications */}
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-gray-900">Frame Specifications</h6>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Viewport:</span>
                  <p className="font-medium">
                    {deviceAudit.frameSpecs.viewport.width}×{deviceAudit.frameSpecs.viewport.height}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Aspect Ratio:</span>
                  <p className="font-medium">{deviceAudit.frameSpecs.viewport.aspectRatio.toFixed(3)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Display Scale:</span>
                  <p className="font-medium">{deviceAudit.frameSpecs.displayScale}x</p>
                </div>
                <div>
                  <span className="text-gray-500">Corner Radius:</span>
                  <p className="font-medium">{deviceAudit.frameSpecs.viewport.cornerRadius}px</p>
                </div>
              </div>
            </div>

            {/* Image Compatibility */}
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-gray-900">Image Compatibility</h6>
              <div className="p-3 bg-gray-50 rounded-lg text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Recommended Resolution:</span>
                    <p className="font-medium">{deviceAudit.imageCompatibility.optimalResolutions.recommended}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Optimal Aspect Ratio:</span>
                    <p className="font-medium">{deviceAudit.imageCompatibility.aspectRatioRange.optimal.toFixed(3)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Supported Formats:</span>
                    <p className="font-medium">{deviceAudit.imageCompatibility.supportedFormats.length} formats</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues */}
            {deviceAudit.issues.length > 0 && (
              <div className="space-y-2">
                <h6 className="text-sm font-medium text-gray-900">Issues ({deviceAudit.issues.length})</h6>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {deviceAudit.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded border text-xs ${
                        issue.type === 'error' ? 'bg-red-50 border-red-200' :
                        issue.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <p className="font-medium">{issue.message}</p>
                          {issue.suggestion && (
                            <p className="text-gray-600 mt-1">💡 {issue.suggestion}</p>
                          )}
                        </div>
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          issue.impact === 'high' ? 'bg-red-100 text-red-700' :
                          issue.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {issue.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {deviceAudit.recommendations.length > 0 && (
              <div className="space-y-2">
                <h6 className="text-sm font-medium text-gray-900">Recommendations</h6>
                <div className="space-y-1">
                  {deviceAudit.recommendations.map((rec, index) => (
                    <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      💡 {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};