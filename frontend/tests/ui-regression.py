#!/usr/bin/env python3
"""Deterministic UI regression check for the Pocket Lawyer frontend.

Requires the frontend at http://localhost:3000 and a read-only access token
in PL_TOKEN or /tmp/opencode/fe_audit_token.json. Run with:
    python frontend/tests/ui-regression.py
"""
import json
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
TOKEN_FILE = Path("/tmp/opencode/fe_audit_token.json")
USER = {
    "id": "8", "user_id": "8", "accounts_id": "8",
    "email": "demo.free@pocketlawyer.test", "full_name": "Free Demo",
    "name": "Free Demo", "phone": "", "plan": "free", "gender": "",
    "birth_day": "", "language": "", "credit": 0, "is_verified": True,
}
PUBLIC = ["/", "/about", "/services", "/pricing", "/contact"]
AUTHED = ["/dashboard", "/documents", "/settings"]
VIEWPORTS = [(320, 568), (390, 844), (768, 1024), (1024, 768), (1440, 900)]


def token():
    value = os.environ.get("PL_TOKEN")
    if value:
        return value
    if TOKEN_FILE.exists():
        return json.loads(TOKEN_FILE.read_text())["access"]
    print("FAIL: no PL_TOKEN and no /tmp/opencode/fe_audit_token.json")
    sys.exit(2)


