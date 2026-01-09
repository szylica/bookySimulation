package org.szylica.inzynierka.backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.security.jackson2.SecurityJackson2Modules;
import tools.jackson.databind.ObjectMapper;

@Configuration
public class RedisConfig {

    @Bean
    public ObjectMapper springSessionObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModules(org.springframework.security.jackson2.SecurityJackson2Modules.getModules(
                SessionRedisConfig.class.getClassLoader()
        ));
        mapper.findAndRegisterModules(); // np. JavaTimeModule itd.
        return mapper;
    }

    @Bean
    public RedisSerializer<Object> springSessionDefaultRedisSerializer(ObjectMapper springSessionObjectMapper) {
        return new org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer(springSessionObjectMapper);
    }
}