'use client';

import { ExternalLink, Calendar, Newspaper } from 'lucide-react';
import Image from 'next/image';

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

interface NewsListProps {
  news: NewsArticle[];
}

export default function NewsList({ news }: NewsListProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
      {news.map((article) => (
        <a
          key={article.id}
          href={article.article_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white border-2 border-stone-200 rounded-lg overflow-hidden hover:border-amber-300 transition-all duration-300 hover:shadow-lg group"
        >
          <div className="flex gap-4 p-4">
            {/* Thumbnail */}
            {article.thumbnail_url && (
              <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 relative rounded-lg overflow-hidden bg-stone-100">
                <Image
                  src={article.thumbnail_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Source and Time */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <Newspaper className="w-3 h-3" />
                  {article.source}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Calendar className="w-3 h-3" />
                  {formatTimeAgo(article.published_timestamp)}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-stone-900 text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors duration-300">
                {article.title}
              </h3>

              {/* Summary */}
              {article.summary && (
                <p className="text-sm text-stone-600 line-clamp-2 mb-3">
                  {article.summary}
                </p>
              )}

              {/* Read more link */}
              <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 group-hover:text-amber-700 transition-colors duration-300">
                <span>Read full article</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </div>

              {/* Full date on hover */}
              <p className="text-xs text-stone-400 mt-2">
                {formatDate(article.published_at)}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

