from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
 model_config = SettingsConfigDict(env_file=".env", extra="ignore")

 # App
 app_env: str = ""
 auto_seed: bool = True
 demo_seed: bool = False

 # Database
 database_url: str = "sqlite:///./drishti.db"

 # JWT
 jwt_secret: str = "change-me"
 jwt_access_minutes: int = 15
 jwt_refresh_days: int = 7

 # CORS
 cors_origins: str = "http://localhost:5173"

 # AI
 ai_provider: str = "nvidia"
 ai_model: str = ""
 ai_mock: bool = False
 ai_max_tokens: int = 2500
 ai_timeout_seconds: float = 45.0

 # Provider keys
 groq_api_key: str = ""
 nvidia_api_key: str = ""
 nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
 anthropic_api_key: str = ""

 # CVE
 nvd_api_key: str = ""
 vulners_key: str = ""

 # Deep scan
 deepscan_timeout_seconds: float = 120.0
 deepscan_cve_timeout_seconds: int = 12
 deepscan_max_hosts: int = 32
 deepscan_max_total_hosts: int = 256
 deepscan_discovery_timeout_seconds: int = 60
 deepscan_range_timeout_seconds: int = 300
 deepscan_rate_limit_seconds: float = 1.0
 deepscan_nvd_batch_size: int = 10
 deepscan_vulners_batch_size: int = 1000

 # URL trust
 urltrust_timeout_seconds: float = 10.0
 google_safe_browsing_key: str = ""
 virustotal_key: str = ""

 # Impact
 breach_cost_base: float = 500_000.0

 # Ingest
 ingest_max_bytes: int = 1_048_576

 # Telegram
 telegram_bot_token: str = ""
 telegram_chat_id: str = ""


settings = Settings()
