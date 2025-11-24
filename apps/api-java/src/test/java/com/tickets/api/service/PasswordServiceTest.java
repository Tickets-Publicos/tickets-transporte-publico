package com.tickets.api.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordServiceTest {

    private PasswordService passwordService;

    @BeforeEach
    void setUp() {
        passwordService = new PasswordService();
    }

    @Test
    void testGenerateSalt() {
        String salt1 = passwordService.generateSalt();
        String salt2 = passwordService.generateSalt();

        assertNotNull(salt1);
        assertNotNull(salt2);
        assertNotEquals(salt1, salt2, "Each salt should be unique");
        assertTrue(salt1.length() > 0, "Salt should not be empty");
    }

    @Test
    void testHashPassword() {
        String password = "mySecurePassword123";
        String salt = passwordService.generateSalt();

        String hash = passwordService.hashPassword(password, salt);

        assertNotNull(hash);
        assertTrue(hash.length() > 0, "Hash should not be empty");
        assertNotEquals(password, hash, "Hash should not be the same as the password");
    }

    @Test
    void testVerifyPasswordCorrect() {
        String password = "mySecurePassword123";
        String salt = passwordService.generateSalt();
        String hash = passwordService.hashPassword(password, salt);

        boolean isValid = passwordService.verifyPassword(password, salt, hash);

        assertTrue(isValid, "Password should be verified successfully");
    }

    @Test
    void testVerifyPasswordIncorrect() {
        String password = "mySecurePassword123";
        String wrongPassword = "wrongPassword";
        String salt = passwordService.generateSalt();
        String hash = passwordService.hashPassword(password, salt);

        boolean isValid = passwordService.verifyPassword(wrongPassword, salt, hash);

        assertFalse(isValid, "Wrong password should not be verified");
    }

    @Test
    void testSameSaltDifferentPasswords() {
        String password1 = "password1";
        String password2 = "password2";
        String salt = passwordService.generateSalt();

        String hash1 = passwordService.hashPassword(password1, salt);
        String hash2 = passwordService.hashPassword(password2, salt);

        assertNotEquals(hash1, hash2, "Different passwords should have different hashes");
    }

    @Test
    void testDifferentSaltsSamePassword() {
        String password = "mySecurePassword123";
        String salt1 = passwordService.generateSalt();
        String salt2 = passwordService.generateSalt();

        String hash1 = passwordService.hashPassword(password, salt1);
        String hash2 = passwordService.hashPassword(password, salt2);

        assertNotEquals(hash1, hash2, "Same password with different salts should have different hashes");
    }
}
