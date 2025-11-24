package com.tickets.api.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Serviço para hash de senhas usando BCrypt com salt aleatório
 */
@Service
public class PasswordService {

    private static final int BCRYPT_STRENGTH = 12;
    private final BCryptPasswordEncoder encoder;
    private final SecureRandom secureRandom;

    public PasswordService() {
        this.encoder = new BCryptPasswordEncoder(BCRYPT_STRENGTH);
        this.secureRandom = new SecureRandom();
    }

    /**
     * Gera um salt aleatório
     * @return salt em Base64
     */
    public String generateSalt() {
        byte[] salt = new byte[16];
        secureRandom.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    /**
     * Gera o hash da senha usando BCrypt com o salt fornecido
     * @param password senha em texto plano
     * @param salt salt gerado
     * @return hash da senha
     */
    public String hashPassword(String password, String salt) {
        // Combina a senha com o salt antes de fazer o hash
        String saltedPassword = password + salt;
        return encoder.encode(saltedPassword);
    }

    /**
     * Verifica se a senha fornecida corresponde ao hash armazenado
     * @param password senha em texto plano
     * @param salt salt do usuário
     * @param passwordHash hash armazenado
     * @return true se a senha estiver correta
     */
    public boolean verifyPassword(String password, String salt, String passwordHash) {
        String saltedPassword = password + salt;
        return encoder.matches(saltedPassword, passwordHash);
    }
}
