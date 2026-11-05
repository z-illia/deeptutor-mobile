const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const out = '/tmp/m2-completion';
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_EXECUTABLE });
  const results = [];
  try {
    for (const width of [412, 1440]) for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme, reducedMotion: 'reduce' });
      const p = await context.newPage(); const errors = [];
      p.on('pageerror', e => errors.push(e.message));
      p.on('console', m => { if (['warning', 'error'].includes(m.type())) errors.push(m.text()); });
      const button = name => p.getByRole('button', { name, exact: true });
      const text = name => p.getByText(name, { exact: true });
      const choice = async (label, value) => { await button(label).click(); await p.getByTestId('shared-dialog').getByRole('button', { name: value, exact: true }).click(); };
      const fixture = async (mode = 'standard', failure = false) => {
        await p.goto('http://localhost:8092/explore', { waitUntil: 'networkidle' });
        await choice('Fixture principal', mode);
        if (failure) await p.getByRole('switch', { name: 'Fixture operation failure', exact: true }).click();
      };
      await fixture(); await button('/settings/general').click();
      await choice('Interface layout', 'Classic'); await text('Unsaved changes').waitFor();
      await button('Save draft').click(); await text('Draft not applied yet').waitFor();
      await button('Appearance').click(); await p.waitForURL('**/settings/appearance'); await text('Draft not applied yet').waitFor();
      await button('Theme Dark').click(); await button('Apply changes').click(); await text('Applied').waitFor();
      await button('Theme Cream').click(); await button('Discard').click();
      assert.equal(await button('Theme Dark').getAttribute('aria-selected'), 'true');
      await p.screenshot({ path: `${out}/${width}-${colorScheme}-settings.png` });
      await fixture('standard', true); await button('/settings/general').click();
      await choice('Interface layout', 'Classic'); await button('Apply changes').click(); await text('Failed to save').waitFor(); await text('Unsaved changes').waitFor();
      await button('Discard').click();
      await fixture(); await button('/profile').click(); await text('View your account and personalize your avatar').waitFor();
      await button('Avatar moon').click(); await p.waitForFunction(() => document.querySelector('[aria-label="Avatar moon"]')?.getAttribute('aria-selected') === 'true');
      await button('Upload image').click(); await button('color-logo.png · 18 KB').click(); await button('Remove photo').waitFor(); await button('Remove photo').click(); await button('Remove photo').waitFor({state:'hidden'});
      await p.getByLabel('Current password', { exact: true }).fill('fixture-password');
      await p.getByLabel('New password', { exact: true }).fill('changed-password');
      await p.getByLabel('Confirm new password', { exact: true }).fill('changed-password');
      await button('Update password').click(); try {await text('Password updated. Use it the next time you sign in.').waitFor();} catch(e){fs.writeFileSync(out+'/profile-failure.json',JSON.stringify({url:p.url(),body:await p.locator('body').innerText(),inputs:await p.locator('input').evaluateAll(xs=>xs.map(x=>({label:x.getAttribute('aria-label'),value:x.value})))},null,2));throw e;}
      await p.screenshot({ path: `${out}/${width}-${colorScheme}-profile.png` });
      await fixture('standard', true); await button('/space').click(); await p.waitForURL('**/space');
      if (width < 768) await button('Open navigation').click(); await button('WORKSPACE').click();
      await button('Mathematics · A').click(); await text('Could not save the draft. Free browser storage before switching workspaces.').waitFor();
      assert.equal(await button('General workspace').getAttribute('aria-selected'), 'true');
      await p.screenshot({ path: `${out}/${width}-${colorScheme}-workspace-failure.png` });
      await fixture(); await button('/space').click(); await p.waitForURL('**/space');
      if (width < 768) await button('Open navigation').click(); await button('WORKSPACE').click(); await button('Mathematics · A').click();
      await p.getByTestId('shared-dialog').waitFor({state:'hidden'});
      if (width < 768) await button('Open navigation').click(); await button('WORKSPACE').click();
      assert.equal(await button('Mathematics · A').getAttribute('aria-selected'), 'true');
      await fixture('closed'); await button('/register').click(); await text('Create your account').waitFor();
      await p.getByLabel('Email or username', {exact:true}).fill('fixture-new'); await p.getByLabel('Password',{exact:true}).fill('new-password'); await p.getByLabel('Confirm password',{exact:true}).fill('new-password');
      await button('Create account').click(); await text('Registration failed').waitFor();
      assert.equal(await p.getByLabel('Password',{exact:true}).inputValue(),'');
      await button('Sign in').click(); await text('Sign in to your account').waitFor();
      await p.getByLabel('Email or username', {exact:true}).fill('fixture-standard'); await p.getByLabel('Password',{exact:true}).fill('fixture-password'); await button('Sign in').click(); await p.waitForURL('**/chat');
      assert.deepEqual(errors, []); results.push({width,colorScheme,settingsLifecycle:true,settingsFailure:true,profile:true,workspaceFailureRetention:true,workspaceSwitch:true,registrationPolicyRecovery:true,errors});
      fs.writeFileSync(out+'/results.json', JSON.stringify(results,null,2)); await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exitCode=1;});
