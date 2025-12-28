
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl group cursor-pointer" onClick={() => onViewDetails(product)}>
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="bg-gradient-pink text-white border-none">
            {product.category}
          </Badge>
          <span className="text-white font-bold text-lg">RWF {product.price.toLocaleString()}</span>
        </div>
        
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-purple-200 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-white/80 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        
        <p className="text-white/60 text-xs mb-2 italic group-hover:text-white/80 transition-colors">
          Click to view details & reviews
        </p>
        
        <div className="mb-4">
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
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.stock_quantity === 0}
          className="w-full bg-gradient-purple hover:bg-gradient-pink text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
