package com.infosys.springboard.authentication.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.ProductRequest;
import com.infosys.springboard.authentication.dto.ProductResponse;
import com.infosys.springboard.authentication.dto.StockResponse;
import com.infosys.springboard.authentication.entity.Product;
import com.infosys.springboard.authentication.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }


    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    public ProductResponse createProduct(
            ProductRequest request,
            String vendorEmail) {

        Product product = Product.builder()
                .name(request.getName())
                .category(request.getCategory())
                .brand(request.getBrand())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .imageUrl(request.getImageUrl())
                .vendorEmail(vendorEmail)
                .build();

        Product savedProduct =
                productRepository.save(product);

        return convertToResponse(savedProduct);
    }


    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET PRODUCTS OF A PARTICULAR VENDOR
    // =========================================================

    public List<ProductResponse> getVendorProducts(
            String vendorEmail) {

        return productRepository
                .findByVendorEmail(vendorEmail)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET PRODUCT BY ID
    // =========================================================

    public ProductResponse getProductById(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        return convertToResponse(product);
    }


    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    public ProductResponse updateProduct(
            Long id,
            ProductRequest request,
            String vendorEmail) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        // -----------------------------------------------------
        // CHECK PRODUCT OWNER
        // -----------------------------------------------------

        if (!product.getVendorEmail()
                .equals(vendorEmail)) {

            throw new RuntimeException(
                    "You are not allowed to update this product"
            );
        }

        // -----------------------------------------------------
        // UPDATE PRODUCT DATA
        // -----------------------------------------------------

        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setImageUrl(request.getImageUrl());

        Product updatedProduct =
                productRepository.save(product);

        return convertToResponse(updatedProduct);
    }


    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    public void deleteProduct(
            Long id,
            String vendorEmail) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        // -----------------------------------------------------
        // CHECK PRODUCT OWNER
        // -----------------------------------------------------

        if (!product.getVendorEmail()
                .equals(vendorEmail)) {

            throw new RuntimeException(
                    "You are not allowed to delete this product"
            );
        }

        productRepository.delete(product);
    }


    // =========================================================
    // SEARCH PRODUCTS BY NAME
    // =========================================================

    public List<ProductResponse> searchProducts(
            String name) {

        return productRepository
                .findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // SEARCH PRODUCTS BY CATEGORY
    // =========================================================

    public List<ProductResponse> searchByCategory(
            String category) {

        return productRepository
                .findByCategoryContainingIgnoreCase(category)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET CURRENT STOCK
    // =========================================================

    public StockResponse getCurrentStock(
            Long id,
            String vendorEmail) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        // -----------------------------------------------------
        // CHECK PRODUCT OWNER
        // -----------------------------------------------------

        if (!product.getVendorEmail()
                .equals(vendorEmail)) {

            throw new RuntimeException(
                    "You are not allowed to view this product stock"
            );
        }

        // -----------------------------------------------------
        // DETERMINE STOCK STATUS
        // -----------------------------------------------------

        String status;

        if (product.getQuantity() == null
                || product.getQuantity() == 0) {

            status = "OUT OF STOCK";

        } else {

            status = "IN STOCK";
        }

        // -----------------------------------------------------
        // RETURN STOCK INFORMATION
        // -----------------------------------------------------

        return new StockResponse(
                product.getId(),
                product.getName(),
                product.getQuantity(),
                status
        );
    }


    // =========================================================
    // CONVERT ENTITY → RESPONSE DTO
    // =========================================================

    private ProductResponse convertToResponse(
            Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getCategory(),
                product.getBrand(),
                product.getDescription(),
                product.getPrice(),
                product.getQuantity(),
                product.getImageUrl(),
                product.getVendorEmail()
        );
    }
}