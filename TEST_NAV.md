d /Users/nn/nd-se/backend && source venv/bin/activate && python -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_data():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.nd_se
    
    # Check documents
    docs = await db.docs.find({}).to_list(None)
    print(f'Documents in database: {len(docs)}')
    for doc in docs:
        print(f'  - {doc[\"slug\"]}: {doc[\"title\"]}')
    
    # Check navigation
    nav = await db.navigation.find_one({})
    if nav and 'navigation' in nav:
        print(f'Navigation items: {len(nav[\"navigation\"])}')
        for item in nav['navigation']:
            print(f'  - {item[\"slug\"]}: {item[\"title\"]}')
    
    client.close()

asyncio.run(check_data())
"