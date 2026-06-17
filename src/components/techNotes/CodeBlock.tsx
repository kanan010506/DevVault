import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Props {
  language: string
  value: string
}

function CodeBlock({ language, value }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="tn-code-block">
      <div className="tn-code-header">
        <span className="tn-code-lang">{language || 'text'}</span>
        <button className="tn-code-copy" onClick={handleCopy}>
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 0.6rem 0.6rem',
          fontSize: '0.825rem',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock