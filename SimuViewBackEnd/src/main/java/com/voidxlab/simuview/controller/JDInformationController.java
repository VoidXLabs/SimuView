package com.voidxlab.simuview.controller;

import com.voidxlab.simuview.common.entity.JDInformation;
import com.voidxlab.simuview.common.vo.Result;
import com.voidxlab.simuview.service.JDInformationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/jd-information")
@RequiredArgsConstructor
public class JDInformationController {
    private final JDInformationService jdInformationService;

    @PostMapping
    public Result<Long> save(@RequestBody JDInformation jdInformation){
        log.info("保存职位信息: {}", jdInformation);
        jdInformationService.save(jdInformation);
        return Result.success(jdInformation.getJdId());
    }
}
