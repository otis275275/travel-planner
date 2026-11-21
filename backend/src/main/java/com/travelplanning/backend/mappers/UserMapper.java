package com.travelplanning.backend.mappers;

import com.travelplanning.backend.dtos.auth.SignupRequest;
import com.travelplanning.backend.dtos.auth.UserResponse;
import com.travelplanning.backend.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toUserResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    User toUser(SignupRequest request);
}
