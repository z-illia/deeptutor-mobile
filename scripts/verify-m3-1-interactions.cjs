const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);

const baseUrl = process.env.BASE_URL || 'http://localhost:8093';
const outDir = path.resolve(__dirname, '../docs/mobile-ui/verification/M3_1');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_EXECUTABLE,
  });
  const results = [];

  try {
    for (const width of [412, 1440]) {
      for (const colorScheme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme,
          reducedMotion: 'reduce',
        });
        const p = await context.newPage();
        const errors = [];
        p.on('pageerror', (e) => errors.push(e.message));
        p.on('console', (m) => {
          if (['warning', 'error'].includes(m.type())) {
            errors.push(m.text());
          }
        });

        const visible = p.locator(':visible');
        const button = (name) =>
          p.getByRole('button', { name, exact: true }).and(visible);
        const text = (name) => p.getByText(name, { exact: true }).and(visible);
        const choice = async (label, value) => {
          await button(label).first().click();
          await p
            .getByTestId('shared-dialog')
            .getByRole('button', { name: value, exact: true })
            .and(visible)
            .first()
            .click();
        };

        // 1. Configure theme in /explore so Dark/Snow palettes are explicitly rendered
        await p.goto(`${baseUrl}/explore`, { waitUntil: 'networkidle' });
        await button('Reset chat fixtures').click();
        await button(colorScheme === 'dark' ? 'Theme dark' : 'Theme snow').click();

        // 2. Navigate to /chat (MS-CHAT empty state)
        await button('/chat').click();
        await p.waitForURL('**/chat');
        await text('What would you like to learn?').waitFor();

        // Capture empty chat screenshot
        await p.screenshot({
          path: path.join(outDir, `${width}-${colorScheme}-01-chat-empty.png`),
        });

        // 3. Starter suggestions interaction
        await button('Explain').click();
        await button('Explain a concept with everyday examples').click();
        const composer = () =>
          p.getByLabel('Type a message...', { exact: true }).and(visible).last();
        const starterText = await composer().inputValue();
        assert(starterText.includes('Explain a concept to me'));

        // 4. Model selector interaction
        await button('Select model').last().click();
        await text('Choose a model').waitFor();
        await p.screenshot({
          path: path.join(outDir, `${width}-${colorScheme}-02-model-selector.png`),
        });
        await button('Model gpt-4.1').click();
        await text('gpt-4.1').first().waitFor();

        // 5. Send message with [stream] and test Stop generating
        await composer().fill('Derive Euler formula step by step [stream]');
        await button('Send').last().click();
        await p.waitForURL('**/chat/session-local-1');
        await button('Stop generating').last().waitFor();
        await button('Stop generating').last().click();
        await text('Stopped').first().waitFor();

        // 6. Send follow-up message and wait for completion
        await composer().fill('Give a numerical check in Python');
        await button('Send').last().click();
        await text(
          'Tell me which step you would like to test next or edit your message above to explore an alternative branch.',
        )
          .first()
          .waitFor({ timeout: 5000 });
        await button('Send').last().waitFor({ timeout: 5000 });

        await p.screenshot({
          path: path.join(
            outDir,
            `${width}-${colorScheme}-03-chat-conversation.png`,
          ),
        });

        // 7. Navigate to existing branched conversation /chat/session-general-1
        await p.goto(`${baseUrl}/chat/session-general-1`, {
          waitUntil: 'networkidle',
        });
        await text('Fourier transform intuition').first().waitFor();
        await text('1 / 2').waitFor();

        // Switch branch 1 -> 2
        await button('Next branch').click();
        await text('2 / 2').waitFor();
        await text('Three-Point Summary of the Fourier Transform').waitFor();

        // Switch branch 2 -> 1
        await button('Previous branch').click();
        await text('1 / 2').waitFor();

        // Edit user message to create branch 3
        await button('Edit').first().click();
        const editInput = p
          .getByLabel('Edit message input', { exact: true })
          .and(visible)
          .first();
        await editInput.fill('Explain Fourier transform using a prism analogy');
        await button('Send').first().click();
        await text('3 / 3').first().waitFor();

        // 8. Inline rename session title in header
        await button('Click to rename session').first().click();
        await p
          .getByLabel('Session title', { exact: true })
          .and(visible)
          .first()
          .fill('Fourier & Spectral Mastery');
        await button('Save title').first().click();
        await text('Fourier & Spectral Mastery').first().waitFor();

        // 9. Conversation actions menu (deferred M3.2 notice + Archive + Restore)
        await button('Conversation actions').first().click();
        await p.screenshot({
          path: path.join(
            outDir,
            `${width}-${colorScheme}-04-conversation-actions.png`,
          ),
        });
        await button('Save to favorites').first().click();
        await text('Save to favorites — Coming soon (M3.2)').first().waitFor();

        await button('Conversation actions').first().click();
        await button('Archive').first().click();
        await button('Restore archived session').first().waitFor();
        await button('Restore archived session').first().click();
        await button('Restore archived session').first().waitFor({ state: 'hidden' });

        // 10. Navigate to MS-HISTORY (/space/chat-history)
        await button('Chat History').first().click();
        await p.waitForURL('**/space/chat-history');
        await text(
          'Browse, rename, delete, and reopen previous conversations from your learning space.',
        )
          .first()
          .waitFor();

        // Verify renamed session persisted across navigation
        await text('Fourier & Spectral Mastery').first().waitFor();

        await p.screenshot({
          path: path.join(
            outDir,
            `${width}-${colorScheme}-05-chat-history.png`,
          ),
        });

        // Search chat history
        const searchField = p
          .getByLabel('Search chat history...', {
            exact: true,
          })
          .and(visible)
          .first();
        await searchField.fill('Eigenvalues');
        await text('Eigenvalues & eigenvectors practice').first().waitFor();
        await button('Clear search').first().click();

        // Filter by Tutor threads
        await choice('Filter by type', 'Tutor threads');
        await text('Clarifying orthogonality').first().waitFor();
        await choice('Filter by type', 'All conversations');

        // Filter by Archived and verify partitioned buckets + Restore
        await choice('Filter by archive status', 'Archived');
        await text('Laplace transform table review').first().waitFor();
        await text('Completed checkpoint: Matrix rank').first().waitFor();
        await p.screenshot({
          path: path.join(
            outDir,
            `${width}-${colorScheme}-06-archived-history.png`,
          ),
        });
        await button('Restore').first().click();

        // Switch back to Active and reopen conversation
        await choice('Filter by archive status', 'Active');
        await text('Laplace transform table review').first().waitFor();
        await button('Fourier & Spectral Mastery').last().click();
        await p.waitForURL('**/chat/session-general-1');
        await text('Fourier & Spectral Mastery').first().waitFor();

        assert.deepEqual(errors, []);
        results.push({
          width,
          colorScheme,
          emptyChatAndStarters: true,
          modelSelector: true,
          streamAndStop: true,
          branchAndEdit: true,
          renameAndArchive: true,
          historySearchAndFilters: true,
          navigationPersistence: true,
          errors,
        });
        await context.close();
      }
    }
    fs.writeFileSync(
      path.join(outDir, 'interaction-results.json'),
      JSON.stringify(results, null, 2),
    );
    console.log(JSON.stringify({ passed: results.length, results }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
