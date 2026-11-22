from django.conf import settings
from django.db import models
from pgvector.django import HnswIndex, VectorField


class LegalDocument(models.Model):
    title = models.CharField(max_length=512)
    source_file = models.CharField(max_length=1024)
    source_url = models.URLField(max_length=2048, blank=True)
    language = models.CharField(max_length=10, default="en")
    checksum = models.CharField(max_length=64, unique=True)
    authority = models.CharField(max_length=20, default="official")
    fetched_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class LegalChunk(models.Model):
    document = models.ForeignKey(
        LegalDocument,
        on_delete=models.CASCADE,
        related_name="chunks",
    )
    section_label = models.CharField(max_length=255, blank=True)
    section_number = models.CharField(max_length=32, blank=True)
    section_title = models.CharField(max_length=255, blank=True)
    source_url = models.URLField(max_length=2048, blank=True)
    source_type = models.CharField(max_length=20, default="local_pdf")
    language = models.CharField(max_length=10, default="en")
    fetched_at = models.DateTimeField(null=True, blank=True)
    page_start = models.PositiveIntegerField(null=True, blank=True)
    page_end = models.PositiveIntegerField(null=True, blank=True)
    text = models.TextField()
    embedding = VectorField(dimensions=settings.LEGAL_RAG_EMBEDDING_DIM)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            HnswIndex(
                name="legal_chunk_embedding_hnsw",
                fields=["embedding"],
                opclasses=["vector_cosine_ops"],
            ),
        ]

    def __str__(self):
        return f"{self.document_id}: {self.section_label or 'chunk'}"


class ActCatalog(models.Model):
    """One row per Act/Ordinance in the official Bangladesh Code index."""

    title = models.CharField(max_length=512)
    act_no = models.CharField(max_length=64, blank=True)
    year = models.CharField(max_length=8, blank=True)
    pdf_url = models.URLField(max_length=2048, unique=True)
    language = models.CharField(max_length=10, default="en")
    status = models.CharField(max_length=20, default="unknown")
    document = models.ForeignKey(
        LegalDocument,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="catalog_entries",
    )
    last_seen_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.year})"


class LegalIssue(models.Model):
    """One legal issue spotted from facts, independent of domain."""

    slug = models.CharField(max_length=64, unique=True)
    title = models.CharField(max_length=512)
    act_title = models.CharField(max_length=512, blank=True)
    section_hint = models.CharField(max_length=64, blank=True)
    domain_label = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class LegalElement(models.Model):
    """One universal role for one issue, with a verified source quote."""

    issue = models.ForeignKey(
        LegalIssue, on_delete=models.CASCADE, related_name="elements"
    )
    role = models.CharField(max_length=32)
    chunk = models.ForeignKey(
        LegalChunk, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="elements",
    )
    quote = models.TextField(blank=True)
    status = models.CharField(max_length=16, default="missing")
    confidence = models.FloatField(default=0.0)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("issue", "role")]

    def __str__(self):
        return f"{self.issue_id}:{self.role}"
