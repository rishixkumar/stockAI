'use client';

import { CheckCircle, Lightbulb, AlertTriangle, AlertCircle } from 'lucide-react';

interface TradingRecommendation {
  type: string;
  icon: string;
  message: string;
  confidence: string;
}

interface MLTradingRecommendationsProps {
  recommendations: TradingRecommendation[];
}

export default function MLTradingRecommendations({ recommendations }: MLTradingRecommendationsProps) {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'check_circle':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'lightbulb':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'alert_triangle':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'alert_circle':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getRecommendationColor = (type: string) => {
    if (type.includes('buy') || type.includes('opportunity') || type.includes('oversold')) {
      return 'border-green-200 bg-green-50/50 hover:bg-green-50';
    } else if (type.includes('warning') || type.includes('risk') || type.includes('overbought')) {
      return 'border-amber-200 bg-amber-50/50 hover:bg-amber-50';
    } else if (type.includes('defensive') || type.includes('sell')) {
      return 'border-red-200 bg-red-50/50 hover:bg-red-50';
    } else {
      return 'border-blue-200 bg-blue-50/50 hover:bg-blue-50';
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white border-2 border-stone-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-3" />
        <p className="text-stone-600 font-medium">No trading recommendations available</p>
        <p className="text-sm text-stone-500 mt-1">Insufficient data for analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-stone-900">Trading Recommendations</h3>
        <span className="text-sm text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
          {recommendations.length} insights
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className={`
              flex items-start gap-4 p-4 rounded-xl border-2
              transition-all duration-300 ease-out
              ${getRecommendationColor(recommendation.type)}
            `}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIconComponent(recommendation.icon)}
            </div>
            
            <div className="flex-1">
              <p className="text-stone-800 font-medium leading-relaxed">
                {recommendation.message}
              </p>
            </div>

            <div className={`
              flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border
              ${getConfidenceBadge(recommendation.confidence)}
            `}>
              {recommendation.confidence.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
