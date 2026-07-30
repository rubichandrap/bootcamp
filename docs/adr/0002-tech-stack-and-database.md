# Next.js Frontend, Go RCE Backend, SQLite Database, and MDX Content Architecture

We decided to use:
- **Frontend & App Server**: Next.js (App Router, TypeScript) rendering MDX content, Monaco Editor, and progress routing.
- **Curriculum Content**: File-based MDX and `.go` test files stored in Git (`content/modules/`) for native IDE editing and `go test` local verification.
- **RCE Engine**: Dedicated Go microservice that builds and runs `go test -json` on user submissions in isolated environments.
- **Database**: SQLite (via Drizzle ORM) strictly for storing user progress, completed chapters, code submissions, and execution logs.

