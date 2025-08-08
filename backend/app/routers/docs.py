from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from ..core.database import database

router = APIRouter()

async def get_docs_collection():
    """문서 컬렉션 가져오기"""
    return database.get_collection("docs")

async def get_navigation_collection():
    """네비게이션 컬렉션 가져오기"""
    return database.get_collection("navigation")

@router.get("/")
async def list_documents(
    page: int = 1,
    limit: int = 10,
    version: Optional[str] = None,
    language: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """문서 목록 조회 (버전/언어 필터링 지원)"""
    try:
        collection = await get_docs_collection()
        
        # 쿼리 조건 구성
        query = {}
        
        if version:
            query["version"] = version
        if language:
            query["language"] = language    
        if category:
            query["category"] = category
            
        if search:
            search_conditions = [
                {"title": {"$regex": search, "$options": "i"}},
                {"content": {"$regex": search, "$options": "i"}}
            ]
            if "$or" in query:
                # 기존 $or 조건과 search 조건을 $and로 결합
                query = {"$and": [{"$or": query["$or"]}, {"$or": search_conditions}]}
            else:
                query["$or"] = search_conditions
        
        # 디버그: 쿼리 확인
        print(f"DEBUG: Query: {query}")
        
        # 전체 개수 계산
        total = await collection.count_documents(query)
        print(f"DEBUG: Total documents found: {total}")
        
        # 디버그: 모든 문서 개수 확인
        all_docs_count = await collection.count_documents({})
        print(f"DEBUG: All documents in collection: {all_docs_count}")
        
        # 페이지네이션 적용
        skip = (page - 1) * limit
        cursor = collection.find(
            query,
            {"content": 0}  # content 필드 제외 (목록에서는 불필요)
        ).skip(skip).limit(limit).sort("order", 1)
        
        documents = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])  # ObjectId를 문자열로 변환
            # 디버그: 실제 DB 데이터 확인
            if not doc.get('slug'):
                raise HTTPException(
                    status_code=500,
                    detail=f"Debug: Missing slug in doc: {list(doc.keys())}"
                )
            documents.append(doc)
        
        pages = (total + limit - 1) // limit  # 전체 페이지 수
        
        return {
            "documents": documents,
            "total": total,
            "page": page,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
            "debug_query": str(query),
            "debug_all_docs_count": all_docs_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"문서 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/navigation")
async def get_navigation():
    """네비게이션 구조 조회"""
    try:
        collection = await get_navigation_collection()
        
        # 네비게이션 문서 가져오기 (단일 문서에 모든 네비게이션 구조가 포함됨)
        nav_doc = await collection.find_one({})
        
        if not nav_doc or "navigation" not in nav_doc:
            return {"navigation": []}
        
        # navigation 필드만 반환
        return {"navigation": nav_doc["navigation"]}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"네비게이션 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/{version}/{lang}/{slug:path}")
async def get_document_versioned(version: str, lang: str, slug: str):
    """버전별/언어별 문서 조회"""
    try:
        collection = await get_docs_collection()
        document = await collection.find_one({
            "version": version,
            "language": lang,
            "slug": slug
        })
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"문서를 찾을 수 없습니다: {version}/{lang}/{slug}"
            )
        
        # ObjectId를 문자열로 변환
        document["_id"] = str(document["_id"])
        
        # 조회수 증가 (선택적)
        await collection.update_one(
            {"version": version, "language": lang, "slug": slug},
            {"$inc": {"views": 1}, "$set": {"last_viewed": datetime.utcnow()}}
        )
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"문서 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/{slug:path}")
async def get_document(slug: str):
    """문서 조회 (slug 기준)"""
    try:
        collection = await get_docs_collection()
        # slug로 직접 검색
        document = await collection.find_one({"slug": slug})
            
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"문서를 찾을 수 없습니다: {slug}"
            )
        
        # ObjectId를 문자열로 변환
        document["_id"] = str(document["_id"])
        
        # 조회수 증가 (선택적)
        await collection.update_one(
            {"slug": slug},
            {"$inc": {"views": 1}, "$set": {"last_viewed": datetime.utcnow()}}
        )
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"문서 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/")
async def create_document(document_data: dict):
    """새 문서 생성"""
    try:
        collection = await get_docs_collection()
        
        # 중복 slug 확인
        existing = await collection.find_one({"slug": document_data["slug"]})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"이미 존재하는 slug입니다: {document_data['slug']}"
            )
        
        # 현재 시간 추가
        document_data["created_at"] = datetime.utcnow()
        document_data["updated_at"] = datetime.utcnow()
        document_data["views"] = 0
        
        # 문서 삽입
        result = await collection.insert_one(document_data)
        
        # 생성된 문서 반환
        created_document = await collection.find_one({"_id": result.inserted_id})
        created_document["_id"] = str(created_document["_id"])
        
        return created_document
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"문서 생성 중 오류가 발생했습니다: {str(e)}"
        )

