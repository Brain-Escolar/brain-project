package br.com.brain.utils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public class Utils {
    public static LocalDateTime converterTimestampParaLocalDateTime(Long timestamp) {
        return LocalDateTime.ofInstant(
            Instant.ofEpochMilli(timestamp),
            ZoneId.systemDefault()
        );
    }
}
