import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def load_test_documents():
    """Load test documents from docs-testdata directory into MongoDB"""
    
    # MongoDB connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "nd_se_db")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    docs_collection = db.docs
    nav_collection = db.navigation
    
    try:
        # Clear existing test data
        print("🧹 Clearing existing documents...")
        await docs_collection.delete_many({})
        await nav_collection.delete_many({})
        
        # Base path for test documents
        current_dir = Path(__file__).parent.parent
        base_path = current_dir / "docs-testdata"
        
        # Document list to store all documents
        documents = []
        navigation_structure = []
        
        # Helper function to create slug from file path
        def create_slug(file_path: Path, base_path: Path) -> str:
            relative_path = file_path.relative_to(base_path)
            # Remove file extension and convert to slug
            slug_parts = []
            for part in relative_path.parts[:-1]:  # Exclude filename
                slug_parts.append(part)
            # Add filename without extension
            filename = relative_path.stem
            if filename != "index":  # Don't include index in slug
                slug_parts.append(filename)
            return "/".join(slug_parts) if slug_parts else relative_path.stem

        def extract_title_from_content(content: str) -> str:
            """Extract title from markdown content (first H1)"""
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('# '):
                    return line[2:].strip()
            return "Untitled"

        # Process all markdown and mdx files
        file_patterns = ["**/*.md", "**/*.mdx"]
        all_files = []
        
        for pattern in file_patterns:
            files = list(base_path.glob(pattern))
            all_files.extend(files)
        
        # Sort files for consistent ordering
        all_files.sort()
        
        order_counter = 1
        
        print(f"📁 Processing {len(all_files)} files...")
        
        for file_path in all_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                slug = create_slug(file_path, base_path)
                title = extract_title_from_content(content)
                
                # Determine if file is MDX
                is_mdx = file_path.suffix == '.mdx'
                
                document = {
                    "slug": slug,
                    "title": title,
                    "content": content,
                    "order": order_counter,
                    "tags": ["test", "documentation"] + (["mdx", "interactive"] if is_mdx else ["markdown"]),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "created_by": "system",
                    "updated_by": "system"
                }
                
                documents.append(document)
                order_counter += 1
                
                print(f"  ✅ {slug} - {title}")
                
            except (FileNotFoundError, UnicodeDecodeError, PermissionError) as e:
                print(f"  ❌ Error processing {file_path}: {e}")
        
        # Insert all documents
        if documents:
            result = await docs_collection.insert_many(documents)
            print(f"📄 Inserted {len(result.inserted_ids)} documents")
        
        # Create navigation structure
        navigation_structure = [
            {
                "slug": "introduction",
                "title": "Introduction",
                "order": 1,
                "children": []
            },
            {
                "slug": "getting-started",
                "title": "Getting Started",
                "order": 2,
                "children": [
                    {
                        "slug": "getting-started/installation",
                        "title": "Installation",
                        "order": 1,
                        "children": []
                    },
                    {
                        "slug": "getting-started/quick-start",
                        "title": "Quick Start",
                        "order": 2,
                        "children": []
                    }
                ]
            },
            {
                "slug": "guides",
                "title": "Guides",
                "order": 3,
                "children": [
                    {
                        "slug": "guides/frontend",
                        "title": "Frontend",
                        "order": 1,
                        "children": [
                            {
                                "slug": "guides/frontend/overview",
                                "title": "Overview",
                                "order": 1,
                                "children": []
                            }
                        ]
                    },
                    {
                        "slug": "guides/backend",
                        "title": "Backend",
                        "order": 2,
                        "children": [
                            {
                                "slug": "guides/backend/overview",
                                "title": "Overview",
                                "order": 1,
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "api",
                "title": "API Reference",
                "order": 4,
                "children": [
                    {
                        "slug": "api/overview",
                        "title": "Overview",
                        "order": 1,
                        "children": []
                    }
                ]
            },
            {
                "slug": "examples",
                "title": "Examples",
                "order": 5,
                "children": [
                    {
                        "slug": "examples/interactive",
                        "title": "Interactive Examples",
                        "order": 1,
                        "children": []
                    }
                ]
            }
        ]
        
        # Insert navigation structure
        navigation_doc = {
            "navigation": navigation_structure,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await nav_collection.insert_one(navigation_doc)
        print(f"🧭 Created navigation structure with {len(navigation_structure)} top-level items")
        
        # Create indexes for better performance
        print("📊 Creating database indexes...")
        
        # Document indexes
        await docs_collection.create_index("slug", unique=True)
        await docs_collection.create_index([("title", "text"), ("content", "text")])
        await docs_collection.create_index([("order", 1), ("created_at", -1)])
        await docs_collection.create_index("tags")
        
        print("✅ Database indexes created")
        
        # Summary
        print("\n📈 Import Summary:")
        print(f"  • Documents imported: {len(documents)}")
        print(f"  • Navigation items: {len(navigation_structure)}")
        
        # Show document breakdown
        markdown_count = len([d for d in documents if 'mdx' not in d.get('tags', [])])
        mdx_count = len(documents) - markdown_count
        
        print(f"  • Markdown files: {markdown_count}")
        print(f"  • MDX files: {mdx_count}")
        
        print("\n🎉 Test data loading completed successfully!")
        
        # Print some example URLs
        print("\n🌐 Example URLs to test:")
        print("  • Introduction: http://localhost:3001/docs/introduction")
        print("  • Installation: http://localhost:3001/docs/getting-started/installation")
        print("  • Frontend Guide: http://localhost:3001/docs/guides/frontend/overview")
        print("  • Backend Guide: http://localhost:3001/docs/guides/backend/overview")
        print("  • Interactive Examples: http://localhost:3001/docs/examples/interactive")
        print("  • API Reference: http://localhost:3001/docs/api/overview")
        
    except Exception as e:
        print(f"❌ Error loading test documents: {e}")
        raise
    
    finally:
        client.close()

def get_file_tree():
    """Print the file tree structure"""
    current_dir = Path(__file__).parent.parent
    base_path = current_dir / "docs-testdata"
    
    print("📂 Test Data File Structure:")
    print("docs-testdata/")
    
    def print_tree(path: Path, prefix: str = ""):
        items = sorted(path.iterdir())
        for i, item in enumerate(items):
            is_last = i == len(items) - 1
            current_prefix = "└── " if is_last else "├── "
            print(f"{prefix}{current_prefix}{item.name}")
            
            if item.is_dir():
                extension_prefix = "    " if is_last else "│   "
                print_tree(item, prefix + extension_prefix)
    
    if base_path.exists():
        print_tree(base_path)
    else:
        print("❌ Test data directory not found!")

if __name__ == "__main__":
    print("🚀 Starting test data loading process...\n")
    
    # Show file structure
    get_file_tree()
    print()
    
    # Load the documents
    asyncio.run(load_test_documents())