def context(browser, authed, width, height):
    ctx = browser.new_context(viewport={"width": width, "height": height})
    if authed:
        tok = token()
        ctx.add_init_script(
            "localStorage.setItem('pl_access_token', %s);"
            "localStorage.setItem('pl_user', %s);"
            % (json.dumps(tok), json.dumps(json.dumps(USER)))
        )
    return ctx


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    failures = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/google-chrome", headless=True)

        # 1. Overflow matrix.
        for width, height in VIEWPORTS:
            ctx = context(browser, True, width, height)
            page = ctx.new_page()
            for route in PUBLIC + AUTHED:
                page.goto(BASE + "/#" + route, wait_until="networkidle")
                page.wait_for_timeout(500)
                size = page.evaluate(
                    "() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})"
                )
                check(size["sw"] <= size["cw"] + 1, f"overflow {width}px {route}: {size}")
            ctx.close()

        # 2. Tailwind CSS compiled (guards the CDN/PostCSS regression).
        ctx = context(browser, True, 390, 844)
        page = ctx.new_page()
        page.goto(BASE + "/#/", wait_until="networkidle")
        has_tw = page.evaluate(
            """() => [...document.styleSheets].some(s => {
                try { return [...s.cssRules].some(r => r.cssText && r.cssText.includes('--tw-')); }
                catch (e) { return false; }
            })"""
        )
        check(has_tw, "Tailwind CSS is not compiled into the page")
        ctx.close()

        # 3. Header collapse.
        ctx = context(browser, True, 390, 844)
        page = ctx.new_page()
        page.goto(BASE + "/#/services", wait_until="networkidle")
        check(page.get_by_label("Open menu").count() == 1, "mobile hamburger missing")
        check(page.locator("header nav").is_hidden(), "desktop nav visible on mobile")
        ctx.close()
        ctx = context(browser, True, 1440, 900)
        page = ctx.new_page()
        page.goto(BASE + "/#/services", wait_until="networkidle")
        check(page.get_by_label("Open menu").is_hidden(), "hamburger visible on desktop")
        check(page.locator("header nav").is_visible(), "desktop nav missing at 1440")
        ctx.close()

        # 4. Bottom nav does not cover the copyright.
        ctx = context(browser, True, 390, 844)
        page = ctx.new_page()
        page.goto(BASE + "/#/", wait_until="networkidle")
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(400)
        bottom = page.evaluate(
            """() => {
                const nav = [...document.querySelectorAll('nav')].find(n => getComputedStyle(n).position === 'fixed' && getComputedStyle(n).display !== 'none');
                const copy = [...document.querySelectorAll('footer div')].find(d => (d.innerText || '').includes('All rights reserved'));
                return {navTop: nav ? Math.round(nav.getBoundingClientRect().top) : null,
                        copyBottom: copy ? Math.round(copy.getBoundingClientRect().bottom) : null};
            }"""
        )
        check(bottom["navTop"] is not None and bottom["copyBottom"] is not None, "nav/copyright not found")
        check(bottom["copyBottom"] < bottom["navTop"], f"bottom nav covers copyright: {bottom}")
        ctx.close()

        # 5. Documents uses real sessions and no fake export/pager.
        ctx = context(browser, True, 390, 844)
        page = ctx.new_page()
        page.goto(BASE + "/#/documents", wait_until="networkidle")
        page.wait_for_timeout(800)
        text = page.locator("main").last.inner_text()
        check("Export PDF" not in text, "fake PDF export still present")
        check("Showing" not in text, "fake pagination still present")
        cards = page.locator('main a[href="#/chat"]').count()
        api_count = page.evaluate(
            """async () => {
                const t = localStorage.getItem('pl_access_token');
                const r = await fetch('/v1/api/assistant/sessions/', {headers: {Authorization: 'Bearer ' + t}});
                return (await r.json()).length;
            }"""
        )
        check(cards == api_count, f"document cards {cards} != sessions {api_count}")
        ctx.close()

        # 6. Dashboard numbers are real and plan label is correct.
        ctx = context(browser, True, 1440, 900)
        page = ctx.new_page()
        page.goto(BASE + "/#/dashboard", wait_until="networkidle")
        page.wait_for_timeout(800)
        body = page.locator("body").inner_text()
        check("Premium Account" not in body, "fake Premium Account label")
        check("Profile Security Health" not in body, "fake security score")
        check("1,250" not in body, "hardcoded AI interactions remain")
        check("Free Plan" in body, "real plan label missing")
        ctx.close()

        # 7. Pricing CTA navigates.
        ctx = context(browser, False, 1440, 900)
        page = ctx.new_page()
        page.goto(BASE + "/#/pricing", wait_until="networkidle")
        check(page.get_by_text("Enterprise").count() == 0, "Enterprise plan still present on pricing")
        page.get_by_text("Get Started Now").first.click()
        page.wait_for_timeout(400)
        check("/register" in page.url, f"pricing guest CTA did not navigate: {page.url}")
        ctx.close()

        # 8. Contact uses the relative shared client; abort to avoid a DB write.
        ctx = context(browser, False, 1440, 900)
        page = ctx.new_page()
        urls = []
        page.route("**/contact-us/submit/", lambda route: (urls.append(route.request.url), route.abort()))
        page.goto(BASE + "/#/contact", wait_until="networkidle")
        page.fill('input[name="name"]', "Test User")
        page.fill('input[name="email"]', "test@example.com")
        page.fill('input[name="subject"]', "Test")
        page.fill('textarea[name="message"]', "Hello")
        page.get_by_text("Send message").click()
        page.wait_for_timeout(600)
        check(urls and urls[0].startswith(BASE + "/v1/api/contact-us/submit/"), f"contact URL wrong: {urls}")
        check(":8001" not in (urls[0] if urls else ""), "contact URL still hardcoded to 8001")
        ctx.close()

        # 9. Auth pages have one logo, one h1, no dead social buttons, no chrome.
        ctx = context(browser, False, 390, 844)
        page = ctx.new_page()
        for route in ["/login", "/register"]:
            page.goto(BASE + "/#" + route, wait_until="networkidle")
            check(page.locator("h1").count() == 1, f"{route}: expected one h1")
            check(page.get_by_text("Google").count() == 0, f"{route}: Google button remains")
            check(page.get_by_text("Facebook").count() == 0, f"{route}: Facebook button remains")
            check(page.locator("header").count() == 0, f"{route}: global header remains")
            check(page.locator("footer").count() == 0, f"{route}: global footer remains")
        ctx.close()

        # 10. Footer has no dead anchors and the year is current.
        ctx = context(browser, True, 1440, 900)
        page = ctx.new_page()
        page.goto(BASE + "/#/", wait_until="networkidle")
        check(page.locator('footer a[href="#"]').count() == 0, "dead footer anchors remain")
        check("2024" not in page.locator("footer").inner_text(), "stale 2024 copyright")
        ctx.close()

        # 11. Error page badge attached to icon; support link stays in the hash router.
        ctx = context(browser, False, 390, 844)
        page = ctx.new_page()
        page.goto(BASE + "/#/no-permission", wait_until="networkidle")
        gap = page.evaluate(
            """() => {
                const badge = [...document.querySelectorAll('div')].find(e => e.textContent.trim() === '403' && e.className.includes('absolute'));
                const icon = badge ? badge.parentElement.querySelector('div') : null;
                return badge && icon ? Math.round(badge.getBoundingClientRect().x - icon.getBoundingClientRect().right) : null;
            }"""
        )
        check(gap is not None and gap <= 8, f"badge is not attached to icon: {gap}")
        check(page.locator('a[href="#/contact"]').count() >= 1, "support link is not a hash route")
        ctx.close()

        # 12. No telemetry or CDN requests, no uncaught errors.
        ctx = context(browser, True, 1440, 900)
        page = ctx.new_page()
        bad = []
        page.on("request", lambda r: bad.append(r.url) if ("127.0.0.1:7242" in r.url or "cdn.tailwindcss.com" in r.url) else None)
        page.on("pageerror", lambda e: bad.append("pageerror: " + str(e)))
        page.goto(BASE + "/#/login", wait_until="networkidle")
        page.wait_for_timeout(500)
        check(not bad, f"bad requests/errors: {bad}")
        ctx.close()

        # 13. No unnamed icon buttons on the measured pages.
        for route in ["/login", "/settings", "/documents"]:
            ctx = context(browser, route != "/login", 1440, 900)
            page = ctx.new_page()
            page.goto(BASE + "/#" + route, wait_until="networkidle")
            unnamed = page.evaluate(
                """() => [...document.querySelectorAll('main button, main a[role="button"]')]
                    .filter(b => {
                        const s = getComputedStyle(b);
                        const r = b.getBoundingClientRect();
                        return s.display !== 'none' && r.width > 1 && r.height > 1;
                    })
                    .filter(b => !(b.innerText || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title'))
                    .length"""
            )
            check(unnamed == 0, f"{route}: {unnamed} unnamed icon buttons")
            ctx.close()

        browser.close()

    print("PASS: 13 UI regression checks")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except AssertionError as exc:
        print("FAIL:", exc)
        sys.exit(1)
