declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URI?: string
      DATABASE_URI_UNPOOLED?: string
      PAYLOAD_PUSH?: string
      NEXT_PUBLIC_SERVER_URL?: string
      VERCEL_PROJECT_PRODUCTION_URL?: string
      PREVIEW_SECRET?: string
      BLOB_READ_WRITE_TOKEN?: string
      RESEND_API_KEY?: string
      EMAIL_FROM?: string
      ANALYTICS_MODE?: 'fixtures' | 'live'
    }
  }
}

export {}
