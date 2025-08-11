from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API 설정
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "ND-SE API"
    
    # JWT 설정
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # 데이터베이스 설정
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "nd_se_db"
    
    # 문서 설정
    DOCS_PATH: str = "../docs"
    
    # 환경 설정
    ENVIRONMENT: str = "development"
    
    # CORS 설정
    ALLOWED_HOSTS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Revalidation 설정
    FRONTEND_URL: str = "http://localhost:3000"
    REVALIDATION_SECRET: str = "your-secret-key"
    
    # OIDC/SSO 설정
    OIDC_ENABLED: bool = False
    OIDC_CLIENT_ID: str = ""
    OIDC_CLIENT_SECRET: str = ""
    OIDC_DISCOVERY_URL: str = ""
    OIDC_REDIRECT_URI: str = "http://localhost:8000/api/auth/oidc/callback"
    OIDC_SCOPES: str = "openid profile email"
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # 추가적인 환경 변수 무시

settings = Settings()
