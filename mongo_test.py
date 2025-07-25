import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Replace this with your full SRV string including database name
MONGO_URL = "mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority"

async def test_connection():
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client.get_default_database()  # or client['your_db_name']
        result = await db.command("ping")
        print("✅ MongoDB connection successful:", result)
    except Exception as e:
        print("❌ MongoDB connection failed:", e)

asyncio.run(test_connection())
