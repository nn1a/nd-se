import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def load_forum_test_data(posts_collection, replies_collection):
    """Load forum test data into MongoDB"""
    
    print("📝 Loading forum test data...")
    
    # Forum test posts
    forum_posts = [
        {
            "_id": "1",
            "title": "FastAPI와 MongoDB 연동 방법",
            "content": """# FastAPI와 MongoDB 연동 방법

안녕하세요, FastAPI 프로젝트에서 MongoDB를 연동하려고 하는데 어떤 방법이 가장 좋은지 조언 부탁드립니다.

## 현재 고려 중인 옵션들

1. **Motor** - 비동기 MongoDB 드라이버
2. **PyMongo** - 동기 MongoDB 드라이버  
3. **ODM 라이브러리** (Beanie, MongoEngine 등)

각각의 장단점과 FastAPI와의 호환성에 대해 알고 싶습니다.

감사합니다!""",
            "author": "개발자A",
            "author_id": "user1",
            "created_at": "2024-01-15T10:00:00Z",
            "replies_count": 2,
            "views": 123,
            "likes": 15,
            "dislikes": 2,
            "tags": ["FastAPI", "MongoDB", "Python"],
            "category": "질문",
            "status": "active",
            "is_pinned": False,
            "is_locked": False,
            "is_draft": False,
            "is_private": False
        },
        {
            "_id": "2", 
            "title": "Next.js SSR vs SSG 선택 기준",
            "content": """# Next.js SSR vs SSG 선택 기준

프로젝트에서 SSR과 SSG 중 어떤 것을 선택해야 할지 고민이 많습니다.

## 프로젝트 요구사항
- 실시간 데이터가 중요한 대시보드
- SEO 최적화 필요
- 사용자 개인화 콘텐츠

어떤 렌더링 방식을 선택하는 것이 좋을까요?""",
            "author": "프론트개발자", 
            "author_id": "user2",
            "created_at": "2024-01-14T15:30:00Z",
            "replies_count": 1,
            "views": 234,
            "likes": 23,
            "dislikes": 1,
            "tags": ["Next.js", "SSR", "SSG"],
            "category": "토론",
            "status": "active", 
            "is_pinned": True,
            "is_locked": False,
            "is_draft": False,
            "is_private": False
        },
        {
            "_id": "3",
            "title": "TailwindCSS 커스텀 컴포넌트 만들기",
            "content": """# TailwindCSS 커스텀 컴포넌트 만들기

TailwindCSS로 재사용 가능한 컴포넌트를 만드는 베스트 프랙티스를 공유합니다.

## 기본 원칙
1. 유틸리티 클래스 조합
2. CSS-in-JS 최소화
3. 디자인 시스템 일관성

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600;
  }
}
```

이런 식으로 작성하시는 것을 추천합니다!""",
            "author": "UI개발자",
            "author_id": "user3", 
            "created_at": "2024-01-13T09:15:00Z",
            "replies_count": 0,
            "views": 156,
            "likes": 8,
            "dislikes": 0,
            "tags": ["TailwindCSS", "Component", "CSS"],
            "category": "팁",
            "status": "active",
            "is_pinned": False,
            "is_locked": False,
            "is_draft": False,
            "is_private": False
        }
    ]
    
    # Forum replies  
    forum_replies = [
        {
            "_id": "reply1",
            "post_id": "1",
            "content": "Motor를 추천합니다. FastAPI와 비동기 처리가 잘 맞습니다. 제가 실제로 프로젝트에서 사용해봤는데 성능도 우수하고 사용법도 간단합니다.",
            "author": "베테랑개발자",
            "author_id": "user4",
            "created_at": "2024-01-15T11:30:00Z",
            "likes": 8,
            "dislikes": 0,
            "status": "active",
            "parent_id": None
        },
        {
            "_id": "reply2", 
            "post_id": "1",
            "content": "Beanie ODM도 좋은 선택입니다. Pydantic 모델과 직접 연동되어서 타입 안정성이 좋습니다. 다만 학습 곡선이 조금 있어요.",
            "author": "전문가",
            "author_id": "user5", 
            "created_at": "2024-01-15T14:20:00Z",
            "likes": 5,
            "dislikes": 1,
            "status": "active",
            "parent_id": "reply1"
        },
        {
            "_id": "reply3",
            "post_id": "2", 
            "content": "실시간 데이터가 중요하다면 SSR을 선택하는 것이 맞습니다. 개인화 콘텐츠도 SSR에서 더 효과적으로 처리할 수 있어요.",
            "author": "Next.js전문가",
            "author_id": "user6",
            "created_at": "2024-01-14T16:45:00Z", 
            "likes": 12,
            "dislikes": 0,
            "status": "active",
            "parent_id": None
        }
    ]
    
    # Insert forum posts
    if forum_posts:
        await posts_collection.insert_many(forum_posts)
        print(f"📄 Inserted {len(forum_posts)} forum posts")
    
    # Insert forum replies
    if forum_replies:
        await replies_collection.insert_many(forum_replies)
        print(f"💬 Inserted {len(forum_replies)} forum replies")
    
    # Create forum indexes
    print("📊 Creating forum indexes...")
    await posts_collection.create_index("author_id")
    await posts_collection.create_index([("title", "text"), ("content", "text")])
    await posts_collection.create_index([("created_at", -1)])
    await posts_collection.create_index("tags")
    await posts_collection.create_index("category")
    await posts_collection.create_index("status")
    
    await replies_collection.create_index("post_id")
    await replies_collection.create_index("author_id") 
    await replies_collection.create_index("parent_id")
    await replies_collection.create_index([("created_at", -1)])
    
    print("✅ Forum indexes created")

