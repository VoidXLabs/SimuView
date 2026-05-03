package com.voidxlab.simuview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.voidxlab.simuview.common.dto.UserLoginDTO;
import com.voidxlab.simuview.common.dto.UserRegisterDTO;
import com.voidxlab.simuview.common.entity.User;
import com.voidxlab.simuview.common.exception.BusinessException;
import com.voidxlab.simuview.common.exception.ErrorCode;
import com.voidxlab.simuview.mapper.UserMapper;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;


@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    public User login(UserLoginDTO userLoginDTO) {
        String username = userLoginDTO.getUsername();
        String password = userLoginDTO.getPassword();
        //1、根据用户名查询数据库中的数据
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", username));

        //2、处理各种异常情况（用户名不存在、密码不对、账号被锁定）
        if (user == null) {
            //账号不存在
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }

        //密码比对
        // 对前端传来的明文密码加密
        password = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!password.equals(user.getPasswordHash())) {
            //密码错误
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "用户名或密码错误");
        }

        //3、返回实体对象
        return user;
    }

    public void register(UserRegisterDTO user) {
        String username = user.getUsername();
        String password = user.getPassword();
        User duplicateUser =  userMapper.selectOne(new QueryWrapper<User>().eq("username",username));
        if(duplicateUser != null){
            throw new BusinessException("账户重复");
        }
        User newUser = User.builder()
                .username(user.getUsername())
                .passwordHash(DigestUtils.md5DigestAsHex(password.getBytes()))
                .role("candidate")
                .name(user.getName())
                .build();
        userMapper.insert(newUser);
    }
}
