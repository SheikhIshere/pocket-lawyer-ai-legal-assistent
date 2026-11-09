from django.conf import settings
from django.db import models
from pgvector.django import HnswIndex, VectorField


class LegalDocument(models.Model):
    title = models.CharField(max_length=512)
    source_file = models.CharField(max_length=1024)
    source_url = models.URLField(max_length=2048, blank=True)
    language = models.CharField(max_length=10, default="en")
    checksum = models.CharField(max_length=64, unique=True)
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
