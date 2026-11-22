import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("legal_rag", "0002_alter_legalchunk_embedding"),
    ]

    operations = [
        migrations.AddField(
            model_name="legaldocument",
            name="authority",
            field=models.CharField(default="official", max_length=20),
        ),
        migrations.AddField(
            model_name="legaldocument",
            name="fetched_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="legalchunk",
            name="section_number",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="legalchunk",
            name="section_title",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="legalchunk",
            name="source_url",
            field=models.URLField(blank=True, max_length=2048),
        ),
        migrations.AddField(
            model_name="legalchunk",
            name="source_type",
            field=models.CharField(default="local_pdf", max_length=20),
        ),
        migrations.AddField(
            model_name="legalchunk",
            name="language",
            field=models.CharField(default="en", max_length=10),
        ),
        migrations.AddField(
            model_name="legalchunk",
            name="fetched_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name="ActCatalog",
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
                ("act_no", models.CharField(blank=True, max_length=64)),
                ("year", models.CharField(blank=True, max_length=8)),
                ("pdf_url", models.URLField(max_length=2048, unique=True)),
                ("language", models.CharField(default="en", max_length=10)),
                ("status", models.CharField(default="unknown", max_length=20)),
                ("last_seen_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "document",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="catalog_entries",
                        to="legal_rag.legaldocument",
                    ),
                ),
            ],
        ),
    ]
