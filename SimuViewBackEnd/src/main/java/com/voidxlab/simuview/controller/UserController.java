package com.voidxlab.simuview.controller;

import com.voidxlab.simuview.common.constants.JwtClaimsConstant;
import com.voidxlab.simuview.common.dto.UserLoginDTO;
import com.voidxlab.simuview.common.dto.UserRegisterDTO;
import com.voidxlab.simuview.common.entity.User;
import com.voidxlab.simuview.common.properties.JwtProperties;
import com.voidxlab.simuview.common.utils.JwtUtil;
import com.voidxlab.simuview.common.vo.Result;
import com.voidxlab.simuview.common.vo.UserLoginVO;
import com.voidxlab.simuview.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final JwtProperties jwtProperties;

    @PostMapping("/login")
    public Result<UserLoginVO> login(@RequestBody UserLoginDTO userLoginDTO){
        log.info("用户登录：{}", userLoginDTO);
        User user = userService.login(userLoginDTO);
        //登录成功后，生成jwt令牌
        Map<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.USER_ID, user.getUserId());
        String token = JwtUtil.createJWT(jwtProperties.getSecretKey(),
                jwtProperties.getExpiration(),
                claims);
        UserLoginVO userLoginVO = UserLoginVO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .token(token)
                .email(user.getEmail())
                .build();
        return Result.success(userLoginVO);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody UserRegisterDTO user){
        log.info("用户注册：{}", user);
        userService.register(user);
        return Result.success();
    }
}
