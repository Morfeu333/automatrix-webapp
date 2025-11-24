import React from 'react';
import { Play, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface VideoPlaceholderProps {
  title: string;
  description?: string;
  duration?: string;
  className?: string;
  thumbnail?: string;
}

const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  title,
  description,
  duration,
  className,
  thumbnail
}) => {
  return (
    <div className={cn("video-placeholder group cursor-pointer", className)}>
      {/* Thumbnail or gradient background */}
      {thumbnail ? (
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-automatrix-blue/20 to-automatrix-purple/20 rounded-lg" />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center group-hover:bg-black/50 transition-colors">
        {/* Play button */}
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
        </div>
      </div>
      
      {/* Video info overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
        {description && (
          <p className="text-white/80 text-sm mb-2 line-clamp-2">{description}</p>
        )}
        {duration && (
          <div className="flex items-center text-white/70 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {duration}
          </div>
        )}
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-lg" />
    </div>
  );
};

export default VideoPlaceholder;
