"""Document Upload and Runtime Ingestion Service.

Handles safe intake, validation, text extraction (PDF via PyMuPDF/PyPDF and DOCX via python-docx),
and in-memory repository persistence for arbitrary uploaded regulatory documents.
"""

from datetime import datetime, timezone
import io
from pathlib import Path
import re
from typing import Dict, List, Optional, Tuple
import uuid

from fastapi import HTTPException, UploadFile, status

from app.schemas.uploaded_document import UploadedDocument


class DocumentUploadService:
    """Service managing uploaded document text extraction, metadata parsing, and runtime storage."""

    MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
    ALLOWED_EXTENSIONS = {".pdf", ".docx"}

    def __init__(self) -> None:
        self._documents: Dict[str, UploadedDocument] = {}

    def extract_text_from_pdf(self, file_bytes: bytes) -> Tuple[str, int]:
        """Extract text and page count from PDF bytes using PyMuPDF or pypdf fallback."""
        text_parts: List[str] = []
        page_count = 0

        # Try pymupdf / fitz first
        extracted = False
        try:
            import pymupdf

            with pymupdf.open(stream=file_bytes, filetype="pdf") as doc:
                page_count = len(doc)
                for page_idx in range(page_count):
                    page = doc[page_idx]
                    page_text = page.get_text().strip()
                    if page_text:
                        text_parts.append(f"[Page {page_idx + 1}]\n{page_text}")
                extracted = True
        except Exception:
            pass

        if not extracted:
            # Fallback to pypdf
            try:
                import pypdf

                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                page_count = len(reader.pages)
                for page_idx, page in enumerate(reader.pages):
                    page_text = (page.extract_text() or "").strip()
                    if page_text:
                        text_parts.append(f"[Page {page_idx + 1}]\n{page_text}")
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unable to parse PDF content: {str(e)}",
                ) from e

        combined_text = "\n\n".join(text_parts).strip()
        if not combined_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded PDF does not contain any extractable text (it may be scanned/image-only or empty).",
            )
        return combined_text, page_count

    def extract_text_from_docx(self, file_bytes: bytes) -> Tuple[str, Optional[int]]:
        """Extract paragraph and table text from DOCX bytes using pure-python zipfile & xml parser."""
        paragraphs: List[str] = []
        try:
            import zipfile
            import xml.etree.ElementTree as ET

            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                if "word/document.xml" not in z.namelist():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid DOCX file: missing word/document.xml.",
                    )
                xml_content = z.read("word/document.xml")

            tree = ET.fromstring(xml_content)
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

            for p in tree.iterfind(".//w:p", ns):
                texts = [node.text for node in p.iterfind(".//w:t", ns) if node.text]
                p_text = "".join(texts).strip()
                if p_text:
                    paragraphs.append(p_text)

            combined_text = "\n\n".join(paragraphs).strip()
            if not combined_text:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded DOCX document does not contain extractable text.",
                )
            return combined_text, None
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to parse DOCX document: {str(e)}",
            ) from e


    def _derive_clean_title(self, filename: str, extracted_text: str) -> str:
        """Derive a clean human-readable title from document text or filename."""
        first_lines = [line.strip() for line in extracted_text.splitlines() if line.strip() and not line.startswith("[Page ")]
        if first_lines:
            candidate = first_lines[0]
            # If candidate is reasonably short and looks like a title
            if 10 <= len(candidate) <= 180 and not candidate.startswith("http"):
                clean = re.sub(r"\s+", " ", candidate).strip()
                return clean

        # Fallback to sanitized filename
        base_name = Path(filename).stem
        clean_name = re.sub(r"[_\-]+", " ", base_name).strip()
        return clean_name.title() if clean_name else "Uploaded Regulatory Document"

    async def process_and_store_upload(self, file: UploadFile) -> UploadedDocument:
        """Validate uploaded file, extract text, and register in runtime store."""
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must have a valid filename.",
            )

        # Sanitize filename
        safe_filename = Path(file.filename).name
        ext = Path(safe_filename).suffix.lower()

        if ext not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Only PDF (.pdf) and DOCX (.docx) files are supported.",
            )

        # Read file bytes safely
        try:
            file_bytes = await file.read()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read uploaded file: {str(e)}",
            ) from e

        file_size = len(file_bytes)
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty (0 bytes).",
            )

        if file_size > self.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Uploaded file size ({file_size} bytes) exceeds maximum limit of 25 MB.",
            )

        # Extract text based on file format
        if ext == ".pdf":
            extracted_text, page_count = self.extract_text_from_pdf(file_bytes)
            file_type = "PDF"
        else:  # ext == ".docx"
            extracted_text, page_count = self.extract_text_from_docx(file_bytes)
            file_type = "DOCX"

        # Generate backend-owned authoritative document ID
        doc_id = f"doc_custom_{uuid.uuid4().hex[:12]}"
        title = self._derive_clean_title(safe_filename, extracted_text)
        word_count = len(extracted_text.split())
        character_count = len(extracted_text)
        uploaded_at = datetime.now(timezone.utc).isoformat()

        doc_record = UploadedDocument(
            document_id=doc_id,
            filename=safe_filename,
            title=title,
            file_type=file_type,
            file_size=file_size,
            source="uploaded",
            uploaded_at=uploaded_at,
            extracted_text=extracted_text,
            page_count=page_count,
            word_count=word_count,
            character_count=character_count,
        )

        self._documents[doc_id] = doc_record
        return doc_record

    def get_uploaded_document(self, document_id: str) -> Optional[UploadedDocument]:
        """Retrieve uploaded document by document_id from runtime store."""
        clean_id = document_id.strip()
        return self._documents.get(clean_id)

    def list_uploaded_documents(self) -> List[UploadedDocument]:
        """List all runtime-uploaded documents."""
        return list(self._documents.values())
