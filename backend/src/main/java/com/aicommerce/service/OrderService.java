package com.aicommerce.service;

import com.aicommerce.model.*;
import com.aicommerce.repository.OrderRepository;
import com.aicommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 订单服务类
 */
@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    public Page<Order> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> findByIdAndUserId(Long id, Long userId) {
        return orderRepository.findByIdAndUserId(id, userId);
    }

    public Optional<Order> findByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    public Order createOrderFromCart(Long userId, String shippingAddress, String paymentMethod, String notes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        CartService.CartSummary cartSummary = cartService.getCartSummary(userId);
        List<CartItem> cartItems = cartSummary.getItems();

        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("购物车为空，无法创建订单");
        }

        // 验证购物车商品可用性
        if (!cartService.validateCartItems(userId)) {
            throw new IllegalArgumentException("购物车中有商品不可用，请重新检查");
        }

        // 创建订单
        String orderNumber = generateOrderNumber();
        Order order = new Order(user, orderNumber, cartSummary.getTotalAmount(), shippingAddress);
        order.setPaymentMethod(paymentMethod);
        order.setNotes(notes);

        // 保存订单
        order = orderRepository.save(order);

        // 创建订单项
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = new OrderItem(
                order,
                product,
                cartItem.getQuantity(),
                product.getEffectivePrice()
            );
            orderItem.setSelectedAttributes(cartItem.getSelectedAttributes());
            orderItems.add(orderItem);

            // 减少库存
            productService.updateStock(product.getId(), -cartItem.getQuantity());
        }

        order.setItems(orderItems);
        order = orderRepository.save(order);

        // 清空购物车
        cartService.clearCart(userId);

        return order;
    }

    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("订单不存在"));

        // 验证状态转换的合法性
        validateStatusTransition(order.getStatus(), status);

        order.setStatus(status);
        return orderRepository.save(order);
    }

    public Order updatePaymentStatus(Long orderId, Order.PaymentStatus paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("订单不存在"));

        order.setPaymentStatus(paymentStatus);
        
        // 如果支付成功，更新订单状态
        if (paymentStatus == Order.PaymentStatus.PAID && order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.PAID);
        }

        return orderRepository.save(order);
    }

    public Order cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new IllegalArgumentException("订单不存在或无权限操作"));

        if (!order.canBeCancelled()) {
            throw new IllegalArgumentException("订单状态不允许取消");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        
        // 恢复库存
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                productService.updateStock(item.getProduct().getId(), item.getQuantity());
            }
        }

        return orderRepository.save(order);
    }

    public List<Order> getUserOrdersByStatus(Long userId, Order.OrderStatus status) {
        return orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
    }

    public List<Order> getUserOrdersByDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    public long getUserOrderCount(Long userId) {
        return orderRepository.countByUserId(userId);
    }

    public long getUserOrderCountByStatus(Long userId, Order.OrderStatus status) {
        return orderRepository.countByUserIdAndStatus(userId, status);
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomSuffix = String.valueOf((int)(Math.random() * 1000));
        String orderNumber = "ORD" + timestamp + String.format("%03d", Integer.parseInt(randomSuffix));
        
        // 确保订单号唯一
        while (orderRepository.existsByOrderNumber(orderNumber)) {
            randomSuffix = String.valueOf((int)(Math.random() * 1000));
            orderNumber = "ORD" + timestamp + String.format("%03d", Integer.parseInt(randomSuffix));
        }
        
        return orderNumber;
    }

    private void validateStatusTransition(Order.OrderStatus currentStatus, Order.OrderStatus newStatus) {
        boolean isValidTransition = false;
        
        switch (currentStatus) {
            case PENDING:
                isValidTransition = newStatus == Order.OrderStatus.PAID || 
                                  newStatus == Order.OrderStatus.CANCELLED;
                break;
            case PAID:
                isValidTransition = newStatus == Order.OrderStatus.SHIPPED || 
                                  newStatus == Order.OrderStatus.CANCELLED;
                break;
            case SHIPPED:
                isValidTransition = newStatus == Order.OrderStatus.DELIVERED;
                break;
            case DELIVERED:
            case CANCELLED:
                isValidTransition = false; // 终态不允许变更
                break;
        }
        
        if (!isValidTransition) {
            throw new IllegalArgumentException(
                String.format("不允许从 %s 状态转换为 %s 状态", 
                    currentStatus.getDescription(), newStatus.getDescription())
            );
        }
    }
}