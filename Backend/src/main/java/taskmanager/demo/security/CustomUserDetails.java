package taskmanager.demo.security;

import taskmanager.demo.user.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public Long getId() {
        return user.getId();
    }

    public String getName() {
        return user.getName();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority(user.getRole().name())
        );
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}


// UserRepository = Find user in DB.
// CustomUserDetailsService = Give that DB user to Spring Security.
// CustomUserDetails = Convert that user into Spring Security's required format.


// File	                        Main responsibility
// CustomUserDetails	        Converts your User into Spring Security's format
// CustomUserDetailsService	    Finds the user from the database
// JwtService	                Creates, extracts and validates JWT
// JwtFilter	                Checks JWT on incoming requests
// SecurityConfig	            Configures the entire Spring Security system


// 1. AuthController
// Main use:
// Receives HTTP requests related to authentication.

// 2. AuthResponse
// Main use:
// Defines what the backend sends back after successful authentication.

// 3. AuthService
// Main use:
// Contains the actual authentication business logic.

// 4. LoginRequest
// Main use:
// Carries the login data from the client to the backend.

// 5. RegisterRequest
// Main use:
// Carries registration data from the client to the backend.