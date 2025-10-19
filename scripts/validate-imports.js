const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', 'src')
const exts = ['.js', '.jsx', '.ts', '.tsx']

function walk(dir, cb) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            walk(full, cb)
        } else if (exts.includes(path.extname(entry.name))) {
            cb(full)
        }
    }
}

const issues = []

walk(SRC, (file) => {
    const content = fs.readFileSync(file, 'utf8')
    const lines = content.split(/\r?\n/)
    lines.forEach((line, idx) => {
        if (/\bfrom\s+['"]@\/|import\s+['"]@\/|require\(['"]@\/ /.test(line)) {
            issues.push({ file, line: idx + 1, text: line.trim(), reason: "uses '@/...' alias" })
        }
        if (/from\s+['"].*\/[^'"]+\.(jsx|tsx)\/.*['"]/.test(line) || /import\s+\{?.*\}?\s+from\s+['"].*\.jsx['"]/.test(line)) {
            issues.push({ file, line: idx + 1, text: line.trim(), reason: "import path contains '.jsx' extension or folder" })
        }
        if (/from\s+['"].*\.(js|jsx|ts|tsx)['"]/.test(line)) {
            issues.push({ file, line: idx + 1, text: line.trim(), reason: "import includes file extension (prefer omit)" })
        }
    })
})

if (issues.length === 0) {
    console.log('✅ validate-imports: no obvious import issues found.')
    process.exitCode = 0
} else {
    console.log(`❌ validate-imports: found ${issues.length} potential import issue(s):\n`)
    issues.forEach((it) => {
        console.log(`${it.file}:${it.line} — ${it.reason}`)
        console.log(`  ${it.text}\n`)
    })
    console.log('Suggestions:')
    console.log('- Replace "@/..." imports with relative paths (e.g. ../../shared/components/...)')
    console.log("- Remove file extensions from import paths and avoid directories named with extensions (e.g. 'checkIn.jsx' folder).")
    console.log('- After fixing, run: npm run validate:imports')
    process.exitCode = 1
}
