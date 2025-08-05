package com.aicommerce.service;

import com.aicommerce.model.Product;
import com.aicommerce.model.Category;
import com.aicommerce.repository.ProductRepository;
import com.aicommerce.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * 商品服务类
 * 
 * 心理过程：
 * 1. 提供商品的增删改查功能
 * 2. 支持多种搜索和过滤条件
 * 3. 集成库存管理逻辑
 * 4. 为AI推荐提供数据支持
 */
@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Product createProduct(Product product) {
        if (product.getSku() != null && productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException("SKU已存在: " + product.getSku());
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Product product) {
        Product existingProduct = productRepository.findById(product.getId())
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));

        if (product.getSku() != null && !product.getSku().equals(existingProduct.getSku()) 
            && productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException("SKU已存在: " + product.getSku());
        }

        return productRepository.save(product);
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public Page<Product> findAllActiveProducts(Pageable pageable) {
        return productRepository.findByIsActiveTrue(pageable);
    }

    public Page<Product> findProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
    }

    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchProducts(keyword, pageable);
    }

    public Page<Product> findProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByPriceRange(minPrice, maxPrice, pageable);
    }

    public Page<Product> findProductsByBrand(String brand, Pageable pageable) {
        return productRepository.findByBrand(brand, pageable);
    }

    public Page<Product> findTopRatedProducts(Pageable pageable) {
        return productRepository.findTopRatedProducts(pageable);
    }

    public Page<Product> findInStockProducts(Pageable pageable) {
        return productRepository.findInStockProducts(pageable);
    }

    public List<Product> findLatestProducts() {
        return productRepository.findTop10ByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<String> getAllBrands() {
        return productRepository.findAllBrands();
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));
        product.setIsActive(false);
        productRepository.save(product);
    }

    public void updateStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));
        
        if (quantity < 0) {
            product.decreaseStock(-quantity);
        } else {
            product.increaseStock(quantity);
        }
        
        productRepository.save(product);
    }

    public boolean checkStock(Long productId, int requiredQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));
        return product.getStockQuantity() >= requiredQuantity;
    }

    public void updateRating(Long productId, BigDecimal newRating, int reviewCount) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("商品不存在"));
        
        product.setRating(newRating);
        product.setReviewCount(reviewCount);
        productRepository.save(product);
    }
}