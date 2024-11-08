import { Eye, EyeOff, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { useState } from 'react';
import React from 'react';
import AvatarEditDialog from './AvatarEditDialog';
import AvatarViewDialog from './AvatarViewDialog';

interface AvatarCardProps {
  id: string;
  name: string;
  creator: string;
  description: string;
  image_url: string;
  interactions: number;
  tags: string[];
  user_id: string;
  public_id?: string;
  is_featured?: boolean;
  isFavorite?: boolean;
  is_public?: boolean;
  className?: string;
  onFavoriteToggle: () => void;
  onPrivacyToggle?: (
    id: string,
    data: {
      name: string;
      description: string;
      tags: string[];
      is_public: boolean;
    }
  ) => void;
  showPrivacyControls?: boolean;
  onUseAsAIFriend?: (id: string) => void;
  isCreator?: boolean;
  isInUse?: boolean;
  hasAIFriend?: boolean;
}

const AvatarCard = ({
  id,
  name,
  creator,
  description,
  image_url,
  interactions,
  tags,
  isFavorite,
  is_public,
  className,
  onFavoriteToggle,
  onPrivacyToggle,
  showPrivacyControls,
  onUseAsAIFriend,
  isCreator,
  isInUse,
  hasAIFriend,
}: AvatarCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const handleEditConfirm = (data: {
    name: string;
    description: string;
    tags: string[];
    is_public: boolean;
  }) => {
    onPrivacyToggle?.(id, data);
    setShowEditDialog(false);
  };

  const getButtonText = () => {
    if (isInUse) return 'In Use';
    if (isCreator && hasAIFriend) return 'Edit AI Friend';
    return 'Use as AI Friend';
  };

  const getButtonStyle = () => {
    if (isInUse) {
      return 'bg-gray-400 cursor-not-allowed opacity-75';
    }
    return 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600';
  };

  return (
    <>
      <div
        className={cn(
          'group relative bg-white/95 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border border-gray-100/50',
          'hover:border-emerald-200/50',
          'w-full', // Allow card to fill available grid space
          className
        )}
      >
        <div className="h-[150px] sm:h-[225px] md:h-[240px] lg:h-[255px] overflow-hidden">
          {' '}
          {/* Reduced height for mobile */}
          <Image
            src={image_url || '/images/comic/1.png'}
            alt={name || 'Avatar'}
            width={300}
            height={225}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            priority={true}
          />
        </div>

        <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 line-clamp-1 flex-1 min-w-0">
              {name}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {showPrivacyControls && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}
                  className="focus:outline-none hover:text-gray-600 transition-colors p-1 sm:p-1.5 rounded-full hover:bg-gray-100"
                >
                  {is_public ? (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  )}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle();
                }}
                className="focus:outline-none transition-transform active:scale-95 p-1 sm:p-1.5 rounded-full hover:bg-gray-100"
              >
                <Star
                  className={cn(
                    'w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300',
                    isFavorite
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-400 hover:text-yellow-400'
                  )}
                />
              </button>
            </div>
          </div>

          <p className="hidden sm:block text-xs sm:text-sm text-purple-600 font-medium truncate">
            @{creator}
          </p>

          <p className="hidden sm:block text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed h-[32px] sm:h-[40px]">
            {description}
          </p>

          <div className="pt-1 sm:pt-2 flex flex-col gap-2 sm:gap-3">
            <div className="text-xs sm:text-sm text-gray-500 font-semibold">
              {interactions.toLocaleString()} interactions
            </div>

            <div className="hidden sm:flex flex-wrap gap-1 sm:gap-1.5 min-h-[24px] sm:min-h-[28px]">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {!showPrivacyControls && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewDialog(true);
                }}
                className="w-full flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm font-medium text-gray-700"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                View Details
              </button>
            )}

            {onUseAsAIFriend && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isInUse) {
                    onUseAsAIFriend?.(id);
                  }
                }}
                disabled={isInUse}
                className={`${getButtonStyle()} text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full font-semibold transform hover:-translate-y-0.5`}
              >
                {getButtonText()}
              </button>
            )}
          </div>
        </div>
      </div>
      <AvatarEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onConfirm={handleEditConfirm}
        initialData={{
          name: name || '',
          description: description || '',
          tags: Array.isArray(tags) ? tags : [],
          is_public: Boolean(is_public),
        }}
      />
      <AvatarViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        avatar={{
          name,
          description,
          tags,
          creator,
          image_url,
          interactions,
        }}
      />
    </>
  );
};

export default AvatarCard;
