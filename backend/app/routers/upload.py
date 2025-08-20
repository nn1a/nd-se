import mimetypes
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import aiofiles
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from ..core.auth import get_current_user
from ..core.database import database

router = APIRouter()

# 업로드 디렉토리 설정
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 이미지 업로드 디렉토리
IMAGE_DIR = UPLOAD_DIR / "images"
IMAGE_DIR.mkdir(exist_ok=True)

# 파일 업로드 디렉토리
FILE_DIR = UPLOAD_DIR / "files"
FILE_DIR.mkdir(exist_ok=True)

# 허용되는 이미지 형식
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}

# 허용되는 파일 형식 (문서 파일)
ALLOWED_FILE_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
}

# 최대 파일 크기 (10MB for images, 50MB for files)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def generate_unique_filename(original_filename: str) -> str:
    """고유한 파일명 생성"""
    file_extension = Path(original_filename).suffix
    unique_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{unique_id}{file_extension}"


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...), current_user: dict = Depends(get_current_user)
):
    """이미지 파일 업로드"""

    # 파일 타입 확인
    content_type = file.content_type
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"지원하지 않는 이미지 형식입니다. 허용되는 형식: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    # 파일 크기 확인
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"이미지 파일 크기가 너무 큽니다. 최대 크기: {MAX_IMAGE_SIZE // (1024*1024)}MB",
        )

    try:
        # 고유한 파일명 생성
        filename = generate_unique_filename(file.filename)
        file_path = IMAGE_DIR / filename

        # 파일 저장
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(contents)

        # 데이터베이스에 파일 정보 저장
        uploads_collection = database.get_collection("uploads")

        upload_record = {
            "original_filename": file.filename,
            "filename": filename,
            "file_path": str(file_path),
            "content_type": content_type,
            "file_size": len(contents),
            "upload_type": "image",
            "uploader_id": current_user["user_id"],
            "uploader_name": current_user["username"],
            "created_at": datetime.utcnow().isoformat(),
            "status": "active",
        }

        result = await uploads_collection.insert_one(upload_record)

        # 웹에서 접근 가능한 URL 생성
        file_url = f"/api/upload/serve/image/{filename}"

        return {
            "success": True,
            "file_id": str(result.inserted_id),
            "filename": filename,
            "original_filename": file.filename,
            "url": file_url,
            "size": len(contents),
            "content_type": content_type,
        }

    except Exception as e:
        # 업로드 실패시 파일 삭제
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"이미지 업로드 실패: {str(e)}",
        )


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...), current_user: dict = Depends(get_current_user)
):
    """일반 파일 업로드"""

    # 파일 타입 확인
    content_type = file.content_type
    if content_type not in ALLOWED_FILE_TYPES:
        # MIME 타입이 확실하지 않은 경우 파일 확장자로 다시 확인
        guessed_type, _ = mimetypes.guess_type(file.filename)
        if guessed_type not in ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="지원하지 않는 파일 형식입니다.",
            )
        content_type = guessed_type

    # 파일 크기 확인
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"파일 크기가 너무 큽니다. 최대 크기: {MAX_FILE_SIZE // (1024*1024)}MB",
        )

    try:
        # 고유한 파일명 생성
        filename = generate_unique_filename(file.filename)
        file_path = FILE_DIR / filename

        # 파일 저장
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(contents)

        # 데이터베이스에 파일 정보 저장
        uploads_collection = database.get_collection("uploads")

        upload_record = {
            "original_filename": file.filename,
            "filename": filename,
            "file_path": str(file_path),
            "content_type": content_type,
            "file_size": len(contents),
            "upload_type": "file",
            "uploader_id": current_user["user_id"],
            "uploader_name": current_user["username"],
            "created_at": datetime.utcnow().isoformat(),
            "status": "active",
        }

        result = await uploads_collection.insert_one(upload_record)

        # 다운로드 URL 생성
        file_url = f"/api/upload/serve/file/{filename}"

        return {
            "success": True,
            "file_id": str(result.inserted_id),
            "filename": filename,
            "original_filename": file.filename,
            "url": file_url,
            "size": len(contents),
            "content_type": content_type,
        }

    except Exception as e:
        # 업로드 실패시 파일 삭제
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 업로드 실패: {str(e)}",
        )


@router.get("/serve/image/{filename}")
async def serve_image(filename: str):
    """이미지 파일 서빙"""
    file_path = IMAGE_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="이미지를 찾을 수 없습니다."
        )

    # MIME 타입 추정
    content_type, _ = mimetypes.guess_type(str(file_path))
    if not content_type:
        content_type = "application/octet-stream"

    from fastapi.responses import FileResponse

    return FileResponse(
        path=file_path,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=3600"},  # 1시간 캐시
    )


@router.get("/serve/file/{filename}")
async def serve_file(filename: str):
    """일반 파일 서빙 (다운로드)"""
    file_path = FILE_DIR / filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="파일을 찾을 수 없습니다."
        )

    # 데이터베이스에서 원본 파일명 조회
    try:
        uploads_collection = database.get_collection("uploads")
        upload_record = await uploads_collection.find_one({"filename": filename})

        original_filename = (
            upload_record["original_filename"] if upload_record else filename
        )

        # MIME 타입 추정
        content_type, _ = mimetypes.guess_type(str(file_path))
        if not content_type:
            content_type = "application/octet-stream"

        from fastapi.responses import FileResponse

        return FileResponse(
            path=file_path,
            media_type=content_type,
            filename=original_filename,
            headers={
                "Content-Disposition": f"attachment; filename={original_filename}"
            },
        )

    except Exception:  # noqa: F841
        from fastapi.responses import FileResponse

        return FileResponse(
            path=file_path, media_type="application/octet-stream", filename=filename
        )


@router.get("/list")
async def list_user_uploads(
    upload_type: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """사용자가 업로드한 파일 목록 조회"""
    try:
        uploads_collection = database.get_collection("uploads")

        filter_query = {"uploader_id": current_user["user_id"], "status": "active"}

        if upload_type:
            filter_query["upload_type"] = upload_type

        cursor = (
            uploads_collection.find(filter_query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )

        uploads = []
        async for upload in cursor:
            upload["_id"] = str(upload["_id"])
            upload["id"] = upload["_id"]
            uploads.append(upload)

        return {"uploads": uploads, "total": len(uploads)}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"업로드 목록 조회 실패: {str(e)}",
        )


@router.delete("/{file_id}")
async def delete_upload(file_id: str, current_user: dict = Depends(get_current_user)):
    """업로드된 파일 삭제"""
    try:
        uploads_collection = database.get_collection("uploads")

        # 파일 정보 조회
        upload_record = await uploads_collection.find_one({"_id": file_id})

        if not upload_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="파일을 찾을 수 없습니다."
            )

        # 권한 확인 (업로더 또는 관리자만)
        if (
            upload_record["uploader_id"] != current_user["user_id"]
            and current_user.get("role") != "admin"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="파일 삭제 권한이 없습니다.",
            )

        # 물리적 파일 삭제
        file_path = Path(upload_record["file_path"])
        if file_path.exists():
            file_path.unlink()

        # 데이터베이스에서 soft delete
        await uploads_collection.update_one(
            {"_id": file_id},
            {
                "$set": {
                    "status": "deleted",
                    "deleted_at": datetime.utcnow().isoformat(),
                }
            },
        )

        return {"message": "파일이 삭제되었습니다."}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 삭제 실패: {str(e)}",
        )
