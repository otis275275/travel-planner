package com.travelplanning.backend.services.user;

import com.travelplanning.backend.dtos.auth.LoginRequest;
import com.travelplanning.backend.dtos.auth.SignupRequest;
import com.travelplanning.backend.dtos.auth.UserResponse;
import com.travelplanning.backend.entities.User;
import com.travelplanning.backend.exceptions.EmailAlreadyExistsException;
import com.travelplanning.backend.exceptions.InvalidCredentialsException;
import com.travelplanning.backend.exceptions.OAuthAccountException;
import com.travelplanning.backend.exceptions.ResourceNotFoundException;
import com.travelplanning.backend.mappers.UserMapper;
import com.travelplanning.backend.repositories.UserRepository;
import com.travelplanning.backend.security.CustomUserDetails;
import com.travelplanning.backend.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    @Transactional
    public AuthResult signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        User user = userMapper.toUser(request);
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail());

        return new AuthResult(userMapper.toUserResponse(savedUser), token);
    }

    public AuthResult login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                     )
            );
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (user.getPasswordHash() == null) {
            throw new OAuthAccountException("Account was created via OAuth. Please sign in with Google.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResult(userMapper.toUserResponse(user), token);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return userMapper.toUserResponse(user);
    }

    public record AuthResult(UserResponse userResponse, String token) {}
}
