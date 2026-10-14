"""Navigation helpers for the v0.8.24.7 five-category menu.
Tests use these only to reach the SAME existing gameplay screens as before.
"""
def home(page):
 for _ in range(6):
  if page.locator('.navMainList').count():return
  page.keyboard.press('Escape')
 assert page.locator('.navMainList').count(), 'Unable to navigate to main menu'

def open_quick(page):
 if not page.locator('[data-action="quick"]').count():
  home(page)
  page.locator('[data-action="navQuick"]').click()
  page.locator('[data-action="navOnDevice"]').click()
 page.locator('[data-action="quick"]').first.click()

def open_settings(page,section='game'):
 home(page)
 page.locator('[data-action="navSettings"]').click()
 page.locator(f'[data-action=nav{dict(game="GameSettings",sound="Sound",graphics="Graphics",save="SaveManagement",input="Input",customize="Customization")[section]}]').click()

def open_feature(page,route):
 if page.locator(f'[data-action="{route}"]').count():
  page.locator(f'[data-action="{route}"]').first.click();return
 home(page)
 prefixes={
  'manager':['navCareer'],
  'continents':['navCups','navClubs'],
  'league':['navCups'],
  'playerStudio':['navSettings','navCustomization'],
  'clubs':['navSettings','navCustomization'],
  'editor':['navSettings','navCustomization'],
  'squad':['navSettings','navCustomization'],
  'gallery':['navSettings','navCustomization'],
  'help':['navSettings'],
  'controls':['navSettings','navInput'],
  'pk':['navQuick','navOnDevice'],
  'versus':['navQuick','navOnDevice'],
  'training':['navQuick','navOnDevice'],
 }
 if route not in prefixes:raise ValueError('unknown route '+route)
 for action in prefixes[route]:page.locator(f'[data-action={action}]').first.click()
 page.locator(f'[data-action={route}]').first.click()
