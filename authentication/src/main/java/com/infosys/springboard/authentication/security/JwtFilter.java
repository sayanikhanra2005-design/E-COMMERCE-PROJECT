package com.infosys.springboard.authentication.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.infosys.springboard.authentication.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        System.out.println("=================================");
        System.out.println("JWT FILTER");
        System.out.println("Request Method: " + request.getMethod());
        System.out.println("Request URI: " + request.getRequestURI());

        // =====================================================
        // 1. PUBLIC AUTHENTICATION ENDPOINTS
        // =====================================================

       if (path.equals("/auth/register")
        || path.equals("/auth/login")
        || path.equals("/auth/forgot-password")
        || path.equals("/auth/reset-password")) {

            System.out.println(
                    "Public authentication endpoint - skipping JWT");

            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // 2. GET AUTHORIZATION HEADER
        // =====================================================

        String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "Authorization Header: " + authHeader);

        // =====================================================
        // 3. NO JWT TOKEN
        // =====================================================

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "No JWT token found - continuing");

            filterChain.doFilter(request, response);
            return;
        }

        // =====================================================
        // 4. EXTRACT TOKEN
        // =====================================================

        String token = authHeader.substring(7);

        try {

            // =================================================
            // 5. VALIDATE TOKEN
            // =================================================

            if (!jwtService.validateToken(token)) {

                System.out.println(
                        "JWT token is invalid");

                filterChain.doFilter(request, response);
                return;
            }

            // =================================================
            // 6. EXTRACT EMAIL
            // =================================================

            String email =
                    jwtService.extractEmail(token);

            System.out.println(
                    "JWT Email: " + email);

            // =================================================
            // 7. EXTRACT ROLE FROM JWT
            // =================================================

            String jwtRole =
                    jwtService.extractRole(token);

            System.out.println(
                    "JWT Role: " + jwtRole);

            // =================================================
            // 8. CHECK SECURITY CONTEXT
            // =================================================

            if (email != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                // =============================================
                // 9. FIND USER IN DATABASE
                // =============================================

                var user =
                        userRepository
                                .findByEmail(email)
                                .orElse(null);

                if (user == null) {

                    System.out.println(
                            "User not found in database");

                    filterChain.doFilter(request, response);
                    return;
                }

                System.out.println(
                        "User found: " + user.getEmail());

                System.out.println(
                        "Database role: " + user.getRole());

                // =============================================
                // 10. CHECK JWT ROLE
                // =============================================

                if (jwtRole == null
                        || !jwtRole.equals(user.getRole())) {

                    System.out.println(
                            "JWT role does not match database role");

                    filterChain.doFilter(request, response);
                    return;
                }

                // =============================================
                // 11. CREATE USER DETAILS
                // =============================================

                UserDetails userDetails =
                        org.springframework.security.core.userdetails.User
                                .withUsername(user.getEmail())
                                .password(user.getPassword())
                                .roles(user.getRole())
                                .build();

                // =============================================
                // 12. CREATE AUTHENTICATION
                // =============================================

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // =============================================
                // 13. SAVE AUTHENTICATION
                // =============================================

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "JWT authentication successful");

                System.out.println(
                        "Authorities: "
                                + userDetails.getAuthorities());
            }

        } catch (Exception e) {

            System.out.println(
                    "Invalid JWT: " + e.getMessage());
        }

        // =====================================================
        // 14. CONTINUE FILTER CHAIN
        // =====================================================

        filterChain.doFilter(request, response);
    }
}