@router.put("/{slug}")
async def update_document(slug: str, document_data: dict):
    """문서 업데이트"""
    try:
        collection = await get_docs_collection()
        
        # 문서 존재 확인
        existing = await collection.find_one({"slug": slug})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"문서를 찾을 수 없습니다: {slug}"
            )
        
        # 업데이트 시간 추가
        document_data["updated_at"] = datetime.utcnow()
        
        # slug가 변경되는 경우 중복 확인
        if "slug" in document_data and document_data["slug"] != slug:
            slug_exists = await collection.find_one({"slug": document_data["slug"]})
            if slug_exists:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"이미 존재하는 slug입니다: {document_data['slug']}"
                )
        
        # 문서 업데이트
        result = await collection.update_one(
            {"slug": slug},
            {"$set": document_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="문서 업데이트에 실패했습니다"
            )
        
        # 업데이트된 문서 반환
        updated_document = await collection.find_one({"slug": document_data.get("slug", slug)})
        updated_document["_id"] = str(updated_document["_id"])
        
        return updated_document
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"문서 업데이트 중 오류가 발생했습니다: {str(e)}"
        )

@router.delete("/{slug}")
async def delete_document(slug: str):
    """문서 삭제"""
    try:
        collection = await get_docs_collection()
        
        # 문서 존재 확인
        existing = await collection.find_one({"slug": slug})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"문서를 찾을 수 없습니다: {slug}"
            )
        
        # 문서 삭제
        result = await collection.delete_one({"slug": slug})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="문서 삭제에 실패했습니다"
            )
        
        return {"message": f"문서가 성공적으로 삭제되었습니다: {slug}"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"문서 삭제 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/category/{category}")
async def get_documents_by_category(category: str, page: int = 1, limit: int = 10):
    """카테고리별 문서 조회"""
    try:
        collection = await get_docs_collection()
        
        query = {"metadata.category": category}
        
        # 전체 개수 계산
        total = await collection.count_documents(query)
        
        # 페이지네이션 적용
        skip = (page - 1) * limit
        cursor = collection.find(query).skip(skip).limit(limit).sort("metadata.order", 1)
        
        documents = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            documents.append(doc)
        
        pages = (total + limit - 1) // limit
        
        return {
            "category": category,
            "documents": documents,
            "total": total,
            "page": page,
            "pages": pages
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"카테고리별 문서 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/search/{query}")
async def search_documents(query: str, page: int = 1, limit: int = 10):
    """문서 전체 텍스트 검색"""
    try:
        collection = await get_docs_collection()
        
        # 텍스트 검색 쿼리
        search_query = {
            "$text": {
                "$search": query
            }
        }
        
        # 전체 개수 계산
        total = await collection.count_documents(search_query)
        
        # 페이지네이션 적용 (관련도 순 정렬)
        skip = (page - 1) * limit
        cursor = collection.find(
            search_query,
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).skip(skip).limit(limit)
        
        documents = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            documents.append(doc)
        
        pages = (total + limit - 1) // limit
        
        return {
            "query": query,
            "documents": documents,
            "total": total,
            "page": page,
            "pages": pages
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"문서 검색 중 오류가 발생했습니다: {str(e)}"
        )

# Legacy endpoints (기존 코드와의 호환성을 위해 유지)
@router.get("/document/{doc_id}")
async def get_document_by_id(doc_id: str):
    """ID로 문서 조회 (레거시 엔드포인트)"""
    return await get_document(doc_id)
