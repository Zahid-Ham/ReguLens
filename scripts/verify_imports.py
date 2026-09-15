import sys
import time

modules = [
    ("FastAPI", "fastapi"),
    ("Uvicorn", "uvicorn"),
    ("Pydantic", "pydantic"),
    ("Pydantic Settings", "pydantic_settings"),
    ("Python Dotenv", "dotenv"),
    ("Python Multipart", "multipart"),
    ("PyPDF", "pypdf"),
    ("PyMuPDF", "pymupdf"),
    ("PDFPlumber", "pdfplumber"),
    ("NLTK", "nltk"),
    ("RapidFuzz", "rapidfuzz"),
    ("Requests", "requests"),
    ("BeautifulSoup4", "bs4"),
    ("LXML", "lxml"),
    ("Pytest", "pytest"),
    ("HTTPX", "httpx"),
    ("Firebase Admin", "firebase_admin"),
    ("NumPy", "numpy"),
    ("Pandas", "pandas"),
    ("Scikit-Learn", "sklearn"),
    ("spaCy", "spacy"),
    ("Torch", "torch"),
    ("Transformers", "transformers"),
    ("Sentence Transformers", "sentence_transformers"),
]

print("=== STARTING IMPORT VERIFICATION ===", flush=True)
for name, mod in modules:
    print(f"Testing {name:25} ({mod})...", end=" ", flush=True)
    t0 = time.time()
    try:
        m = __import__(mod)
        version = getattr(m, "__version__", "loaded")
        dt = time.time() - t0
        print(f"SUCCESS [v{version}] ({dt:.2f}s)", flush=True)
    except Exception as e:
        print(f"FAILED: {e}", flush=True)

print("=== FINISHED VERIFICATION ===", flush=True)
