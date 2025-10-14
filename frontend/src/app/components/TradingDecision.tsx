'use client';

import { TrendingUp, TrendingDown, Minus, Target, DollarSign, Clock, Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface TradingDecisionData {
  decision: string;
  price_target: number;
  current_price: number;
  confidence: string;
  overall_score: number;
  component_scores: {
    technical: number;
    sentiment: number;
    momentum: number;
    volatility: number;
    volume: number;
  };
  explanation: string;
  risk_level: string;
  time_horizon: string;
  decision_timestamp: string;
}

interface TradingDecisionProps {
  tradingDecision: TradingDecisionData;
}

export default function TradingDecision({ tradingDecision }: TradingDecisionProps) {
  const { decision, price_target, current_price, confidence, explanation, risk_level, time_horizon, component_scores } = tradingDecision;

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'BUY':
        return 'from-green-500 to-emerald-600';
      case 'SELL':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-stone-500 to-stone-600';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'BUY':
        return <TrendingUp className="w-8 h-8 text-white" />;
      case 'SELL':
        return <TrendingDown className="w-8 h-8 text-white" />;
      default:
        return <Minus className="w-8 h-8 text-white" />;
    }
  };

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'very_high':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'high':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-stone-700 bg-stone-50 border-stone-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-700 bg-red-50';
      case 'medium':
        return 'text-amber-700 bg-amber-50';
      default:
        return 'text-green-700 bg-green-50';
    }
  };

  const formatConfidence = (conf: string) => {
    return conf.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-stone-900 flex items-center justify-center gap-2">
          <Target className="w-6 h-6 text-amber-600" />
          AI Trading Decision
        </h2>
        <p className="text-sm text-stone-600">Machine learning-powered recommendation</p>
      </div>

      {/* Main Decision Card */}
      <div className={`bg-gradient-to-r ${getDecisionColor(decision)} rounded-2xl p-8 text-white shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {getDecisionIcon(decision)}
            </div>
            <div>
              <h3 className="text-4xl font-bold">{decision}</h3>
              <p className="text-lg opacity-90">Trading Signal</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm`}>
            <p className="text-sm font-semibold">{formatConfidence(confidence)} CONFIDENCE</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Current Price</p>
            </div>
            <p className="text-3xl font-bold">${current_price.toFixed(2)}</p>
          </div>

          {decision !== 'HOLD' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <p className="text-sm font-medium opacity-90">Price Target</p>
              </div>
              <p className="text-3xl font-bold">${price_target.toFixed(2)}</p>
              <p className="text-sm opacity-75 mt-1">
                {decision === 'BUY' ? 'Upside' : 'Downside'}: {Math.abs(((price_target - current_price) / current_price) * 100).toFixed(1)}%
              </p>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              <p className="text-sm font-medium opacity-90">Time Horizon</p>
            </div>
            <p className="text-lg font-bold">{time_horizon.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Explanation Card */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Analysis Explanation</h3>
            <p className="text-stone-700 leading-relaxed">{explanation}</p>
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          Score Breakdown
        </h3>
        
        <div className="space-y-3">
          {Object.entries(component_scores).map(([key, value]) => {
            const percentage = ((value + 1) / 2) * 100; // Normalize -1 to 1 range to 0-100%
            const isPositive = value > 0;
            
            return (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-stone-700 capitalize">{key}</span>
                  <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-stone-600'}`}>
                    {value > 0 ? '+' : ''}{value.toFixed(3)}
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isPositive ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                      value < 0 ? 'bg-gradient-to-r from-red-400 to-red-600' : 
                      'bg-stone-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${getConfidenceColor(confidence)} border-2 rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" />
            <p className="font-semibold">Confidence Level</p>
          </div>
          <p className="text-2xl font-bold">{formatConfidence(confidence)}</p>
        </div>

        <div className={`${getRiskColor(risk_level)} rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-semibold">Risk Level</p>
          </div>
          <p className="text-2xl font-bold capitalize">{risk_level}</p>
        </div>
      </div>
    </div>
  );
}
