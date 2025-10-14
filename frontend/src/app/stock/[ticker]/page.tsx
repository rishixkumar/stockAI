'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Activity, Loader2, AlertCircle, Clock, Newspaper, BarChart3, Brain } from 'lucide-react';
import CandlestickList from '../../components/CandlestickList';
import NewsList from '../../components/NewsList';
import AnalysisView from '../../components/AnalysisView';

interface CandlestickData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockData {
  ticker: string;
  company_name: string;
  interval: string;
  candlesticks: CandlestickData[];
  count: number;
  requested_count?: number;
}

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  published_at: string;
  published_timestamp: number;
  source: string;
  thumbnail_url: string | null;
  article_url: string;
}

interface NewsData {
  ticker: string;
  company_name: string;
  news: NewsArticle[];
  count: number;
  time_range: string;
}

interface AnalysisData {
  ticker: string;
  analysis_timestamp: string;
  stock_analysis: any;
  news_sentiment: any;
  stock_sentiment: any;
  combined_sentiment: any;
  recommendations: string[];
}

interface AllStockData {
  default: StockData | null;
  tenMin: StockData | null;
  thirtyMin: StockData | null;
  oneHour: StockData | null;
  news: NewsData | null;
  analysis: AnalysisData | null;
}

type PageType = 'data' | 'analysis';
type TabType = 'quick' | '10m' | '30m' | '1h' | 'news';

