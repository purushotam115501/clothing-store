'use client';

import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
  reviews: Review[];
  onReviewAdded: () => void;
  isAuthenticated: boolean;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId, reviews, onReviewAdded, isAuthenticated }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please enter a comment.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      setComment('');
      setRating(5);
      onReviewAdded(); // Refresh product page
    } catch (err: any) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border-t border-border pt-8">
      <h3 className="text-lg font-bold uppercase tracking-wider mb-6">Customer Reviews ({reviews.length})</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>No reviews yet for this product. Be the first to leave one!</span>
            </p>
          ) : (
            reviews.map((review, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card p-4 text-foreground shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{review.userName}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Review Panel */}
        <div>
          {isAuthenticated ? (
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Leave a Review</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Stars selector */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="text-yellow-400 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              starValue <= (hoverRating ?? rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-zinc-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment area */}
                <div>
                  <label htmlFor="comment-textarea" className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Your Review</label>
                  <textarea
                    id="comment-textarea"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your experience with this item..."
                    className="w-full rounded border border-border bg-transparent p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded bg-primary py-2.5 text-xs font-bold text-primary-foreground tracking-wider uppercase hover:bg-neutral-900 transition-colors focus:outline-none disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
              <p className="text-xs text-muted-foreground mb-3">Only verified buyers who are logged in can write reviews.</p>
              <a
                href="/login"
                className="inline-block rounded bg-primary px-4 py-2 text-xs font-bold text-primary-foreground uppercase tracking-wider hover:bg-neutral-900 transition-colors"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
