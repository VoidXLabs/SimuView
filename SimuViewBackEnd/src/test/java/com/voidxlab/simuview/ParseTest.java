package com.voidxlab.simuview;

import com.voidxlab.simuview.common.utils.DocumentParser;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.InputStream;

@SpringBootTest
public class ParseTest {

    @Test
    public void parseTest(){
        InputStream file = this.getClass().getClassLoader().getResourceAsStream("resume.pdf");
        String s = DocumentParser.extractText(file);
        System.out.println(s);
    }
}