export default function StockResultsPage({ params }: { params: Promise<{ ticker: string }> }) {
  const router = useRouter();
  const [allStockData, setAllStockData] = useState<AllStockData>({
    default: null,
    tenMin: null,
    thirtyMin: null,
    oneHour: null,
    news: null,
    analysis: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<PageType>('data');
  const [activeTab, setActiveTab] = useState<TabType>('quick');

  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const ticker = resolvedParams.ticker.toUpperCase();

  const fetchStockData = async (ticker: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all endpoints in parallel
      const [defaultRes, tenMinRes, thirtyMinRes, oneHourRes, newsRes, analysisRes] = await Promise.allSettled([
        fetch(`http://localhost:8000/api/stock/${ticker}/candlestick`),
        fetch(`http://localhost:8000/api/stock/${ticker}/candlestick-10m`),
        fetch(`http://localhost:8000/api/stock/${ticker}/candlestick-30m`),
        fetch(`http://localhost:8000/api/stock/${ticker}/candlestick-1h`),
        fetch(`http://localhost:8000/api/stock/${ticker}/news`),
        fetch(`http://localhost:8000/api/stock/${ticker}/analysis`),
      ]);

      // Process default data
      let defaultData = null;
      if (defaultRes.status === 'fulfilled' && defaultRes.value.ok) {
        defaultData = await defaultRes.value.json();
      }

      // Process 10m data
      let tenMinData = null;
      if (tenMinRes.status === 'fulfilled' && tenMinRes.value.ok) {
        tenMinData = await tenMinRes.value.json();
      }

      // Process 30m data
      let thirtyMinData = null;
      if (thirtyMinRes.status === 'fulfilled' && thirtyMinRes.value.ok) {
        thirtyMinData = await thirtyMinRes.value.json();
      }

      // Process 1h data
      let oneHourData = null;
      if (oneHourRes.status === 'fulfilled' && oneHourRes.value.ok) {
        oneHourData = await oneHourRes.value.json();
      }

      // Process news data
      let newsData = null;
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        newsData = await newsRes.value.json();
      }

      // Process analysis data
      let analysisData = null;
      if (analysisRes.status === 'fulfilled' && analysisRes.value.ok) {
        analysisData = await analysisRes.value.json();
      }

      // If all failed, throw error
      if (!defaultData && !tenMinData && !thirtyMinData && !oneHourData && !newsData && !analysisData) {
        throw new Error('Failed to fetch stock data from all endpoints');
      }

      setAllStockData({
        default: defaultData,
        tenMin: tenMinData,
        thirtyMin: thirtyMinData,
        oneHour: oneHourData,
        news: newsData,
        analysis: analysisData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAllStockData({
        default: null,
        tenMin: null,
        thirtyMin: null,
        oneHour: null,
        news: null,
        analysis: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(ticker);
  }, [ticker]);

  // Get the currently displayed stock data based on active tab
  const getCurrentStockData = (): StockData | null => {
    switch (activeTab) {
      case 'quick':
        return allStockData.default;
      case '10m':
        return allStockData.tenMin;
      case '30m':
        return allStockData.thirtyMin;
      case '1h':
        return allStockData.oneHour;
      default:
        return null;
    }
  };

  const stockData = getCurrentStockData();

  const pages = [
    { id: 'data' as PageType, label: 'Market Data', icon: BarChart3, available: true },
    { id: 'analysis' as PageType, label: 'AI Analysis', icon: Brain, available: !!allStockData.analysis },
  ];

  const tabs = [
    { id: 'quick' as TabType, label: 'Quick View', subtitle: '10 candles', available: !!allStockData.default, icon: Clock },
    { id: '10m' as TabType, label: '15 Min', subtitle: '100 candles', available: !!allStockData.tenMin, icon: Clock },
    { id: '30m' as TabType, label: '30 Min', subtitle: '100 candles', available: !!allStockData.thirtyMin, icon: Clock },
    { id: '1h' as TabType, label: '1 Hour', subtitle: '100 candles', available: !!allStockData.oneHour, icon: Clock },
    { id: 'news' as TabType, label: 'News', subtitle: `${allStockData.news?.count || 0} articles`, available: !!allStockData.news, icon: Newspaper },
  ];

  const getCompanyName = () => {
    return allStockData.default?.company_name ||
           allStockData.tenMin?.company_name ||
           allStockData.thirtyMin?.company_name ||
           allStockData.oneHour?.company_name ||
           allStockData.news?.company_name ||
           ticker;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back to Search</span>
              </button>
              <div className="h-8 w-px bg-white/30" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{ticker}</h1>
                  <p className="text-amber-50 text-lg">{getCompanyName()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Navigation */}
        {!isLoading && !error && (
          <div className="flex gap-4 mb-8">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                disabled={!page.available}
                className={`
                  flex-1 px-6 py-4 rounded-xl transition-all duration-300
                  flex items-center justify-center gap-3
                  ${
                    activePage === page.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : page.available
                      ? 'bg-white border-2 border-stone-200 text-stone-700 hover:border-amber-300 hover:shadow-md'
                      : 'bg-stone-100 border-2 border-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                  }
                `}
              >
                <page.icon className="w-6 h-6" />
                <span className="font-bold text-lg">{page.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Data Page Content */}
        {activePage === 'data' && (
          <div className="space-y-8">
            {/* Tabs */}
            {!isLoading && !error && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={!tab.available}
                    className={`
                      flex-shrink-0 px-6 py-4 rounded-xl transition-all duration-300
                      ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : tab.available
                          ? 'bg-white border-2 border-stone-200 text-stone-700 hover:border-amber-300 hover:shadow-md'
                          : 'bg-stone-100 border-2 border-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-bold text-base">{tab.label}</p>
                        <p className={`text-sm ${activeTab === tab.id ? 'text-amber-100' : 'text-stone-500'}`}>
                          {tab.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Candlestick Data */}
            {!isLoading && !error && activeTab !== 'news' && stockData && (
              <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-amber-600" />
                    Candlestick Data ({stockData.interval} intervals)
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                      Showing {stockData.count} candles
                    </span>
                  </div>
                </div>
                <CandlestickList candlesticks={stockData.candlesticks} />
              </div>
            )}

            {/* News Data */}
            {!isLoading && !error && activeTab === 'news' && allStockData.news && (
              <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
                    <Newspaper className="w-6 h-6 text-amber-600" />
                    Latest News ({allStockData.news.time_range})
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                      {allStockData.news.count} articles
                    </span>
                  </div>
                </div>
                <NewsList news={allStockData.news.news} />
              </div>
            )}

            {/* No Data States */}
            {!isLoading && !error && (
              <>
                {activeTab !== 'news' && !stockData && (
                  <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <AlertCircle className="w-16 h-16 text-stone-400" />
                      <h3 className="text-xl font-bold text-stone-600">No data available for this timeframe</h3>
                      <p className="text-stone-500">Try selecting a different interval</p>
                    </div>
                  </div>
                )}

                {activeTab === 'news' && !allStockData.news && (
                  <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Newspaper className="w-16 h-16 text-stone-400" />
                      <h3 className="text-xl font-bold text-stone-600">No recent news available</h3>
                      <p className="text-stone-500">Check back later for updates</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Analysis Page Content */}
        {activePage === 'analysis' && allStockData.analysis && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-8">
            <AnalysisView analysisData={allStockData.analysis} />
          </div>
        )}

        {/* Analysis Page - No Data */}
        {!isLoading && !error && activePage === 'analysis' && !allStockData.analysis && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Brain className="w-16 h-16 text-stone-400" />
              <h3 className="text-xl font-bold text-stone-600">Analysis data not available</h3>
              <p className="text-stone-500">Try refreshing or check back later</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-12">
            <div className="flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-16 h-16 text-amber-600 animate-spin" />
              <h3 className="text-xl font-bold text-stone-600">Fetching market data...</h3>
              <p className="text-stone-500">Analyzing {ticker} stock information</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-2xl border-2 border-red-200 shadow-lg p-8">
            <div className="flex items-start gap-4 text-red-700">
              <AlertCircle className="w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Error Loading Stock Data</h3>
                <p className="text-lg">{error}</p>
                <button
                  onClick={() => fetchStockData(ticker)}
                  className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
