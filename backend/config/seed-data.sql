
-- Insert sample users
INSERT INTO users (username, email, password_hash, role, full_name, phone, address, city, zip_code) VALUES
('admin', 'admin@store.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin User', '+250788000001', '123 Admin Street', 'Kigali', '00001'),
('customer', 'customer@store.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'John Customer', '+250788000002', '456 Customer Ave', 'Kigali', '00002')
ON CONFLICT (username) DO NOTHING;

INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
('Nike Air Max 270', 'Lightweight running shoe with excellent grip and breathable upper. Ideal for off-road and mixed-terrain runs.', 129.99, 'Men', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&w=500&q=80', 40),
('Adidas Ultraboost 22', 'Comfortable everyday sneaker with cushioned insole and versatile styling.', 89.99, 'Women', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&w=500&q=80', 50),
('Converse Chuck Taylor', 'Durable kids shoes with reinforced toe and flexible sole for active play.', 39.99, 'Kids', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&w=500&q=80', 60),
('Oxford Leather Dress', 'Premium leather oxford shoe with cushioned footbed and timeless style.', 149.99, 'Men', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?ixlib=rb-4.0.3&w=500&q=80', 20),
('Elegant High Heels', 'Chic high-heel with padded sole and elegant silhouette for special occasions.', 119.99, 'Women', 'https://images.unsplash.com/photo-1543163521-1bf539c55a6b?ixlib=rb-4.0.3&w=500&q=80', 25),
('Kids Velcro Sneakers', 'Bright and comfortable sneakers for toddlers with easy velcro straps.', 29.99, 'Kids', 'https://images.unsplash.com/photo-1520256862855-398228c41684?ixlib=rb-4.0.3&w=500&q=80', 45),
('Puma Running Shoes', 'Supportive running trainer with responsive midsole and breathable mesh.', 139.99, 'Men', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&w=500&q=80', 35),
('Summer Flip Flops', 'Lightweight summer sandals with cushioned straps and slip-resistant sole.', 49.99, 'Women', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?ixlib=rb-4.0.3&w=500&q=80', 30)
ON CONFLICT (name) DO NOTHING;
