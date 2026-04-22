declare namespace NodeJS {
  interface ProcessEnv {
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    DATABASE_FILEPATH: string;
    ADMIN_PASSWORD: string;
    DATABASE_URL: string;
    WORK_PLATFORM: 'server' | 'client';
    NODE_ENV: 'dev' | 'production';
  }
}

