package com.voidxlab.simuview;

import com.voidxlab.simuview.common.util.DocumentParser;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
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
