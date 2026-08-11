# Project Guidelines & Rules

- **Strict Environment Variables Rule**: NEVER use default fallback values (e.g. `|| 'default_string'`) when importing/reading variables from `import.meta.env`. All environment variable reads must rely strictly on `.env` file definitions without any hardcoded fallback values in the source code.
