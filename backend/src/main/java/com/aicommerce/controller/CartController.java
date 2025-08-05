package com.aicommerce.controller;

import com.aicommerce.model.CartItem;
import com.aicommerce.model.User;
import com.aicommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 购物车控制器
 * 
 * 心理过程：
 * 1. 提供购物车的RESTful API接口
 * 2. 集成用户认证，确保数据安全
 * 3. 统一的响应格式和错误处理
 * 4. 支持购物车的完整生命周期管理
 */
@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<?> getCartItems(@AuthenticationPrincipal User user) {
        try {
            CartService.CartSummary summary = cartService.getCartSummary(user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("items", summary.getItems());
            response.put("summary", Map.of(
                "totalAmount", summary.getTotalAmount(),
                "itemCount", summary.getItemCount(),
                "totalQuantity", summary.getTotalQuantity()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "获取购物车失败");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @AuthenticationPrincipal User user,
            @RequestBody AddToCartRequest request) {
        try {
            CartItem cartItem = cartService.addToCart(
                user.getId(),
                request.getProductId(),
                request.getQuantity(),
                request.getSelectedAttributes()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "商品已添加到购物车");
            response.put("cartItem", cartItem);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "添加到购物车失败");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @RequestBody UpdateCartItemRequest request) {
        try {
            CartItem cartItem = cartService.updateCartItemQuantity(
                user.getId(),
                itemId,
                request.getQuantity()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", cartItem != null ? "购物车已更新" : "商品已从购物车移除");
            response.put("cartItem", cartItem);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "更新购物车失败");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeFromCart(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId) {
        try {
            cartService.removeFromCart(user.getId(), itemId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "商品已从购物车移除");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "移除商品失败");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal User user) {
        try {
            cartService.clearCart(user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "购物车已清空");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "清空购物车失败");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateCart(@AuthenticationPrincipal User user) {
        try {
            boolean isValid = cartService.validateCartItems(user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isValid", isValid);
            response.put("message", isValid ? "购物车商品都可用" : "购物车中有商品不可用");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "验证购物车失败");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 请求DTO类
    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity = 1;
        private String selectedAttributes;

        // Getters and setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public String getSelectedAttributes() { return selectedAttributes; }
        public void setSelectedAttributes(String selectedAttributes) { this.selectedAttributes = selectedAttributes; }
    }

    public static class UpdateCartItemRequest {
        private Integer quantity;

        // Getters and setters
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}