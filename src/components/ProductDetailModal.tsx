import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Star, X } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity?: number;
}

interface Review {
  id: number;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductDetailModalProps {
  product: Product;
  reviews: Review[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAddReview: (productId: number, rating: number, comment: string) => void;
  userLoggedIn: boolean;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  reviews, 
  onClose, 
  onAddToCart, 
  onAddReview,
  userLoggedIn 
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReview(product.id, rating, comment);
    setComment('');
    setRating(5);
    setShowReviewForm(false);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-main border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-gradient-pink text-white border-none">
                {product.category}
              </Badge>
              {product.stock_quantity !== undefined && (
                <Badge 
                  variant="outline" 
                  className={`${
                    product.stock_quantity > 0 
                      ? 'bg-green-500/20 text-green-300 border-green-500/50' 
                      : 'bg-red-500/20 text-red-300 border-red-500/50'
                  }`}
                >
                  {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
              )}
            </div>
            
            <div className="text-white text-3xl font-bold">
              RWF {product.price.toLocaleString()}
            </div>
            
            <p className="text-white/80">{product.description}</p>
            
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white/80">({reviews.length} reviews)</span>
              </div>
            )}
            
            <Button
              onClick={() => onAddToCart(product)}
              disabled={product.stock_quantity === 0}
              className="w-full bg-gradient-purple hover:bg-gradient-pink text-white disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
        
        <div className="mt-6 border-t border-white/20 pt-6">
          <h3 className="text-white text-xl font-semibold mb-4">Customer Reviews</h3>
          
          {userLoggedIn && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="mb-4 bg-gradient-purple hover:bg-gradient-pink text-white"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </Button>
          )}

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-6 bg-white/10 rounded-lg p-4 space-y-4">
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
          )}

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white/10 rounded-lg p-4">
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
              </div>
            ))}
            
            {reviews.length === 0 && (
              <p className="text-white/60 text-center py-4">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
