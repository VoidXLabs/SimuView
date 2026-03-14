package com.voidxlab.simuview.dto;

public class WsResponse {
    private String status;  // processing, success, error
    private String message;
    private Integer type;   // 1: JD, 2: Resume
    private Object data;

    // 构造函数、Getter 和 Setter
    public WsResponse(String status, String message, Integer type, Object data) {
        this.status = status;
        this.message = message;
        this.type = type;
        this.data = data;
    }

    // 省略 getter/setter，建议使用 @Data (Lombok)
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Integer getType() { return type; }
    public void setType(Integer type) { this.type = type; }
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
}
