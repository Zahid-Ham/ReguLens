"""ReguLens Backend Custom Exceptions.

Defines domain-specific exception types for data loading, validation,
and pipeline errors without masking missing artifacts.
"""


class ReguLensException(Exception):
    """Base exception class for all ReguLens backend errors."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class DataFileNotFoundError(ReguLensException):
    """Raised when an expected data artifact file does not exist on disk."""

    def __init__(self, file_path: str, artifact_name: str) -> None:
        message = f"Required data artifact '{artifact_name}' not found at: {file_path}"
        super().__init__(message)
        self.file_path = file_path
        self.artifact_name = artifact_name


class DataCorruptedError(ReguLensException):
    """Raised when an existing data artifact fails to parse or validate."""

    def __init__(self, file_path: str, reason: str) -> None:
        message = f"Data artifact at '{file_path}' is corrupted or unreadable: {reason}"
        super().__init__(message)
        self.file_path = file_path
        self.reason = reason
