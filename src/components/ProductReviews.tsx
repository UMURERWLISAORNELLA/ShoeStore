import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  onAddReview: (rating: number, comment: string) => void;
  userLoggedIn: boolean;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, reviews, onAddReview, userLoggedIn }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReview(rating, comment);
    setComment('');
    setRating(5);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {userLoggedIn && (
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-purple hover:bg-gradient-pink text-white"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      )}

      {showForm && (
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/50'
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-white text-sm mb-2 block">Your Review</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  placeholder="Share your experience with this product..."
                  required
                  rows={4}
                />
              </div>
              
              <Button type="submit" className="w-full bg-gradient-purple hover:bg-gradient-pink text-white">
                Submit Review
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-white font-semibold">{review.username}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-white/80 text-sm">{review.comment}</p>
              <p className="text-white/50 text-xs mt-2">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
        
        {reviews.length === 0 && (
          <p className="text-white/60 text-center py-4">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
