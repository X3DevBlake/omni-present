import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';

export default function AgentReviewSystem({ agentId }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['agent-reviews', agentId],
    queryFn: async () => {
      const allReviews = await base44.entities.AgentReview.filter({ agent_id: agentId });
      return allReviews.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const response = await base44.functions.invoke('submitAgentReview', reviewData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-reviews', agentId]);
      setRating(0);
      setReviewText('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0 && reviewText.trim()) {
      submitReviewMutation.mutate({
        agent_id: agentId,
        rating,
        review_text: reviewText
      });
    }
  };

  const avgRating = reviews?.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Agent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-yellow-400">
              {avgRating.toFixed(1)}
            </div>
            <div className="flex flex-col">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400">
                Based on {reviews?.length || 0} reviews
              </p>
            </div>
          </div>

          {/* Submit Review Form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-700 pt-4">
            <div>
              <label className="text-white text-sm mb-2 block">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-all ${
                      star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400 scale-110'
                        : 'text-gray-600 hover:text-yellow-300'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Your Review</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience working with this agent..."
                className="bg-slate-800 border-slate-600 text-white min-h-24"
              />
            </div>

            <Button
              type="submit"
              disabled={rating === 0 || !reviewText.trim() || submitReviewMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Review List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading reviews...</p>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="bg-slate-900/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    {review.verified_purchase && (
                      <Badge className="bg-green-600 text-white text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_date).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-white mb-3">{review.review_text}</p>

                {review.strengths && review.strengths.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 mb-1">Strengths:</p>
                    <div className="flex flex-wrap gap-2">
                      {review.strengths.map((strength, idx) => (
                        <Badge key={idx} className="bg-green-900/50 text-green-300 text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {review.areas_for_improvement && review.areas_for_improvement.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">Areas for Improvement:</p>
                    <div className="flex flex-wrap gap-2">
                      {review.areas_for_improvement.map((area, idx) => (
                        <Badge key={idx} className="bg-orange-900/50 text-orange-300 text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    Helpful ({review.helpful_count || 0})
                  </button>
                  {review.sentiment_score !== undefined && (
                    <span>
                      Sentiment: {(review.sentiment_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-400 text-center">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}