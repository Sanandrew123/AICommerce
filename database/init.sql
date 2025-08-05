-- 数据库初始化脚本
-- 心理过程：设计电商核心实体关系，用户-商品-订单的经典三角关系
-- 添加AI相关字段用于推荐算法和用户行为分析

-- 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    preferences JSONB, -- 用户偏好，用于AI推荐
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- 商品分类表
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2),
    category_id BIGINT REFERENCES categories(id),
    brand VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    images JSONB, -- 商品图片URLs
    attributes JSONB, -- 商品属性（颜色、尺寸等）
    tags JSONB, -- 标签，用于搜索和推荐
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    ai_features JSONB, -- AI提取的商品特征
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- 购物车表
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_attributes JSONB, -- 选择的商品属性
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, selected_attributes)
);

-- 订单表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单商品表
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    selected_attributes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品评价表
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    order_id BIGINT REFERENCES orders(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    images JSONB, -- 评价图片
    is_verified BOOLEAN DEFAULT false, -- 是否为已购买用户评价
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户行为记录表（用于AI推荐）
CREATE TABLE user_behaviors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    session_id VARCHAR(100),
    behavior_type VARCHAR(50) NOT NULL, -- VIEW, CLICK, ADD_TO_CART, PURCHASE, SEARCH
    product_id BIGINT REFERENCES products(id),
    category_id BIGINT REFERENCES categories(id),
    search_query VARCHAR(255),
    metadata JSONB, -- 额外的行为数据
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI推荐记录表
CREATE TABLE ai_recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    session_id VARCHAR(100),
    recommendation_type VARCHAR(50), -- COLLABORATIVE, CONTENT_BASED, HYBRID
    recommended_products JSONB NOT NULL, -- 推荐的商品ID数组
    confidence_score DECIMAL(3,2),
    context JSONB, -- 推荐上下文
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 客服会话表
CREATE TABLE chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    is_ai_handled BOOLEAN DEFAULT true,
    human_agent_id BIGINT,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, TRANSFERRED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- 聊天消息表
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES chat_sessions(id),
    sender_type VARCHAR(20) NOT NULL, -- USER, AI, AGENT
    sender_id BIGINT,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT', -- TEXT, IMAGE, PRODUCT_CARD
    metadata JSONB, -- 消息附加数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_user_behaviors_user ON user_behaviors(user_id);
CREATE INDEX idx_user_behaviors_type ON user_behaviors(behavior_type);
CREATE INDEX idx_user_behaviors_timestamp ON user_behaviors(timestamp);

-- 插入初始数据
INSERT INTO categories (name, description) VALUES 
('电子产品', '手机、电脑、数码设备'),
('服装', '男装、女装、童装'),
('家居', '家具、装饰、生活用品'),
('图书', '小说、技术书籍、教育用书'),
('运动', '运动器材、户外用品');

INSERT INTO products (name, description, price, category_id, brand, sku, stock_quantity, tags) VALUES 
('iPhone 15 Pro', '苹果最新款智能手机', 7999.00, 1, 'Apple', 'IPH15PRO001', 50, '["smartphone", "apple", "5g"]'),
('MacBook Pro M3', '苹果笔记本电脑', 12999.00, 1, 'Apple', 'MBP-M3-001', 30, '["laptop", "apple", "m3"]'),
('Nike Air Max', '经典运动鞋', 899.00, 5, 'Nike', 'NIKE-AM-001', 100, '["shoes", "sports", "nike"]'),
('编程珠玑', '经典编程书籍', 59.00, 4, '机械工业出版社', 'BOOK-PROG-001', 200, '["programming", "book", "algorithm"]');

-- 插入测试用户
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES 
('testuser', 'test@example.com', '$2a$10$N.ZxOPJJBADEJMnDNAzOK.QM.bWaZWZnqgBL6nE9nHlw7u6oGnwi6', '测试', '用户'),
('ailearner', 'ai@learner.com', '$2a$10$N.ZxOPJJBADEJMnDNAzOK.QM.bWaZWZnqgBL6nE9nHlw7u6oGnwi6', 'AI', '学习者');