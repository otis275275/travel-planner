package com.travelplanning.backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class OAuthAccountException extends RuntimeException {

    public OAuthAccountException(String message) {
        super(message);
    }
}
