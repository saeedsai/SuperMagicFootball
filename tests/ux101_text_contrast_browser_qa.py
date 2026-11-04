#!/usr/bin/env python3
"""UX-101 contrast regression for Home, Settings, Controls, HUD and touch actions."""
from pathlib import Path
import re

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
fixture = ROOT / 'tests/.generated/play.html'
assert fixture.exists(), 'Build the current game fixture first'
html = fixture.read_text(encoding='utf-8')
COLOR_RE = re.compile(r'rgba?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)(?:,\s*([\d.]+))?\)')


def colors(css_value):
    values = [
        (float(red) / 255, float(green) / 255, float(blue) / 255, float(alpha or 1))
        for red, green, blue, alpha in COLOR_RE.findall(css_value or '')
    ]
    if values:
        return values
    hex_match = re.fullmatch(r'#([\da-fA-F]{3}|[\da-fA-F]{6})', css_value or '')
    if not hex_match:
        return []
    digits = hex_match.group(1)
    if len(digits) == 3:
        digits = ''.join(char * 2 for char in digits)
    return [tuple(int(digits[i:i + 2], 16) / 255 for i in (0, 2, 4)) + (1,)]


def composite(foreground, background):
    alpha = foreground[3]
    return tuple(foreground[i] * alpha + background[i] * (1 - alpha) for i in range(3))


def luminance(rgb):
    linear = [value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4 for value in rgb]
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2]


def contrast(foreground, background):
    high, low = sorted((luminance(foreground), luminance(background)), reverse=True)
    return (high + .05) / (low + .05)


def measured_style(page, selector, surface_selector=None):
    return page.evaluate('''([selector, surfaceSelector]) => {
      const text = document.querySelector(selector);
      const surface = surfaceSelector ? document.querySelector(surfaceSelector) : text;
      if (!text || !surface) throw new Error(`Missing contrast element: ${selector} / ${surfaceSelector}`);
      const style = getComputedStyle(text), background = getComputedStyle(surface);
      return {color: style.color, fontSize: style.fontSize, fontWeight: style.fontWeight,
        filter: style.filter, backgroundColor: background.backgroundColor, backgroundImage: background.backgroundImage};
    }''', [selector, surface_selector])


def require_text_contrast(label, text_color, background_colors, minimum=4.5, brightness=1):
    foreground = colors(text_color)
    assert foreground, (label, 'computed text color is not RGB', text_color)
    foreground = foreground[0]
    measured = []
    for background in background_colors:
        opaque_bg = background[:3] if background[3] >= 1 else composite(background, (8 / 255, 24 / 255, 43 / 255))
        opaque_bg = tuple(min(1, channel * brightness) for channel in opaque_bg)
        measured.append(contrast(foreground[:3], opaque_bg))
    assert measured and min(measured) >= minimum, (label, f'minimum {min(measured, default=0):.2f}:1 below {minimum}:1', text_color, background_colors)
    return min(measured)


