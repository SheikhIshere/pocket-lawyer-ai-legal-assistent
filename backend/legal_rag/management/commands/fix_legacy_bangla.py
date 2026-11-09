"""Convert legacy Bijoy text in stored legal chunks to Unicode and re-embed."""

from django.core.management.base import BaseCommand

from legal_rag.legacy_bangla import BIJOY_SIGNAL, convert_label, convert_text
from legal_rag.models import LegalChunk, LegalDocument
from legal_rag.services import EMBEDDING_BATCH_SIZE, embed_texts


class Command(BaseCommand):
    help = (
        "Convert legacy Bijoy/SutonnyMJ Bangla chunks to Unicode and re-embed "
        "the changed chunks. Run with --apply to write."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Write changes; without this flag the command only reports.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            help="Only process the first N matching documents.",
        )
        parser.add_argument(
            "--ids",
            nargs="+",
            type=int,
            help="Only process these document ids.",
        )

    def handle(self, *args, **options):
        documents = LegalDocument.objects.all().order_by("id")
        if options.get("ids"):
            documents = documents.filter(id__in=options["ids"])
        if options.get("limit"):
            documents = documents[: options["limit"]]

        changed_documents = changed_chunks = 0
        for document in documents:
            chunks = list(document.chunks.order_by("id"))
            if not chunks:
                continue
            if not any(BIJOY_SIGNAL.search(chunk.text or "") for chunk in chunks):
                continue

            changes = []
            for chunk in chunks:
                text = chunk.text or ""
                if not BIJOY_SIGNAL.search(text) and "¤" not in text:
                    continue
                converted = convert_text(text)
                label = convert_label(chunk.section_label)
                if converted != chunk.text or label != chunk.section_label:
                    changes.append((chunk, converted, label))

            if not changes:
                continue
            changed_documents += 1
            changed_chunks += len(changes)
            self.stdout.write(
                f"{'Would convert' if not options['apply'] else 'Converting'} "
                f"{document.id} {document.title[:60]}: {len(changes)} chunks"
            )
            if not options["apply"]:
                sample = changes[0]
                self.stdout.write(f"  before: {sample[0].text[:100]!r}")
                self.stdout.write(f"  after : {sample[1][:100]!r}")
                continue

            try:
                for start in range(0, len(changes), EMBEDDING_BATCH_SIZE):
                    batch = changes[start:start + EMBEDDING_BATCH_SIZE]
                    vectors = embed_texts([text for _, text, _ in batch])
                    if len(vectors) != len(batch):
                        raise RuntimeError(
                            f"embedding count mismatch: expected {len(batch)}, "
                            f"got {len(vectors)}"
                        )
                    for (chunk, text, label), vector in zip(batch, vectors):
                        chunk.text = text
                        chunk.section_label = label
                        chunk.embedding = vector
                    LegalChunk.objects.bulk_update(
                        [chunk for chunk, _, _ in batch],
                        ["text", "section_label", "embedding"],
                    )
            except Exception as exc:
                self.stderr.write(
                    f"Skipped {document.id} {document.title[:60]}: {exc}"
                )
                continue

        self.stdout.write(
            self.style.SUCCESS(
                f"{'Would change' if not options['apply'] else 'Changed'} "
                f"{changed_documents} documents and {changed_chunks} chunks."
            )
        )
