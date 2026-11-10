#!/usr/bin/env python3
"""Validación funcional real; Playwright, pypdf y Chromium. Artefactos en /tmp."""
import functools
import http.server
import json
import os
from pathlib import Path
import shutil
import tempfile
import threading
from urllib.parse import urljoin, urlsplit
from playwright.sync_api import sync_playwright, expect
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(tempfile.mkdtemp(prefix='farmapnt-pruebas-'))
WEB = OUT / 'servidor'
WEB.mkdir()
(WEB / 'farmaPNT').symlink_to(ROOT, target_is_directory=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(WEB)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_port}/farmaPNT/'


def home(page):
    page.locator('#runner [data-home], #editor [data-home]').filter(visible=True).click()
    expect(page.locator('#library')).to_be_visible()


def check_widths(page):
    for width in [360, 390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (page.url, width)


def start_demo(page, index):
    page.locator('#demo-cards article').nth(index).get_by_role('button', name='Abrir demostración').click()
    page.locator('#reviewed').check()
    page.locator('#start-run').click()
    expect(page.locator('#runner')).to_be_visible()


try:
    with sync_playwright() as p:
        chromium = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
        browser = p.chromium.launch(**({'executable_path': chromium} if chromium else {}), headless=True, args=['--no-sandbox'])
        context = browser.new_context(accept_downloads=True, permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()
        errors, remote, bad_http = [], [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda request: remote.append(request.url) if not request.url.startswith((BASE, 'blob:', 'data:')) else None)
        page.on('response', lambda response: bad_http.append((response.status, response.url)) if response.status >= 400 else None)
        page.on('dialog', lambda dialog: dialog.accept())
        page.goto(BASE)
        expect(page.locator('#demo-cards article')).to_have_count(3)
        check_widths(page)
        page.screenshot(path=str(OUT / 'biblioteca.png'), full_page=True)

        # Autoría completa: entrada, conversión literal y excepción manual.
        page.locator('#new').click()
        page.locator('#start-run').click()
        expect(page.locator('#errors')).to_contain_text('obligatorio')
        for key, value in [('title', 'PNT ficticio de prueba'), ('version', '1.1-DEMO'), ('author', 'Instructor ficticio'), ('sourceName', 'PNT-TEST')]:
            page.locator('#meta-' + key).fill(value)
        source = 'Localiza el documento ficticio.\n\nSi falta el documento, consulta al responsable ficticio.\n\nCierra la revisión documental simulada.'
        txt = OUT / 'fuente.txt'
        txt.write_text(source)
        page.locator('#source-file').set_input_files(txt)
        expect(page.locator('#source-text')).to_have_value(source)
        page.locator('#generate').click()
        page.locator('#selected-node').select_option('paso-2')
        page.locator('#node-kind').select_option('decision')
        page.locator('#add-node').click()
        new_id = page.locator('#selected-node').input_value()
        page.locator('#node-kind').select_option('end')
        page.locator('#node-title').fill('Excepción de derivación')
        page.locator('#node-instruction').fill('Consulta al responsable ficticio.')
        page.locator('#node-quote').fill('Si falta el documento, consulta al responsable ficticio.')
        page.locator('#node-outcome').select_option('escalated')
        page.locator('#selected-node').select_option('paso-2')
        page.locator('#choice-target-1').select_option(new_id)
        page.locator('#validate').click()
        expect(page.locator('#errors')).to_contain_text('comprobados')
        page.locator('#reviewed').check()
        page.locator('#meta-version').fill('1.2-DEMO')
        expect(page.locator('#reviewed')).not_to_be_checked()
        page.locator('#save-protocol').click()
        expect(page.locator('#status')).to_contain_text('Borrador guardado')
        with page.expect_download() as event:
            page.locator('#export-protocol').click()
        json_path = OUT / 'procedimiento.json'
        event.value.save_as(json_path)
        exported = json.loads(json_path.read_text())
        assert exported['version'] == '1.2-DEMO'
        assert exported['sourceText'] == source
        assert len(exported['nodes']) == 5
        assert any(n['id'] == new_id and n['outcome'] == 'escalated' for n in exported['nodes'])
        check_widths(page)
        for control in page.locator('#protocol-form input, #protocol-form select, #protocol-form textarea').all():
            assert control.evaluate('(e)=>e.labels.length>0'), control.get_attribute('id')
        home(page)
        page.reload()
        expect(page.locator('#protocol-list .pnt-item')).to_have_count(1)
        page.locator('#import-json').set_input_files(json_path)
        expect(page.locator('#meta-version')).to_have_value('1.2-DEMO')
        page.locator('#source-text').fill('Texto distinto sin los fragmentos originales.')
        page.locator('#validate').click()
        expect(page.locator('#errors')).to_contain_text('literalmente')
        home(page)
        bad = OUT / 'incorrecto.json'
        bad.write_text('{"schema":999,"nodes":[]}')
        page.locator('#import-json').set_input_files(bad)
        expect(page.locator('#status')).to_contain_text('No se pudo importar')
        print('PASS autoría TXT, grafo y excepción, revisión invalidada al editar, JSON portable, guardado y errores de importación/cita', flush=True)

        for index, name in enumerate(['termolabiles', 'telefarmacia', 'versiones']):
            for positive in [True, False]:
                start_demo(page, index)
                page.locator('#advance').click()
                expect(page.locator('#status')).to_contain_text('Completa todas')
                page.locator('#check-0').focus()
                page.keyboard.press('Space')
                page.locator('#advance').click()
                page.locator('#advance').click()
                expect(page.locator('#status')).to_contain_text('Selecciona una respuesta')
                if not positive:
                    # Cambia una respuesta tras volver atrás y comprueba que no queden registros de la otra rama.
                    page.locator('#answer-0').check()
                    page.locator('#advance').click()
                    page.locator('#back').click()
                page.locator('#answer-0' if positive else '#answer-1').check()
                payload = '<img src=x onerror="window.PWNED=1"> Nota ficticia'
                page.locator('#run-note').fill(payload)
                page.locator('#advance').click()
                if positive:
                    page.locator('#check-0').check()
                    page.locator('#advance').click()
                page.locator('#advance').click()
                expect(page.locator('#run-progress')).to_contain_text('cerrado' if positive else 'derivado')
                assert not page.evaluate('window.PWNED')
                expect(page.locator('#record')).to_contain_text('1.0-DEMO')
                expect(page.locator('#record')).to_contain_text(payload)
                if not positive:
                    assert '[registro]' not in page.locator('#record').inner_text()
                check_widths(page)
                with page.expect_download() as event:
                    page.locator('#export-run').click()
                txt_path = OUT / f'{name}-{positive}.txt'
                event.value.save_as(txt_path)
                text = txt_path.read_text()
                assert 'Origen literal:' in text and '1.0-DEMO' in text
                assert 'He contrastado este paso con el fragmento original.' in text
                assert ('Estado: cerrado documentalmente' if positive else 'Estado: derivado a responsable') in text
                page.evaluate('window.print=()=>{window.printRequested=true;}')
                page.locator('#print-run').click()
                assert page.evaluate('window.printRequested')
                pdf_path = OUT / f'{name}-{positive}.pdf'
                page.pdf(path=str(pdf_path), format='A4', prefer_css_page_size=True, print_background=True)
                pdf_text = '\n'.join(p.extract_text() for p in PdfReader(pdf_path).pages)
                assert 'FarmaPNT' in pdf_text and '1.0-DEMO' in pdf_text and 'Origen literal:' in pdf_text
                assert 'Volver a la biblioteca' not in pdf_text
                assert 'Guardar recorrido local' not in pdf_text
                page.locator('#save-run').click()
                expect(page.locator('#status')).to_contain_text('guardados localmente')
                home(page)
            print(f'PASS {name}: ambas rutas, comprobaciones, respuestas, retroceso, cierre, XSS literal, TXT y PDF', flush=True)

        page.reload()
        expect(page.locator('#run-list .pnt-item')).to_have_count(6)
        page.locator('#run-list .pnt-item').first.get_by_role('button', name='Abrir recorrido').click()
        expect(page.locator('#run-progress')).to_contain_text('derivado')
        home(page)
        start_demo(page, 0)
        page.locator('#check-0').check()
        page.locator('#advance').click()
        page.locator('#save-run').click()
        home(page)
        page.reload()
        page.locator('#run-list .pnt-item').first.get_by_role('button', name='Abrir recorrido').click()
        expect(page.locator('#answer-0')).to_be_visible()
        expect(page.locator('#run-meta')).to_contain_text('1.0-DEMO')
        page.locator('#stop').click()
        expect(page.locator('#run-progress')).to_contain_text('interrumpido')
        page.locator('#save-run').click()
        page.set_viewport_size({'width': 390, 'height': 844})
        page.screenshot(path=str(OUT / 'recorrido-movil.png'), full_page=True)
        home(page)
        page.evaluate("localStorage.setItem('otra-app','conservar')")
        page.locator('#protocol-list .pnt-item').first.get_by_role('button', name='Eliminar', exact=True).click()
        expect(page.locator('#protocol-list')).to_contain_text('No hay procedimientos')
        page.locator('#clear').click()
        expect(page.locator('#run-list')).to_contain_text('No hay recorridos')
        assert page.evaluate("localStorage.getItem('otra-app')") == 'conservar'
        page.evaluate("localStorage.setItem('farmapnt.protocolos.v1','roto')")
        page.reload()
        expect(page.locator('#protocol-list')).to_contain_text('datos dañados')
        page.locator('#clear').click()
        print('PASS recuperación de recorridos activos/cerrados, interrupción, borrado selectivo/total y datos locales dañados', flush=True)

        page.goto(BASE + 'tutorial.html')
        for section in page.locator('section[id^=paso-]').all():
            section.locator('summary').click()
            expect(section.locator('[data-doc]')).to_have_attribute('data-loaded', 'true')
            section.locator('[data-progress]').check()
        expect(page.locator('#tutorial-progress')).to_contain_text('6 de 6')
        page.get_by_role('button', name='Copiar especificación reproducible').click()
        expect(page.locator('#tutorial-status')).to_contain_text('Documento copiado')
        assert 'Prompt reproducible' in page.evaluate('navigator.clipboard.readText()')
        page.get_by_role('button', name='Copiar prompts de auditoría y mejora').click()
        page.wait_for_function("async()=> (await navigator.clipboard.readText()).includes('Prompt de auditoría')")
        page.reload()
        expect(page.locator('#tutorial-progress')).to_contain_text('6 de 6')
        page.locator('#tutorial-reset').click()
        expect(page.locator('#tutorial-progress')).to_contain_text('0 de 6')
        for detail in page.locator('section[id^=paso-] details').all():
            detail.locator('summary').click()
        check_widths(page)
        for link in page.locator('a[href]').all():
            href = link.get_attribute('href')
            resolved = urljoin(page.url, href)
            if urlsplit(resolved).netloc == urlsplit(BASE).netloc:
                assert urlsplit(resolved).path.startswith('/farmaPNT/'), href
                assert context.request.get(resolved).ok, href
        assert not errors, errors
        assert not bad_http, bad_http
        assert not remote, remote
        no_js = browser.new_context(java_script_enabled=False)
        fallback = no_js.new_page()
        fallback.goto(BASE + 'tutorial.html')
        fallback.locator('#paso-1 summary').click()
        expect(fallback.locator('a[href$="01-problema-y-requisitos.md"]')).to_be_visible()
        no_js.close()
        print('PASS tutorial, prompts, progreso, enlaces, teclado, etiquetas, cuatro anchuras y lectura sin JS; sin tráfico externo ni errores JS/HTTP', flush=True)
        browser.close()
finally:
    server.shutdown()
print('Artefactos:', OUT)
