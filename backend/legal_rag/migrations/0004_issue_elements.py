import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("legal_rag", "0003_act_catalog_sections"),
    ]

    operations = [
        migrations.CreateModel(
            name="LegalIssue",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True,
                                            serialize=False, verbose_name="ID")),
                ("slug", models.CharField(max_length=64, unique=True)),
                ("title", models.CharField(max_length=512)),
                ("act_title", models.CharField(blank=True, max_length=512)),
                ("section_hint", models.CharField(blank=True, max_length=64)),
                ("domain_label", models.CharField(blank=True, max_length=64)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="LegalElement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True,
                                            serialize=False, verbose_name="ID")),
                ("role", models.CharField(max_length=32)),
                ("quote", models.TextField(blank=True)),
                ("status", models.CharField(default="missing", max_length=16)),
                ("confidence", models.FloatField(default=0.0)),
                ("verified", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("issue", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="elements", to="legal_rag.legalissue",
                )),
                ("chunk", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="elements", to="legal_rag.legalchunk",
                )),
            ],
            options={"unique_together": {("issue", "role")}},
        ),
    ]