async def load_blog_test_data(posts_collection):
    """Load blog test data into MongoDB"""
    
    print("📰 Loading blog test data...")
    
    # Blog test posts
    blog_posts = [
        {
            "_id": "1",
            "title": "Next.js 15의 새로운 기능들",
            "content": "Next.js 15에서 도입된 새로운 기능들에 대해 알아보겠습니다. App Router의 개선사항, Server Components의 향상된 성능, 그리고 새로운 개발자 도구들에 대해 자세히 살펴보겠습니다...",
            "author": "개발자",
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-15T10:00:00Z",
            "tags": ["nextjs", "react", "frontend"],
            "categories": ["프론트엔드", "튜토리얼"],
            "published": True,
            "slug": "nextjs-15-new-features",
            "excerpt": "Next.js 15에서 도입된 새로운 기능들과 개선사항들을 살펴봅니다.",
            "reading_time": 5,
            "views": 142,
            "access_level": "public"
        },
        {
            "_id": "2",
            "title": "FastAPI와 Python으로 백엔드 개발하기",
            "content": "FastAPI를 사용한 현대적인 Python 백엔드 개발 방법을 소개합니다. 비동기 프로그래밍, 자동 API 문서화, 타입 힌트 활용법 등을 다룹니다...",
            "author": "백엔드 개발자",
            "created_at": "2024-01-14T09:00:00Z",
            "updated_at": "2024-01-14T09:00:00Z",
            "tags": ["fastapi", "python", "backend"],
            "categories": ["백엔드", "가이드"],
            "published": True,
            "slug": "fastapi-python-backend-development",
            "excerpt": "FastAPI를 활용한 현대적인 Python 백엔드 개발 방법론을 알아봅니다.",
            "reading_time": 8,
            "views": 256,
            "access_level": "user"
        },
        {
            "_id": "3",
            "title": "React Query를 활용한 상태 관리",
            "content": "React Query를 사용하여 서버 상태를 효율적으로 관리하는 방법을 알아봅시다. 캐싱 전략, 낙관적 업데이트, 에러 처리 방법 등을 다룹니다...",
            "author": "프론트엔드 개발자",
            "created_at": "2024-01-13T14:30:00Z",
            "updated_at": "2024-01-13T14:30:00Z",
            "tags": ["react", "react-query", "state-management"],
            "categories": ["프론트엔드", "상태관리"],
            "published": True,
            "slug": "react-query-state-management",
            "excerpt": "React Query를 사용한 효율적인 서버 상태 관리 방법을 살펴봅니다.",
            "reading_time": 7,
            "views": 189,
            "access_level": "public"
        },
        {
            "_id": "4",
            "title": "TypeScript 모범 사례",
            "content": "TypeScript를 효과적으로 사용하기 위한 모범 사례들을 정리했습니다. 타입 정의, 제네릭 활용, 유틸리티 타입 등을 다룹니다...",
            "author": "시니어 개발자",
            "created_at": "2024-01-12T16:20:00Z",
            "updated_at": "2024-01-12T16:20:00Z",
            "tags": ["typescript", "javascript", "best-practices"],
            "categories": ["프로그래밍", "모범사례"],
            "published": False,
            "slug": "typescript-best-practices",
            "excerpt": "TypeScript를 더 효과적으로 사용하기 위한 실무 중심의 모범 사례들을 소개합니다.",
            "reading_time": 10,
            "views": 324,
            "access_level": "moderator",
            "author_id": "admin-user-id"
        },
        {
            "_id": "5",
            "title": "[관리자 전용] 시스템 아키텍처 설계 방향",
            "content": "향후 시스템 확장을 위한 아키텍처 설계 방향을 논의합니다. 마이크로서비스 전환, 성능 최적화, 보안 강화 등에 대한 내부 논의 사항을 정리했습니다...",
            "author": "시스템 아키텍트",
            "created_at": "2024-01-11T10:00:00Z",
            "updated_at": "2024-01-11T10:00:00Z",
            "tags": ["architecture", "system-design", "internal"],
            "categories": ["아키텍처", "내부문서"],
            "published": True,
            "slug": "system-architecture-design-direction",
            "excerpt": "시스템 확장을 위한 아키텍처 설계 방향 및 내부 논의 사항입니다.",
            "reading_time": 15,
            "views": 45,
            "access_level": "admin",
            "author_id": "admin-user-id"
        }
    ]
    
    # Insert blog posts
    if blog_posts:
        await posts_collection.insert_many(blog_posts)
        print(f"📄 Inserted {len(blog_posts)} blog posts")
    
    # Create blog indexes
    print("📊 Creating blog indexes...")
    await posts_collection.create_index("slug", unique=True)
    await posts_collection.create_index([("title", "text"), ("content", "text")])
    await posts_collection.create_index([("created_at", -1)])
    await posts_collection.create_index("tags")
    await posts_collection.create_index("categories")
    await posts_collection.create_index("published")
    await posts_collection.create_index("access_level")
    await posts_collection.create_index("author_id")
    
    print("✅ Blog indexes created")

