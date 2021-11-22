import {Config} from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  "setupFilesAfterEnv": [
    "<rootDir>/tests/setup.ts"
  ]
}

export default config ;
