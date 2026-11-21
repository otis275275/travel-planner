package com.travelplanning.backend.services.user;

import com.travelplanning.backend.entities.OauthAccount;
import com.travelplanning.backend.entities.User;
import com.travelplanning.backend.enums.OauthProvider;
import com.travelplanning.backend.repositories.OauthAccountRepository;
import com.travelplanning.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OAuthAccountService {

    private final UserRepository userRepository;
    private final OauthAccountRepository oauthAccountRepository;

    @Transactional
    public User findOrCreateOAuthUser(String email, String name, String pictureUrl, OauthProvider provider, String providerUserId) {
        Optional<OauthAccount> oauthOpt = oauthAccountRepository
                .findByProviderAndProviderUserId(provider, providerUserId);
        if (oauthOpt.isPresent()) {
            return oauthOpt.get().getUser();
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            user = User.builder()
                    .email(email)
                    .fullName(name != null ? name : "Anonymous")
                    .avatarUrl(pictureUrl)
                    .passwordHash(null)
                    .build();
            user = userRepository.save(user);
        }

        OauthAccount oauthAccount = OauthAccount.builder()
                .user(user)
                .provider(provider)
                .providerUserId(providerUserId)
                .build();
        oauthAccountRepository.save(oauthAccount);

        return user;
    }
}
