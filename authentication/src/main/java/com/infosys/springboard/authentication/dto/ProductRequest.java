package com.infosys.springboard.authentication.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequest {

    // ==========================================
    // PRODUCT NAME
    // ==========================================

    @NotBlank(message = "Product name is required")
    private String name;


    // ==========================================
    // PRODUCT CATEGORY
    // ==========================================

    @NotBlank(message = "Product category is required")
    private String category;


    // ==========================================
    // PRODUCT BRAND
    // ==========================================

    @NotBlank(message = "Product brand is required")
    private String brand;


    // ==========================================
    // PRODUCT DESCRIPTION
    // ==========================================

    @NotBlank(message = "Product description is required")
    private String description;


    // ==========================================
    // PRODUCT PRICE
    // ==========================================

    @NotNull(message = "Product price is required")
    @DecimalMin(
            value = "0.01",
            message = "Product price must be greater than 0"
    )
    private BigDecimal price;


    // ==========================================
    // STOCK QUANTITY
    // ==========================================

    @NotNull(message = "Product quantity is required")
    @Min(
            value = 0,
            message = "Product quantity cannot be negative"
    )
    private Integer quantity;


    // ==========================================
    // PRODUCT IMAGE
    // ==========================================

    private String imageUrl;
}