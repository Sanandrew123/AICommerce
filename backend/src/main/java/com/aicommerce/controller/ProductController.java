package com.aicommerce.controller;

import com.aicommerce.model.Product;
import com.aicommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 商品控制器
 * 
 * 心理过程：
 * 1. 提供RESTful API接口
 * 2. 支持分页、排序、搜索等功能
 * 3. 区分公开接口和管理员接口
 * 4. 返回统一的响应格式
 */
@RestController
@RequestMapping("/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String brand) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Product> products;

        if (keyword != null && !keyword.trim().isEmpty()) {
            products = productService.searchProducts(keyword.trim(), pageable);
        } else if (categoryId != null) {
            products = productService.findProductsByCategory(categoryId, pageable);
        } else if (minPrice != null && maxPrice != null) {
            products = productService.findProductsByPriceRange(minPrice, maxPrice, pageable);
        } else if (brand != null && !brand.trim().isEmpty()) {
            products = productService.findProductsByBrand(brand.trim(), pageable);
        } else {
            products = productService.findAllActiveProducts(pageable);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("content", products.getContent());
        response.put("page", products.getNumber());
        response.put("size", products.getSize());
        response.put("totalElements", products.getTotalElements());
        response.put("totalPages", products.getTotalPages());
        response.put("first", products.isFirst());
        response.put("last", products.isLast());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.findById(id);
        
        if (product.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("product", product.get());
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "商品不存在");
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestProducts() {
        List<Product> products = productService.findLatestProducts();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("products", products);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRatedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.findTopRatedProducts(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("content", products.getContent());
        response.put("page", products.getNumber());
        response.put("size", products.getSize());
        response.put("totalElements", products.getTotalElements());
        response.put("totalPages", products.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/in-stock")
    public ResponseEntity<?> getInStockProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.findInStockProducts(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("content", products.getContent());
        response.put("page", products.getNumber());
        response.put("size", products.getSize());
        response.put("totalElements", products.getTotalElements());
        response.put("totalPages", products.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/brands")
    public ResponseEntity<?> getAllBrands() {
        List<String> brands = productService.getAllBrands();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("brands", brands);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            Product createdProduct = productService.createProduct(product);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "商品创建成功");
            response.put("product", createdProduct);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            product.setId(id);
            Product updatedProduct = productService.updateProduct(product);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "商品更新成功");
            response.put("product", updatedProduct);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "商品删除成功");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody StockUpdateRequest request) {
        try {
            productService.updateStock(id, request.getQuantity());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "库存更新成功");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{id}/stock")
    public ResponseEntity<?> checkStock(@PathVariable Long id, @RequestParam int quantity) {
        try {
            boolean inStock = productService.checkStock(id, quantity);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("inStock", inStock);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 请求DTO
    public static class StockUpdateRequest {
        private int quantity;

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}