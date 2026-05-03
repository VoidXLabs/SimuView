package com.voidxlab.simuview.service;

import com.voidxlab.simuview.common.entity.JDInformation;
import com.voidxlab.simuview.mapper.JDInformationMapper;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class JDInformationService {
    private final JDInformationMapper JDInformationMapper;
    public void save(JDInformation jdInformation) {
        log.info("保存职位信息: {}", jdInformation);
        JDInformationMapper.insert(jdInformation);
    }
}
