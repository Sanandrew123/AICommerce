package com.aicommerce.service;

import com.aicommerce.model.CartItem;
import com.aicommerce.model.Product;
import com.aicommerce.model.User;
import com.aicommerce.repository.CartItemRepository;
import com.aicommerce.repository.ProductRepository;
import com.aicommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * 购物车服务类
 * 
 * 心理过程：
 * 1. 管理用户购物车的所有操作
 * 2. 支持商品添加、删除、数量修改
 * 3. 自动处理库存检查和价格计算
 * 4. 提供购物车统计信息
 */
@Service
@Transactional
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CartItem> getCartItems(Long userId) {
        return cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public CartItem addToCart(Long userId, Long productId, Integer quantity, String selectedAttributes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));

        if (!product.isInStock()) {
            throw new IllegalArgumentException("商品已售罄");
        }

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("库存不足，当前库存：" + product.getStockQuantity());
        }

        // 检查是否已存在相同商品和属性的购物车项
        Optional<CartItem> existingItem = selectedAttributes != null ?
                cartItemRepository.findByUserIdAndProductIdAndAttributes(userId, productId, selectedAttributes) :
                cartItemRepository.findByUserIdAndProductId(userId, productId);

        if (existingItem.isPresent()) {
            // 更新数量
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + quantity;
            
            if (product.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("库存不足，最多可添加：" + 
                    (product.getStockQuantity() - cartItem.getQuantity()) + "件");
            }
            
            cartItem.setQuantity(newQuantity);
            return cartItemRepository.save(cartItem);
        } else {
            // 创建新的购物车项
            CartItem cartItem = new CartItem(user, product, quantity);
            cartItem.setSelectedAttributes(selectedAttributes);
            return cartItemRepository.save(cartItem);
        }
    }

    public CartItem updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("购物车项不存在"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("无权限操作此购物车项");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        Product product = cartItem.getProduct();
        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("库存不足，当前库存：" + product.getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    public void removeFromCart(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("购物车项不存在"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("无权限操作此购物车项");
        }

        cartItemRepository.delete(cartItem);
    }

    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    public CartSummary getCartSummary(Long userId) {
        List<CartItem> items = getCartItems(userId);
        
        BigDecimal totalAmount = items.stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int totalItems = items.size();
        int totalQuantity = items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return new CartSummary(totalAmount, totalItems, totalQuantity, items);
    }

    public boolean validateCartItems(Long userId) {
        List<CartItem> items = getCartItems(userId);
        
        for (CartItem item : items) {
            if (!item.isAvailable()) {
                return false;
            }
        }
        
        return true;
    }

    // 购物车摘要DTO
    public static class CartSummary {
        private BigDecimal totalAmount;
        private int itemCount;
        private int totalQuantity;
        private List<CartItem> items;

        public CartSummary(BigDecimal totalAmount, int itemCount, int totalQuantity, List<CartItem> items) {
            this.totalAmount = totalAmount;
            this.itemCount = itemCount;
            this.totalQuantity = totalQuantity;
            this.items = items;
        }

        // Getter方法
        public BigDecimal getTotalAmount() { return totalAmount; }
        public int getItemCount() { return itemCount; }
        public int getTotalQuantity() { return totalQuantity; }
        public List<CartItem> getItems() { return items; }
    }
}