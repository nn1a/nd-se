from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

class Database:
    client: AsyncIOMotorClient = None
    database = None

    async def connect(self):
        """데이터베이스 연결"""
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.database = self.client[settings.DATABASE_NAME]
        print(f"Connected to MongoDB: {settings.DATABASE_NAME}")

    async def disconnect(self):
        """데이터베이스 연결 해제"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")

    def get_collection(self, collection_name: str):
        """컬렉션 반환"""
        return self.database[collection_name]

database = Database()
