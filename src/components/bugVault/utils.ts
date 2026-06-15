export function getLastSeen(lastSeenAt: string): string {
  const today = new Date()
  const last = new Date(lastSeenAt)
  const days = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Seen today'
  if (days === 1) return 'Seen yesterday'
  return `Seen ${days} days ago`
}

export function detectLanguage(errorMessage: string): string | null {
  const text = errorMessage.toLowerCase()

  // Python
  if (text.includes('traceback (most recent call last)') ||
      text.includes('nameerror') || text.includes('indentationerror') ||
      text.includes('zerodivisionerror') || text.includes('keyerror') ||
      text.includes('modulenotfounderror') ||
      /\bfile ".*\.py"/.test(text)) {
    return 'Python'
  }

  // React (check before generic JS/TS)
  if ((text.includes('uncaught typeerror') || text.includes('referenceerror') ||
       text.includes('cannot read prop') || text.includes('is not a function') ||
       text.includes('cannot update a component')) &&
      (text.includes('jsx') || text.includes('react') || text.includes('usestate') ||
       text.includes('useeffect') || text.includes('hook'))) {
    return 'React'
  }

  // TypeScript
  if (text.includes('.ts:') || text.includes('.tsx:') ||
      /ts\(\d+\)/.test(text) ||
      text.includes("type '") || text.includes('is not assignable to type')) {
    return 'TypeScript'
  }

  // JavaScript
  if (text.includes('uncaught typeerror') || text.includes('uncaught referenceerror') ||
      text.includes('referenceerror') || text.includes('cannot read prop') ||
      text.includes('is not a function') || text.includes('unexpected token') ||
      text.includes('syntaxerror')) {
    return 'JavaScript'
  }

  // Node / Express
  if (text.includes('cannot find module') || text.includes('econnrefused') ||
      text.includes('express') || text.includes('enoent') ||
      text.includes('npm err') || text.includes('node_modules')) {
    return 'Node'
  }

  // Java
  if (text.includes('exception in thread') || text.includes('java.lang.') ||
      text.includes('nullpointerexception') || text.includes('classnotfoundexception') ||
      text.includes('arrayindexoutofboundsexception')) {
    return 'Java'
  }

  // Kotlin
  if (text.includes('kotlin.') || text.includes('.kt:')) {
    return 'Kotlin'
  }

  // C#
  if ((text.includes('system.') && text.includes('exception')) ||
      text.includes('unhandled exception') || text.includes('nullreferenceexception')) {
    return 'C#'
  }

  // C++
  if (text.includes('segmentation fault') || text.includes('std::') ||
      text.includes('terminate called after throwing') ||
      text.includes('undefined reference') || /\.cpp:\d+/.test(text)) {
    return 'C++'
  }

  // C
  if (/\.c:\d+/.test(text) || text.includes('warning: implicit declaration') ||
      text.includes('expected ;') && text.includes('.c')) {
    return 'C'
  }

  // Go
  if (text.includes('panic:') || text.includes('goroutine') ||
      /\.go:\d+/.test(text) || text.includes('nil pointer dereference')) {
    return 'Go'
  }

  // Rust
  if (text.includes('thread \'main\' panicked') || /\.rs:\d+/.test(text) ||
      text.includes('cannot borrow') || text.includes('error[e')) {
    return 'Rust'
  }

  // Ruby
  if (text.includes('nomethoderror') || text.includes('rubygems') ||
      /\.rb:\d+/.test(text) || text.includes('loaderror')) {
    return 'Ruby'
  }

  // PHP
  if (text.includes('fatal error:') && text.includes('.php') ||
      text.includes('parse error:') || text.includes('undefined variable')) {
    return 'PHP'
  }

  // Swift
  if (text.includes('fatal error:') && text.includes('swift') ||
      text.includes('unexpectedly found nil')) {
    return 'Swift'
  }

  // SQL
  if (text.includes('syntax error at or near') || text.includes('sqlstate') ||
      (text.includes('relation') && text.includes('does not exist')) ||
      text.includes('ora-') || text.includes('mysql error')) {
    return 'SQL'
  }

  // HTML
  if (text.includes('<!doctype') || text.includes('unclosed tag') ||
      text.includes('html parsing error')) {
    return 'HTML'
  }

  // CSS
  if ((text.includes('unexpected token') && text.includes('css')) ||
      text.includes('unknown property') || text.includes('invalid css')) {
    return 'CSS'
  }

  // Bash
  if (text.includes('command not found') || text.includes('permission denied') ||
      text.includes('bash:') || text.includes('/bin/sh')) {
    return 'Bash'
  }

  // JSON
  if (text.includes('unexpected token') && text.includes('json') ||
      text.includes('jsondecodeerror') || text.includes('unexpected end of json')) {
    return 'JSON'
  }

  return null
}