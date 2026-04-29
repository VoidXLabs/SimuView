package com.voidxlab.simuview.common.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "simuview.jwt")
@Data
public class JwtProperties {
    private String secretKey;
    private long expiration;
    private String tokenName;
}
