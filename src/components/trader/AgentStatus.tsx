'use client';

/**
 * AgentStatus Component
 * 
 * Real-time status indicator for agent processing
 * Shows: IDLE, ANALYZING, PROPOSING, AWAITING APPROVAL, ERROR
 */

import { Loader2, Brain, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export type AgentStatusType = 'IDLE' | 'ANALYZING' | 'PROPOSING' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'ERROR';

interface AgentStatusProps {
  status: AgentStatusType;
  message?: string;
}

export function AgentStatus({ status, message }: AgentStatusProps) {
  const statusConfig = {
    IDLE: {
      icon: Brain,
      label: 'Ready',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      borderColor: 'border-muted',
      animate: false
    },
    ANALYZING: {
      icon: Loader2,
      label: 'Analyzing Market Data',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      animate: true
    },
    PROPOSING: {
      icon: Brain,
      label: 'Generating Proposal',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      animate: true
    },
    AWAITING_APPROVAL: {
      icon: Clock,
      label: 'Awaiting Your Approval',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      animate: false
    },
    COMPLETED: {
      icon: CheckCircle,
      label: 'Analysis Complete',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      animate: false
    },
    ERROR: {
      icon: AlertCircle,
      label: 'Error',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      animate: false
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${config.bgColor} ${config.borderColor} transition-all duration-300`}>
      {/* Status Icon */}
      <div className={`${config.color} ${config.animate ? 'animate-pulse' : ''}`}>
        <Icon className={`w-5 h-5 ${config.animate && status === 'ANALYZING' ? 'animate-spin' : ''}`} />
      </div>

      {/* Status Text */}
      <div className="flex flex-col">
        <span className={`font-semibold ${config.color}`}>
          {config.label}
        </span>
        {message && (
          <span className="text-sm text-muted-foreground">
            {message}
          </span>
        )}
      </div>

      {/* Animated Dots for Processing States */}
      {(status === 'ANALYZING' || status === 'PROPOSING') && (
        <div className="flex gap-1">
          <div className={`w-2 h-2 rounded-full ${config.bgColor} ${config.color} animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`w-2 h-2 rounded-full ${config.bgColor} ${config.color} animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`w-2 h-2 rounded-full ${config.bgColor} ${config.color} animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}

