"""Uploaded Document Schemas.

Defines Pydantic models for arbitrary PDF and DOCX document ingestion,
runtime document metadata, and upload API responses.
"""

from typing import Optional
from pydantic import BaseModel, Field


class UploadedDocument(BaseModel):
    """Runtime representation of an uploaded regulatory document."""

    document_id: str = Field(description="Backend-assigned unique identifier (e.g. doc_custom_...)")
    filename: str = Field(description="Original uploaded filename")
    title: str = Field(description="Extracted or derived document title")
    file_type: str = Field(description="Normalized file format ('PDF' or 'DOCX')")
    file_size: int = Field(description="File size in bytes")
    source: str = Field(default="uploaded", description="Origin source identifier")
    uploaded_at: str = Field(description="ISO-8601 timestamp of upload")
    extracted_text: str = Field(description="Full text extracted from PDF/DOCX")
    page_count: Optional[int] = Field(default=None, description="Number of pages if PDF")
    word_count: int = Field(default=0, description="Total word count in extracted text")
    character_count: int = Field(default=0, description="Total character count in extracted text")


class DocumentUploadResponse(BaseModel):
    """API response model returned after successful document upload."""

    document_id: str = Field(description="Backend-assigned unique identifier (e.g. doc_custom_...)")
    filename: str = Field(description="Original uploaded filename")
    title: str = Field(description="Extracted or derived document title")
    file_type: str = Field(description="Normalized file format ('PDF' or 'DOCX')")
    file_size: int = Field(description="File size in bytes")
    source: str = Field(default="uploaded", description="Origin source identifier")
    uploaded_at: str = Field(description="ISO-8601 timestamp of upload")
    extracted_text: str = Field(description="Extracted document text")
    page_count: Optional[int] = Field(default=None, description="Number of pages if applicable")
    word_count: int = Field(default=0, description="Total word count")
    character_count: int = Field(default=0, description="Total character count")
