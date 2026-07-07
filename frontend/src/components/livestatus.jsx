import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LiveStatusModal({ liveStatus, onClose }) {
  if (!liveStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="live-status-modal-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-[#E5E5E5] w-full max-w-md overflow-hidden shadow-2xl p-6"
        data-testid="live-status-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#0A0A0A]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Live Train Status
            </h3>
            <p className="text-xs text-[#6C757D] mt-0.5">Train Number: {liveStatus.trainNumber}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-[#FAFAFA] rounded-lg transition-colors"
            data-testid="close-live-status-modal"
          >
            <X className="w-5 h-5 text-[#6C757D]" />
          </button>
        </div>

        {/* Content */}
        <div className="bg-[#FAFAFA] p-5 border border-[#E5E5E5] rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E5E5]/60 pb-3">
            <span className="text-sm font-semibold text-[#6C757D]">Status</span>
            <span className="text-sm font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {liveStatus.statusMessage}
            </span>
          </div>

          <div className="flex items-start justify-between border-b border-[#E5E5E5]/60 pb-3 gap-4">
            <span className="text-sm font-semibold text-[#6C757D] shrink-0">Current Location</span>
            <span className="text-sm font-medium text-[#0A0A0A] text-right flex items-start gap-1.5 justify-end">
              <MapPin className="w-4 h-4 text-[#E63946] mt-0.5 shrink-0" />
              {liveStatus.currentLocation}
            </span>
          </div>

          <div className="flex items-center justify-between pb-1">
            <span className="text-sm font-semibold text-[#6C757D]">Delay</span>
            <span className={`text-sm font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              liveStatus.delayMinutes > 0 
                ? "bg-red-50 text-red-600" 
                : "bg-green-50 text-green-600"
            }`}>
              {liveStatus.delayMinutes > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  {liveStatus.delayMinutes} mins Late
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  On Time
                </>
              )}
            </span>
          </div>

          <div className="text-[10px] text-[#6C757D] pt-2 border-t border-[#E5E5E5]/60 text-center flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-[#6C757D]" />
            Last Updated: {liveStatus.lastUpdated}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6">
          <button 
            className="w-full py-3 bg-[#1D3557] text-white font-semibold rounded-xl hover:bg-[#15283F] transition-all"
            onClick={onClose}
            data-testid="confirm-close-live-status-modal"
          >
            Close Tracking
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
