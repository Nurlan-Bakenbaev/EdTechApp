import sys, pathlib, json
sys.path.insert(0, str(pathlib.Path('tmp/pdf-tools').resolve()))
import fitz

root = pathlib.Path('HomeWorks')
results = []
for manifest_path in sorted(root.glob('g1_*.manifest.json')):
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    lesson = json.loads(pathlib.Path('content/authored-lessons', manifest['lesson_id'] + '.json').read_text(encoding='utf-8'))
    for kind in ['student_pdf_path', 'teacher_answer_key_path']:
        document = fitz.open(manifest[kind])
        text = '\n'.join(page.get_text() for page in document)
        assert '\ufffd' not in text, manifest[kind]
        assert 'BILIM' in text and 'класс' in text, manifest[kind]
        for index, task in enumerate(lesson['print']['tasks']):
            assert f'{index + 1}.' in text, (manifest[kind], index)
        if kind == 'student_pdf_path':
            assert 'Ответ:' not in text, manifest[kind]
        else:
            assert text.count('Ответ:') == len(lesson['print']['tasks']), manifest[kind]
        results.append({'path': manifest[kind], 'pages': len(document)})
        if kind == 'student_pdf_path' and lesson['order'] in [1, 35, 42, 65, 82]:
            for page_number in range(min(2, len(document))):
                document[page_number].get_pixmap(matrix=fitz.Matrix(1.2, 1.2)).save(f'artifacts/{lesson["id"]}-page-{page_number + 1}.png')
pathlib.Path('artifacts/pdf-check.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
print(f'Validated {len(results)} PDFs: readable Cyrillic, task numbering, separate answers.')