def gradient_stops(style, fallback='#08182b'):
    stops = colors(style['backgroundImage'])
    if not stops:
        stops = colors(style['backgroundColor'])
    if not stops:
        stops = colors(fallback)
    return stops


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
    for device, viewport, touch in [
        ('desktop', {'width': 1280, 'height': 720}, False),
        ('simulated-touch', {'width': 844, 'height': 390}, True),
    ]:
        context = browser.new_context(viewport=viewport, is_mobile=touch, has_touch=touch, forced_colors='none')
        page = context.new_page()
        page.set_content(html, wait_until='load')
        page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        checks = []

        # Quick Match is the emphasized Home card, so check normal, hover, and
        # keyboard-focus colors against both computed gradient stops.
        quick_card = page.locator('.navMainList .navChoice:first-child')
        quick_description = '.navMainList .navChoice:first-child .navCopy small'
        page.mouse.move(viewport['width'] - 2, viewport['height'] - 2)
        page.evaluate('document.activeElement?.blur()')
        home_normal = measured_style(page, quick_description, '.navMainList .navChoice:first-child')
        checks.append(('Home card normal', require_text_contrast('Home card normal', home_normal['color'], gradient_stops(home_normal))))
        quick_card.hover()
        home_hover = measured_style(page, quick_description, '.navMainList .navChoice:first-child')
        checks.append(('Home card hover', require_text_contrast('Home card hover', home_hover['color'], gradient_stops(home_hover))))
        page.mouse.move(viewport['width'] - 2, viewport['height'] - 2)
        quick_card.focus()
        page.keyboard.press('Tab')
        page.keyboard.press('Shift+Tab')
        assert quick_card.evaluate('(node)=>node.matches(\':focus-visible\')'), (device, 'Home card did not enter keyboard focus-visible state')
        home_focus = measured_style(page, quick_description, '.navMainList .navChoice:first-child')
        checks.append(('Home card keyboard focus', require_text_contrast('Home card keyboard focus', home_focus['color'], gradient_stops(home_focus))))

        page.locator('[data-action="navSettings"]').first.click()
        page.locator('[data-action="navGameSettings"]').click()
        settings_label = measured_style(page, '.fieldLabel', '.navSettingsFields')
        checks.append(('Settings field label', require_text_contrast('Settings field label', settings_label['color'], gradient_stops(settings_label))))

        page.keyboard.press('Escape')
        page.locator('[data-action="help"]').click()
        help_text = measured_style(page, '.stat span', '.twoCol .panel')
        checks.append(('Controls help instruction', require_text_contrast('Controls help instruction', help_text['color'], gradient_stops(help_text))))

        page.keyboard.press('Escape')
        page.keyboard.press('Escape')
        placeholder_page = context.new_page()
        placeholder_page.set_content(html, wait_until='load')
        placeholder_page.wait_for_function('!!window.SupermagicFootball?.game', timeout=60000)
        placeholder_page.locator('[data-action="navSettings"]').first.click()
        placeholder_page.locator('[data-action="navCustomization"]').click()
        placeholder_page.locator('[data-action="clubs"]').click()
        club_name = placeholder_page.locator('#clubName')
        club_name.evaluate('(input)=>{input.value=""}')
        placeholder_style = placeholder_page.evaluate('''() => {
          const input=document.querySelector('#clubName');
          const placeholder=getComputedStyle(input,'::placeholder');
          const control=getComputedStyle(input);
          return {color:placeholder.color,opacity:placeholder.opacity,
            backgroundColor:control.backgroundColor,backgroundImage:control.backgroundImage};
        }''')
        placeholder_background = colors(placeholder_style['backgroundColor'])
        assert placeholder_style['opacity'] == '1', (device, 'placeholder must not be additionally dimmed', placeholder_style)
        checks.append(('Create Club name placeholder', require_text_contrast(
            'Create Club name placeholder', placeholder_style['color'], placeholder_background)))

        page.keyboard.press('Escape')
        page.keyboard.press('Escape')
        page.keyboard.press('Escape')
        page.locator('[data-action="navQuick"]').click()
        page.locator('[data-action="navOnDevice"]').click()
        page.locator('[data-action="quick"]').click()
        page.locator('[data-action="kickoff"]').click()

        score = measured_style(page, '#homename', '.scoregroup')
        checks.append(('Match HUD team label', require_text_contrast('Match HUD team label', score['color'], gradient_stops(score))))

        # Ordinary-size labels are checked against both stops of every
        # action gradient, including the brighter active/pressed treatment.
        for action in ('pass', 'shoot', 'dribble', 'jump'):
            selector = f'#touchButtons .round.{action}'
            touch_style = measured_style(page, selector, selector)
            normal_ratio = require_text_contrast(f'{action} touch action', touch_style['color'], gradient_stops(touch_style))
            checks.append((f'{action} normal', normal_ratio))
            page.locator(selector).evaluate('(node)=>node.classList.add("active")')
            active_style = measured_style(page, selector, selector)
            brightness_match = re.search(r'brightness\(([\d.]+)\)', active_style['filter'])
            brightness = float(brightness_match.group(1)) if brightness_match else 1
            active_ratio = require_text_contrast(f'{action} active touch action', active_style['color'], gradient_stops(active_style), brightness=brightness)
            checks.append((f'{action} active', active_ratio))
            page.locator(selector).evaluate('(node)=>node.classList.remove("active")')

        print('UX101_TEXT_CONTRAST_BROWSER_PASS', device, ', '.join(f'{label} {ratio:.2f}:1' for label, ratio in checks), flush=True)
        context.close()
    browser.close()
