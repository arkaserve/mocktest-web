/**
 * QuestionContent — renders a question body that may contain a markdown table.
 *
 * DI questions look like:
 *   Directions: ...
 *   <title line>
 *   | Header | A | B | ... |
 *   |--------|---|---|-----|
 *   | Row    | 1 | 2 | ... |
 *   Q: What is ...?
 *
 * We split the text into ordered blocks (plain text vs. table) and render each
 * in place, so the directions, the table, AND the question line all show — on
 * both the exam screen and the result/explanation screen.
 *
 * Non-table questions (the vast majority) just render as text — unchanged.
 */
export default function QuestionContent({ text, className = '' }) {
  const lines = (text || '').split('\n')

  const blocks = []
  let tbl = []
  const flushTable = () => {
    if (tbl.length >= 1) blocks.push({ type: 'table', rows: tbl.slice() })
    tbl = []
  }
  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      if (!line.includes('---')) tbl.push(line)   // skip the |---| separator row
    } else {
      flushTable()
      if (line.trim()) blocks.push({ type: 'text', text: line })
    }
  }
  flushTable()

  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((b, i) =>
        b.type === 'text' ? (
          <p key={i} className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">{b.text}</p>
        ) : (
          <div key={i} className="overflow-x-auto">
            <table className="text-xs sm:text-sm border-collapse my-1">
              <tbody>
                {b.rows.map((row, ri) => {
                  const cells = row.split('|').filter(c => c.trim() !== '')
                  const isHeader = ri === 0
                  const Tag = isHeader ? 'th' : 'td'
                  return (
                    <tr key={ri}>
                      {cells.map((c, ci) => (
                        <Tag
                          key={ci}
                          className={`border border-gray-300 px-2.5 py-1.5 text-left whitespace-nowrap ${
                            isHeader ? 'bg-gray-100 font-semibold text-gray-800' : 'text-gray-700'
                          }`}
                        >
                          {c.trim()}
                        </Tag>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
