/* eslint-env jest */
import { sandbox } from 'development-sandbox'
import { FileRef, nextTestSetup } from 'e2e-utils'
import path from 'path'

describe('Component Stack in error overlay', () => {
  const { next } = nextTestSetup({
    files: new FileRef(path.join(__dirname, 'fixtures', 'component-stack')),
    dependencies: {
      react: 'latest',
      'react-dom': 'latest',
    },
    skipStart: true,
  })

  it('should show a component stack on hydration error', async () => {
    const { cleanup, session } = await sandbox(next)

    await session.waitForAndOpenRuntimeError()

    // If it's too long we can collapse
    if (process.env.TURBOPACK) {
      expect(await session.getRedboxComponentStack()).toMatchInlineSnapshot(`
        "...
          <InnerLayoutRouter>
            <Mismatch>
              <main>
                <Component>
                  <div>
                    "server"
                    "client""
      `)

      await session.toggleComponentStack()
      expect(await session.getRedboxComponentStack()).toMatchInlineSnapshot(`
        "<InnerLayoutRouter>
          <Mismatch>
            <main>
              <Component>
                <div>
                  <p>
                    "server"
                    "client""
      `)
    } else {
      expect(await session.getRedboxComponentStack()).toMatchInlineSnapshot(`
        "<Mismatch>
          <main>
            <Component>
              <div>
                <p>
                  "server"
                  "client""
      `)
    }

    await cleanup()
  })
})
