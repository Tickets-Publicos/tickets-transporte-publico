import nextJest from 'next/jest.js'
import type { Config } from 'jest'

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './'
})

const config: Config = {
    // Use ts-jest ESM preset because project uses ESM config
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    testPathIgnorePatterns: ['/node_modules/', '/.next/', '/cypress/'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json', diagnostics: false, useESM: true }]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    },
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: '<rootDir>/reports',
                outputName: 'junit.xml'
            }
        ]
    ],
    collectCoverage: false
}

// next/jest returns a config object that can include internal types which
// leak into the module's exported type and cause `TS4082` during `tsc`.
// Cast to `unknown` first to avoid leaking private Next.js types to the
// TypeScript checker, then assert to `Config` so Jest still receives a
// correctly-typed config at runtime.
export default createJestConfig(config) as unknown as Config