async def load_test_documents():
    """Load test documents from docs-testdata directory into MongoDB"""
    
    # MongoDB connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "nd_se_db")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    docs_collection = db.docs
    nav_collection = db.navigation
    forum_posts_collection = db.forum_posts
    forum_replies_collection = db.forum_replies
    blog_posts_collection = db.blog_posts
    
    try:
        # Clear existing test data
        print("🧹 Clearing existing documents...")
        await docs_collection.delete_many({})
        await nav_collection.delete_many({})
        await forum_posts_collection.delete_many({})
        await forum_replies_collection.delete_many({})
        await blog_posts_collection.delete_many({})
        
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
        
        # Load forum test data
        await load_forum_test_data(forum_posts_collection, forum_replies_collection)
        
        # Load blog test data
        await load_blog_test_data(blog_posts_collection)
        
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
        print("  • Forum posts: 3")
        print("  • Forum replies: 3")
        print("  • Blog posts: 5")
        
        # Show document breakdown
        markdown_count = len([d for d in documents if 'mdx' not in d.get('tags', [])])
        mdx_count = len(documents) - markdown_count
        
        print(f"  • Markdown files: {markdown_count}")
        print(f"  • MDX files: {mdx_count}")
        
        print("\n🎉 Test data loading completed successfully!")
        
        # Print some example URLs
        print("\n🌐 Example URLs to test:")
        print("  • Introduction: http://localhost:3000/docs/introduction")
        print("  • Installation: http://localhost:3000/docs/getting-started/installation")
        print("  • Frontend Guide: http://localhost:3000/docs/guides/frontend/overview")
        print("  • Backend Guide: http://localhost:3000/docs/guides/backend/overview")
        print("  • Interactive Examples: http://localhost:3000/docs/examples/interactive")
        print("  • API Reference: http://localhost:3000/docs/api/overview")
        print("  • Forum: http://localhost:3000/forum")
        print("  • Forum Post 1: http://localhost:3000/forum/1")
        print("  • Forum Post 2: http://localhost:3000/forum/2")
        print("  • Blog: http://localhost:3000/blog")
        print("  • Blog Post 1: http://localhost:3000/blog/1")
        print("  • Blog Post 2: http://localhost:3000/blog/2")
        
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
