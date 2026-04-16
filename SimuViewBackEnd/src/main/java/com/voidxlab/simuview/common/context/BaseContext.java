package com.voidxlab.simuview.common.context;

public class BaseContext {

    private static final ThreadLocal<Long> userId = new ThreadLocal<>();

    private BaseContext() {
    }

    public static void setUserId(Long id) {
        userId.set(id);
    }

    public static Long getUserId() {
        return userId.get();
    }

    public static void removeUserId() {
        userId.remove();
    }
}