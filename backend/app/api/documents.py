from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.dependencies import get_document_upload_service, get_dynamic_nlp_pipeline, get_regulation_service
from app.schemas.dynamic_nlp import DynamicNLPResponse
from app.schemas.uploaded_document import DocumentUploadResponse, UploadedDocument
from app.services.document_upload_service import DocumentUploadService
from app.services.dynamic_nlp_pipeline import DynamicNLPPipeline
from app.services.regulation_service import RegulationService

router = APIRouter(prefix="/documents", tags=["Document Ingestion & Dynamic NLP"])


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload and Ingest Regulatory Document",
    description="Accepts arbitrary PDF or DOCX file, extracts text, generates backend-owned document ID, and stores in runtime repository.",
)
async def upload_document(
    file: UploadFile = File(..., description="Regulatory PDF or DOCX file to ingest"),
    upload_service: DocumentUploadService = Depends(get_document_upload_service),
) -> DocumentUploadResponse:
    """Ingest uploaded PDF/DOCX file, parse text, and register in runtime document store."""
    doc = await upload_service.process_and_store_upload(file=file)
    return DocumentUploadResponse(
        document_id=doc.document_id,
        filename=doc.filename,
        title=doc.title,
        file_type=doc.file_type,
        file_size=doc.file_size,
        source=doc.source,
        uploaded_at=doc.uploaded_at,
        extracted_text=doc.extracted_text,
        page_count=doc.page_count,
        word_count=doc.word_count,
        character_count=doc.character_count,
    )


@router.get(
    "/uploaded",
    response_model=List[UploadedDocument],
    summary="List Runtime Uploaded Documents",
    description="Retrieve all documents ingested and stored in the runtime repository during the current session.",
)
async def list_uploaded_documents(
    upload_service: DocumentUploadService = Depends(get_document_upload_service),
) -> List[UploadedDocument]:
    """Return all runtime-uploaded documents."""
    return upload_service.list_uploaded_documents()


@router.get(
    "/uploaded/{document_id}",
    response_model=UploadedDocument,
    summary="Get Runtime Uploaded Document by ID",
    description="Retrieve full metadata and extracted text for an uploaded document by its ID.",
)
async def get_uploaded_document(
    document_id: str,
    upload_service: DocumentUploadService = Depends(get_document_upload_service),
) -> UploadedDocument:
    """Retrieve single uploaded document from runtime store."""
    doc = upload_service.get_uploaded_document(document_id=document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Uploaded document with ID '{document_id}' not found in runtime repository.",
        )
    return doc


@router.post(
    "/{document_id}/nlp",
    response_model=DynamicNLPResponse,
    status_code=status.HTTP_200_OK,
    summary="Run Dynamic Regulatory NLP Pipeline",
    description="Executes clause segmentation, tokenization, POS tagging, dependency parsing, domain NER, regulatory classification, and structured requirement extraction for any uploaded document.",
)
async def process_document_nlp(
    document_id: str,
    upload_service: DocumentUploadService = Depends(get_document_upload_service),
    nlp_pipeline: DynamicNLPPipeline = Depends(get_dynamic_nlp_pipeline),
) -> DynamicNLPResponse:
    """Process uploaded document text through dynamic NLP pipeline and return structured annotations and metrics."""
    clean_id = document_id.strip()
    uploaded_doc = upload_service.get_uploaded_document(clean_id)

    if not uploaded_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Uploaded document with ID '{clean_id}' not found. Please upload the document first.",
        )

    if not uploaded_doc.extracted_text or not uploaded_doc.extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document '{clean_id}' contains no extracted text to process.",
        )

    result = nlp_pipeline.process_document(
        document_id=clean_id,
        extracted_text=uploaded_doc.extracted_text,
    )
    return result


@router.get(
    "/{document_id}/nlp",
    response_model=DynamicNLPResponse,
    summary="Get Dynamic Regulatory NLP Results",
    description="Retrieve previously computed dynamic NLP annotations, entities, classifications, and requirements for an uploaded document.",
)
async def get_document_nlp(
    document_id: str,
    upload_service: DocumentUploadService = Depends(get_document_upload_service),
    nlp_pipeline: DynamicNLPPipeline = Depends(get_dynamic_nlp_pipeline),
) -> DynamicNLPResponse:
    """Retrieve runtime NLP analysis result for an uploaded document."""
    clean_id = document_id.strip()
    uploaded_doc = upload_service.get_uploaded_document(clean_id)

    if not uploaded_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Uploaded document with ID '{clean_id}' not found.",
        )

    result = nlp_pipeline.get_document_nlp_result(clean_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"NLP pipeline has not been executed yet for document '{clean_id}'. Please call POST /api/documents/{clean_id}/nlp first.",
        )

    return result

