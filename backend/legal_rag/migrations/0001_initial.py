# The vector dimension is intentionally literal: migrations must be deterministic.
# It matches LEGAL_RAG_EMBEDDING_DIM (currently 1536). Changing that setting requires
# a new migration (AlterField) and a rebuild of the HNSW index.

import django.db.models.deletion
from django.db import migrations, models
from pgvector.django import HnswIndex, VectorExtension, VectorField


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        VectorExtension(),
        migrations.CreateModel(
            name="LegalDocument",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=512)),
                ("source_file", models.CharField(max_length=1024)),
                ("source_url", models.URLField(blank=True, max_length=2048)),
                ("language", models.CharField(default="en", max_length=10)),
                ("checksum", models.CharField(max_length=64, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="LegalChunk",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("section_label", models.CharField(blank=True, max_length=255)),
                ("page_start", models.PositiveIntegerField(blank=True, null=True)),
                ("page_end", models.PositiveIntegerField(blank=True, null=True)),
                ("text", models.TextField()),
                ("embedding", VectorField(dimensions=1536)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "document",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="chunks",
                        to="legal_rag.legaldocument",
                    ),
                ),
            ],
        ),
        migrations.AddIndex(
            model_name="legalchunk",
            index=HnswIndex(
                name="legal_chunk_embedding_hnsw",
                fields=["embedding"],
                opclasses=["vector_cosine_ops"],
            ),
        ),
    ]
